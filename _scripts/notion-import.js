const { Client } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md")
const moment = require("moment")
const moment_timezone = require("moment-timezone")
const path = require("path")
const fs = require("fs")

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})


// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  // ensure directory exists
  const root = `_posts`

  const databaseId = process.env.DATABASE_ID
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      "and": [
        {
          property: "공개",
          checkbox: {
            equals: true,
          },
        },
      ],
    },
  })
  for (const r of response.results) {
    const id = r.id
    
    // date
    let date = moment(r.created_time).format("YYYY-MM-DD");
    let pdate = r.properties?.["날짜"]?.["date"]?.["start"];
    if (pdate) {
      date = moment(pdate).format("YYYY-MM-DD");
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
    
    let header = `---
title: ${title}
excerpt : ""
header : ""
categories : 
    - ${cats}
tags : 
    - ${tags}
last_modified_at : ${date}
---`
    "<br><br>"
    
    const folderPath = ${root}
    fs.mkdirSync(folderPath, { recursive: true })

    const mdBlocks = await n2m.pageToMarkdown(id)
    let body = n2m.toMarkdownString(mdBlocks)["parent"]


    //writing to file
    const fTitle = `${date}-${title}.md`
    fs.writeFile(path.join(folderPath, fTitle), header + body, (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
})()
