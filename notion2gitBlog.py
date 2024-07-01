from datetime import datetime
from pytz import timezone
from glob import glob
import os
import shutil
import zipfile
import re
import argparse


yfm = """---
layout: post
title: {}
subtitle: {}
author: useok
banner:
  image: assets/images/banners/home.jpeg
  opacity: 0.618
  background: "#000"
  height: "40vh"
  min_height: "10vh"
  heading_style: "font-size: 2.5rem; font-weight: bold;"
  subheading_style: "color: gold"
categories: [{}]
tags: [{}]
sidebar: [article-menu,category-list] 
---
"""

parser = argparse.ArgumentParser()
parser.add_argument("--title", "-t", type=str, default="",help="title")
parser.add_argument("--subtitle", "-s", type=str, default="",help="subtitle")
parser.add_argument("--categories", "-c", type=str, default="",help="categories")
parser.add_argument("--tags", "-tag", type=str, default="",help="tags")
args,_ = parser.parse_known_args()



def notion2gitblog(title:str, subtitle:str, categories:str, tags:str):
    # date & fileName #
    fileName = datetime.now(timezone("Asia/seoul")).strftime("%Y-%m-%d-%H%M%S-")+re.sub("&"," ",title)+".md"

    # notion2gitblog, exportNotionPage, {username}.github.io 디렉토리가가 있는 경로의 부모 디렉토리
    parDir = os.path.abspath(os.path.join(os.getcwd(),os.pardir))


    ##### unzip & remove zip file #####
    # notion에서 export 한 zip 파일 경로
    zip_path = glob(parDir+"/exportNotionPage/*.zip")[0]

    # 압축 해제
    notion_zip = zipfile.ZipFile(zip_path)
    notion_zip.extractall(parDir+"/exportNotionPage")
    notion_zip.close()

    # zip 파일 삭제
    os.remove(zip_path)


    ##### 경로 이동 #####
    # 이미지 폴더 경로
    # folder_path = glob(parDir+"/exportNotionPage/*[!.md]") #glob 표현식이 잘못된건지 .md 파일을 제외한 디렉토리를 인식하지 못하는 경우 발견. 밑의 코드로 교체
    folder_path = [sorted(glob(parDir+"/exportNotionPage/*"))[0]]

    #폴더를 블로그 내부 경로로 이동
    if folder_path == []:
        pass # 이미지 폴더가 없다면 pass
    else:
        # 이미지 폴더를 블로그 내부 경로로 이동
        img_path = glob(parDir+"/[!notion2gitblog|!exportNotionPage]*")[0]+"/assets/images/postImages/{}".format(fileName[:-3])
        shutil.move(folder_path[0], img_path)

        # 폴더 조회를 위한 폴더처음 %Y-%m-%d-%H%M%S 문자
        createTime = "-".join(img_path.split('/')[-1].split('-')[:4])

        # 폴더 안 이미지를 순서대로 정렬 [Untitled.png, Untitled 1.png, Untitled 2.png, ...]
        sorted_img_path = sorted(glob(os.path.abspath(os.path.join(img_path,os.pardir))+"/{}*/*".format(createTime)))
        ordered_li = list(map(lambda x : x.split('/')[-1].split('.')[0][9:], sorted_img_path))
        ordered_li[-1] = '0'
        ordered_li = list(map(int,ordered_li))
        sorted_img_path = sorted(sorted_img_path, key=lambda x: dict(zip(sorted_img_path,ordered_li))[x])


    # md 파일 경로
    md_path = glob(parDir+"/exportNotionPage/*md")[0]

    # md 파일 읽기
    with open(md_path) as f:
        text = f.read()
    
    # md 파일 삭제
    os.remove(md_path)


    ########## md 파일 수정 ##########
    # md 파일에서 작성된 이미지 첨부 문자 조회
    start = [x.start() for x in re.finditer("!\[Untitled\]\(",text)] # 이미지 첨부 문자 시작 위치
    end = [x.end() for x in re.finditer("png[)]",text)] # 이미지 첨부 문자 끝 위치
    old_path_li = [text[start[x]:end[x]] for x in range(len(start))] 


    # md 파일에서 첨부된 이미지를 변경된 이미지의 경로로 변환
    try:
        for i in range(len(start)): 
            text = text.replace(old_path_li[i], "![Untitled]("+"/"+"/".join(sorted_img_path[i].split('/')[-5:])+")")
    except:
        print("이미지 없음")
        pass


    # 내 테마에서만 그런건지 모르겠지만, header가 ## 부터 시작함. # 하나를 추가
    header_1 = [x.start() for x in re.finditer("^#\s",text)]
    if header_1[0] == 0:
        text = re.sub("^#\s", "## ", text) #노션페이지 최상단 header1
    else:
        pass

    text = re.sub("\n[^#]###\s","\n\n#### ",text)
    text = re.sub("\n[^#]##\s","\n\n### ",text)
    text = re.sub("\n[^#]#\s","\n\n## ",text)


    # 숫자 리스트 사이에 개행이 세 줄이고, 세 줄 안에 텍스트가 있으면 숫자 증가가 안 되는 문제
    text = re.sub("\n\n(\d)", "\n<br><br>\\1", text)


    # aside 적용이 안 됨. aside 태그를 하이라이트로 변경
    text = re.sub("<aside>", "```", text)
    text = re.sub("</aside>", "```", text)


    ##### 테이블 안의 문자 중 개행 문자가 있으면 테이블이 그려지지 않는 문제 #####
    # 각 테이블의 첫 행 시작지점
    f = [x.start() for x in re.finditer("\n\n\|",text)]
    f = list(map(lambda x : x+2, f))

    # 각 테이블의 마지막 행 끝지점
    vb = [x.start() for x in re.finditer(" \|",text)]
    vb = list(map(lambda x: x+1, vb))
    if len(f) == 0:
        pass
    elif len(f) == 1:
        l1 = vb[-1]
    else:
        for i in range(len(f)-1):
            globals()['l{}'.format(i+1)] = [x if (x<f[i+1]) & (x>=f[i]) else 0 for x in vb]
            globals()['l{}'.format(i+1)] = sorted(globals()['l{}'.format(i+1)],reverse=True)[:sorted(globals()['l{}'.format(i+1)],reverse=True).index(0)][0]
        globals()['l{}'.format(i+2)] = vb[-1]

    # 각 테이블의 시작과 끝
    for i in range(len(f)):
        globals()["t{}".format(i+1)] = text[f[i]:globals()["l{}".format(i+1)]+1]
    
    # 각 테이블의 끝에 개행 붙여줌
    for i in range(len(f)):
        text = text.replace(globals()["t{}".format(i+1)],globals()["t{}".format(i+1)]+"\n")


    # 테이블 내부의 개행 표시를 <br> 태그로 바꿔줌
    for i in range(len(f)):
        text = text.replace(globals()["t{}".format(i+1)], re.sub("([^|])\n", "\\1<br>", globals()["t{}".format(i+1)]))

    ##### /테이블 안의 문자 중 개행 문자가 있으면 테이블이 그려지지 않는 문제 #####


    # yfm 
    global yfm
    yfm = yfm.format(title, subtitle, categories, tags)
    text = yfm + text


    ########## /md 파일 수정 ##########


    # .../_posts 디렉토리에 변경된 md파일 저장
    with open(glob(parDir+"/[!notion2gitblog|!exportNotionPage]*")[0]+"/_posts/"+fileName,'w') as f:
        f.write(text)


if __name__ == "__main__":
    notion2gitblog(args.title, args.subtitle, args.categories, args.tags)
