const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function escapeCodeBlock(body) {
  const regex = /```([\s\S]*?)```/g
  return body.replace(regex, function (match, htmlBlock) {
    return "{% raw %}\n```\n" + htmlBlock + "\n```\n{% endraw %}";
  })
}

function replaceTitleOutsideRawBlocks(body) {
  const rawBlocks = [];
  const placeholder = "%%RAW_BLOCK%%";
  body = body.replace(/{% raw %}[\s\S]*?{% endraw %}/g, (match) => {
    rawBlocks.push(match);
    return placeholder;
  });

  const regex = /\n#[^\n]+\n/g;
  body = body.replace(regex, function (match) {
    return "\n" + match.replace("\n#", "\n##");
  });

  rawBlocks.forEach(block => {
    body = body.replace(placeholder, block);
  });

  return body;
}

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  // ensure directory exists
  const root = "_posts";
  fs.mkdirSync(root, { recursive: true });

  // 오늘 날짜(한국 시간 기준)
  const today = moment().utcOffset(9 * 60).format("YYYY-MM-DD");
  // 이미지 다운로드 작업 모음 (모두 끝난 뒤 종료)
  const downloads = [];

  const databaseId = process.env.DATABASE_ID;
  let response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "배포",
      checkbox: {
        equals: true,
      },
    },
  });

  const pages = response.results;
  while (response.has_more) {
    const nextCursor = response.next_cursor;
    response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: nextCursor,
      filter: {
        property: "배포",
        checkbox: {
          equals: true,
        },
      },
    });
    pages.push(...response.results);
  }

  for (const r of pages) {
    const id = r.id;
    // date
    let date = moment(r.created_time).format("YYYY-MM-DD");
    let pdate = r.properties?.["날짜"]?.["date"]?.["start"];
    if (pdate) {
      date = moment(pdate).format("YYYY-MM-DD");
    }
    // 예약 발행: '날짜'가 오늘(KST)보다 미래면 이번에는 건너뜀
    if (date > today) {
      console.log(`[예약] ${date} 발행 예정이라 건너뜀: ${id}`);
      continue;
    }
    // title
    let title = id;
    let ptitle = r.properties?.["게시물"]?.["title"];
    if (ptitle?.length > 0) {
      title = ptitle[0]?.["plain_text"];
    }
    // tags
    let tags = [];
    let ptags = r.properties?.["태그"]?.["multi_select"];
    for (const t of ptags) {
      const n = t?.["name"];
      if (n) {
        tags.push(n);
      }
    }
    // categories
    let cats = [];
    let pcats = r.properties?.["카테고리"]?.["multi_select"];
    for (const t of pcats) {
      const n = t?.["name"];
      if (n) {
        cats.push(n);
      }
    }
    // assortment
    let assrtmnt = [];
    let passrtmnt = r.properties?.["구분"]?.["multi_select"];
    for (const t of passrtmnt) {
      const n = t?.["name"];
      if (n) {
        assrtmnt.push(n);
      }
    }
    
    // frontmatter
    let fmtags = "";
    let fmcats = "";
    let fmassrtmnt = "";
    if (tags.length > 0) {
      fmtags += "[";
      for (const t of tags) {
        fmtags += t + ", ";
      }
      fmtags += "]";
    }
    // if (cats.length > 0) {
    //   fmcats += "[";
    //   for (const t of cats) {
    //     fmcats += t + ", ";
    //   }
    //   fmcats += "]";
    // }
    if (cats.length > 0) {
      for (const t of cats) {
        fmcats = t ;
      }
    }
    if (assrtmnt.length > 0) {
      fmassrtmnt += "[";
      for (const t of assrtmnt) {
        fmassrtmnt += t ;
      }
      fmassrtmnt += "]";
    }
    const fm = `---
title: "${fmassrtmnt} ${title}"
excerpt: ""
header: ""

categories:
    - ${fmcats}
tags:
    - ${fmtags}
last_modified_at: ${date}
comments: true
---
<br><br>
`;
    const mdblocks = await n2m.pageToMarkdown(id);
    let body = n2m.toMarkdownString(mdblocks)["parent"];
    if (body === "") {
      continue;
    }
    body = escapeCodeBlock(body);
    body = replaceTitleOutsideRawBlocks(body);

    const ftitle = `${date}-${title.replaceAll(" ", "_")}.md`;

    let index = 0;
    let edited_md = body.replace(
      /!\[(.*?)\]\((.*?)\)/g,
      function (match, p1, p2, p3) {
        // const dirname = path.join("assets/img", ftitle);
        const dirname = path.join("upload", ftitle);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        const filename = path.join(dirname, `${index}.png`);

        downloads.push(
          axios({
            method: "get",
            url: p2,
            responseType: "stream",
          })
            .then(function (response) {
              return new Promise((resolve, reject) => {
                const file = fs.createWriteStream(`${filename}`);
                response.data.pipe(file);
                file.on("finish", resolve);
                file.on("error", reject);
              });
            })
            .catch(function (error) {
              console.log(`이미지 다운로드 실패: ${p2}`, error.message);
            })
        );

        let res;
        if (p1 === "") res = "";
        else res = `_${p1}_`;

        return `![${index++}](/${filename})${res}`;
      }
    );

    //writing to file
    fs.writeFileSync(path.join(root, ftitle), fm + edited_md);
  }

  await Promise.all(downloads);
  console.log(`완료: 글 ${pages.length}개 확인, 이미지 ${downloads.length}개 처리`);
})();
