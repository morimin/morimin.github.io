---
title: "[ Linux / 리눅스 ] Crontab 로그 설정 / 크론탭 날자 로그 / Crontab 날짜 로그 설정"
excerpt: ""
header: ""

categories:
    - IT
tags:
    - [LINUX, Linux, Crontab, 크론탭, 크론탭 시간설정, 크론탭 로그, 크론탭 설정, 크론탭 로그, crontab log, crontab every 5 minutes, 크론탭 반복주기, 크론탭 주기]
last_modified_at: 2022-12-14
---

<br><br>

ㅁ 크론탭 반복주기 설정방법
```
분 시 일 월 요일 명령어 > 로그위치/로그파일이름 2>&1(에러출력)
```

ㅁ 크론탭 반복주기 설정 예시<br>
```
30 9 * * 2-6 python3 /opt/Dev/testtt.py > /opt/logs/test_`date "+\%y\%m\%d"`.log 2>&1 
```

<br>

ㅁ 설정 해석<br>
``
평일(월-금) 오전09시 30분 testt.py 실행 후 에러포함하여 로그 매번 남겨라
``

<br>

ㅁ 화면 예시
![](/upload/os/crontab_config.png)

<br>

ㅁ 수행 결과 
![](/upload/os/crontab_config02.png)
