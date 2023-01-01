---
title: "[ KoGPT / AI / 인공지능 ] KoGPT API 사용법, KoGPT API 사용, KoGPT API 사용하기, KoGPT API 사용, KoGPT API 사용, KoGPT API 사용하기, 카카오 AI, 카카오 AI 사용하기, 카카오 AI 사용, 카카오 GPT, 카카오 챗봇, 카카오 인공지능"
excerpt: ""
header: ""

categories:
    - IT
tags:
    - [AI, 인공지능, KoGPT API 사용법, KoGPT API 사용, KoGPT API 사용하기, KoGPT API 사용, KoGPT API 사용, KoGPT API 사용하기, 카카오 AI, 카카오 AI 사용하기, 카카오 AI 사용, 카카오 GPT, 카카오 챗봇, 카카오 인공지능, GPT, KoGPT]
last_modified_at: 2023-01-01
---

<br><br>

ㅁ. 카카오(브레인)의 GPT-3 기반의 한국어 모델인 KoGPT OPEN API를 사용해보겠다.

<br><br>

1․ 최근에 카카오에서 Dev 신규API 사용 가이드가 메일로 오게 되어서 포스팅을 시작하게 되었다. 
![](/upload/koGPT/01_summary/00.png)

<br>

2․ 카카오 개발사이트로 접속해서 로그인 > 문서 탭을 누른다.<br>
[https://developers.kakao.com](https://developers.kakao.com)
![](/upload/koGPT/01_summary/01.png)

<br>

3․ 아래쪽으로 내려서 '인공지능API 가이드' 부분에 'KoGPT' 를 누른다.
![](/upload/koGPT/01_summary/02.png)

<br>

4․ 'REST API' 를 눌러 사용법을 확인한다.
![](/upload/koGPT/01_summary/03.png)

<br>

5․ 스크롤을 아래서 내려 '뉴스 한 줄 요약하기' 부분으로 KoGPT API를 사용 해 보자. 
![](/upload/koGPT/01_summary/04.png)

<br>

6․ 코드(로직)는 카카오에서 알려준 아래 링크로 사용해보자.

```py
# coding=utf8
# REST API 호출에 필요한 라이브러리
import requests
import json

# [내 애플리케이션] > [앱 키] 에서 확인한 REST API 키 값 입력
REST_API_KEY = '${REST_API_KEY}'

# KoGPT API 호출을 위한 메서드 선언
# 각 파라미터 기본값으로 설정
def kogpt_api(prompt, max_tokens = 1, temperature = 1.0, top_p = 1.0, n = 1):
    r = requests.post(
        'https://api.kakaobrain.com/v1/inference/kogpt/generation',
        json = {
            'prompt': prompt,
            'max_tokens': max_tokens,
            'temperature': temperature,
            'top_p': top_p,
            'n': n
        },
        headers = {
            'Authorization': 'KakaoAK ' + REST_API_KEY,
            'Content-Type': 'application/json'
        }
    )
    # 응답 JSON 형식으로 변환
    response = json.loads(r.content)
    return response

# KoGPT에게 전달할 명령어 구성
prompt = '''인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던'''

# 파라미터를 전달해 kogpt_api()메서드 호출
response = kogpt_api(
    prompt = prompt,
    max_tokens = 32,
    temperature = 1.0,
    top_p = 1.0,
    n = 3
)

print(response)

```   

<br>

7․ 요약할 기사는 최근 금융위에서 내용을 기반으로 요약해보자.<br>
※ 기사 원문 : [https://sedaily.com/NewsView/26F3AZEIF5](https://sedaily.com/NewsView/26F3AZEIF5)
![](/upload/koGPT/01_summary/05.png)   

<br>

8․ 한 줄 요약된 내용을 확인한다.
![](/upload/koGPT/01_summary/06.png)
<br>
※ 출력결과 :<br>
```
29일 금융위원회와 금융감독원은 '2021년 상반기 은행권 기술금융실적 평가' 결과 대형 은행 중 농협은행이, 소형 은행 중 부산은행이 각각 1·2위를 차지했다고 밝혔다.
```

<br>

9․ 결론 : 
숫자등은 잘 맞지 않지만 핵심 내용은 잘 파악하는 것 같다. 한줄요약 웹페이지 만들어서 회사 회의록 요약기능을 만들어 봐야겠다. :)
