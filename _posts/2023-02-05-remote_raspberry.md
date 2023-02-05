---
title: "[ RBPi ] 라즈베리파이 화면접속 / 원격접속하기 / remote Raspberry pi / 라즈베리파이 원격접속 / 라즈베리파이 화면원격 feat. mac m1"
excerpt: ""
header: ""

categories:
    - IT
tags:
    - [RASPBERRYPI, 라즈베리파이, 라즈베리파이 화면접속, 원격접속하기, remote Raspberry pi, 라즈베리파이 원격접속, 라즈베리파이 화면원격, 라즈베리파이 remote, microsoft remote Desktop for raspberry pi]
last_modified_at: 2023-02-05
---

<br><br>

ㅁ. 본인피시에서 라즈베리파이 화면으로 원격접속하는 방법을 알아보자.

<br><br>

1. 라즈베리파이에 터미널 접속하여 원격접속을 위한 라이브러리를 설치한다.

```py
sudo apt-get install xrdp

```

<br>


2. 중간에 계속할건지 물어보면 'Y' 를 눌러 설치를 진행한다.
![](/upload/raspberryPi/01_remoteDesktop/00.png)

<br>

3. 설치되는중
![](/upload/raspberryPi/01_remoteDesktop/01.png)

<br>

4. 아래처럼 나오면 설치가 완료된다.
![](/upload/raspberryPi/01_remoteDesktop/02.png)

<br>

5. 앱스토어에 접속하여 'remote' 로 검색하면 'Microsoft Remote Desktop' 을 다운받는다.
![](/upload/raspberryPi/01_remoteDesktop/03.png)

<br>

6. 열기버튼을 눌러서, 'Add PC' 를 눌러 라즈베리파이를 추가해보자.
![](/upload/raspberryPi/01_remoteDesktop/04.png)

<br>

7. 'PC name' 항목에 라즈베리파이 IP를 입력한다.
![](/upload/raspberryPi/01_remoteDesktop/05.png)

<br>

8. 라즈베리파이 접속이 준비됐다. 클릭해보자.
![](/upload/raspberryPi/01_remoteDesktop/06.png)

<br>

9. 접속을 계속할건지 물어보는데, 'Connect' 를 눌러 진행하자.
![](/upload/raspberryPi/01_remoteDesktop/07.png)

<br>

10. 라즈베리파이 접속을 위한 'ID', 'PW'를 입력한다.
(대부분 기본ID인 pi를 많이들 사용한다.)
![](/upload/raspberryPi/01_remoteDesktop/08.png)

<br>

11. 제대로 접속된 모습을 확인 할 수 있다.
![](/upload/raspberryPi/01_remoteDesktop/09.png)

<br>
