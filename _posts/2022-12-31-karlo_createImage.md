---
title: "[ Karlo / AI / 인공지능 ] 칼로 API 사용법, 칼로 API 사용, 칼로 API 사용하기, Karlo API 사용, Karlo API 사용, Karlo API 사용하기, 카카오 AI, 카카오 AI 사용하기, 카카오 AI 사용"
excerpt: ""
header: ""

categories:
    - IT
tags:
    - [AI, 인공지능, 칼로 API 사용법, 칼로 API 사용, 칼로 API 사용하기, Karlo API 사용, Karlo API 사용, Karlo API 사용하기, 카카오 AI, 카카오 AI 사용하기, 카카오 AI 사용]
last_modified_at: 2022-12-31
---

<br><br>

ㅁ. 카카오(브레인)의 그림인공지능인 칼로(KARLO) OPEN API를 사용해보겠다.

<br><br>

1.  z최근에 카카오에서 Dev 신규API 사용 가이드가 메일로 오게 되어서 포스팅을 시작하게 되었다. 
![](/upload/karlo/01_createImage/00.png)


2. 카카오 개발사이트로 접속해서 로그인 > 문서 탭을 누른다.
``developers.kakao.com``
![](/upload/karlo/01_createImage/01.png)


3. 아래쪽으로 내려서 '인공지능API 가이드' 부분에 KARLO를 누른다.
![](/upload/karlo/01_createImage/02.png)


4. 'REST API' 를 눌러 사용법을 확인한다.
![](/upload/karlo/01_createImage/03.png)


5. 스크롤을 아래서 내려 '이미지생성하기' 부분으로 칼로API를 사용 해 보자. 
![](/upload/karlo/01_createImage/04.png)

6. 코드(로직)는 카카오에서 알려준 아래 링크로 사용해보자.<br>

```py
# REST API 호출, 이미지 파일 처리에 필요한 라이브러리
import requests
import json
import io
import base64
from PIL import Image

# [내 애플리케이션] > [앱 키] 에서 확인한 REST API 키 값 입력
REST_API_KEY = '${REST_API_KEY}'

# 이미지 생성하기 요청
def t2i(text, batch_size=1):
    r = requests.post(
        'https://api.kakaobrain.com/v1/inference/karlo/t2i',
        json = {
            'prompt': {
                'text': text,
                'batch_size': batch_size
            }
        },
        headers = {
            'Authorization': f'KakaoAK {REST_API_KEY}',
            'Content-Type': 'application/json'
        }
    )
    # 응답 JSON 형식으로 변환
    response = json.loads(r.content)
    return response

# Base64 디코딩 및 변환
def stringToImage(base64_string, mode='RGBA'):
    imgdata = base64.b64decode(str(base64_string))
    img = Image.open(io.BytesIO(imgdata)).convert(mode)
    return img

# 프롬프트에 사용할 제시어
text = "A lake, alpine, vivid"

# 이미지 생성하기 REST API 호출
response = t2i(text, 1)

# 응답의 첫 번째 이미지 생성 결과 출력하기
result = stringToImage(response.get("images")[0].get("image"), mode='RGB')
result.show()

```

7. 기본으로 제시된 상황()으로 이미지를 생성 해 보자.
![](/upload/karlo/01_createImage/05.png)

8. 똑같은 값으로 이미지를 재 생성하면 다른 이미지를 그려준다.
![](/upload/karlo/01_createImage/06.png)

9. 다른 값(Start, bundle, universe)로 그림을 그려보자.
![](/upload/karlo/01_createImage/07.png)

10. 한번 더 그려보면 역시 다른 이미지로 그려지는 것을 확인 할 수 있다.
![](/upload/karlo/01_createImage/08.png)

11. 오픈API 여서 그런지 1일 횟수제한이 있는 것 같다.
![](/upload/karlo/01_createImage/09.png)
