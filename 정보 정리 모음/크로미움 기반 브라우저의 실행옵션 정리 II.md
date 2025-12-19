# 크로미움 기반 브라우저의 실행옵션 정리 II

```--help					사용 가능한 옵션 목록을 출력

--version				브라우저 버전 정보 출력

--no-first-run				최초 실행 시 초기 설정 마법사를 건너뜀

--incognito				시크릿(비공개) 모드로 실행

--guest					게스트 모드로 실행

--user-data-dir="경로"			사용자 데이터(프로필) 폴더 경로 지정

--profile-directory="Profile 2"		특정 프로필로 실행

--disable-extensions			확장 프로그램 비활성화

--disable-plugins			플러그인 비활성화

--disable-gpu				GPU 가속 비활성화

--start-maximized			시작 시 창을 최대화

--start-fullscreen			전체 화면 모드로 시작

--kiosk					키오스크 모드 (UI 숨기고 전체화면으로 실행)

--app="https://example.com"		지정한 웹사이트를 앱 모드로 실행 (주소창 숨김)

--new-window "URL"			새 창에서 URL 열기

```

---

# 네트워크 관련


```--proxy-server="http=127.0.0.1:8080"		지정 프록시 서버 사용

--proxy-bypass-list="*.local;192.168.*.*"	프록시 제외 목록 설정

--no-proxy-server				프록시 서버 사용하지 않음

--host-resolver-rules="MAP example.com 127.0.0.1"	DNS 매핑 강제 지정

--ignore-certificate-errors			SSL 인증서 오류 무시

--disable-web-security				동일 출처 정책(CORS) 비활성화 (개발용 주의⚠️)

```

---

# 개발 및 디버깅

```--remote-debugging-port=9222		원격 디버깅 포트 열기

--auto-open-devtools-for-tabs		탭 열 때마다 개발자 도구 자동 실행

--enable-logging --v=1			콘솔 로그 활성화 (stdout 출력)

--js-flags="--expose-gc"		JavaScript V8 엔진 플래그 전달

--enable-benchmarking			벤치마킹 관련 기능 활성화

--enable-automation			자동화 도구(예: Selenium)용 플래그

```

---

# UI / 렌더링 관련

```--force-dark-mode			다크 모드 강제 적용

--high-dpi-support=1 --force-device-scale-factor=1.5	DPI 스케일 비율 강제 지정

--window-size=1280,720			시작 창 크기 지정

--window-position=0,0			창 위치 지정

--hide-scrollbars			스크롤바 숨김

--disable-infobars			“자동화된 테스트 중” 등의 정보 표시 숨김

```

---

# 기타 유용한 옵션

```--restore-last-session			마지막 세션 복원

--mute-audio				오디오 출력 비활성화

--disable-background-networking		백그라운드 네트워크 활동 차단

--no-sandbox				샌드박스 비활성화 (보안 위험, 자동화용으로만 사용)

--disable-dev-shm-usage			Docker등 공유 메모리 문제 회피용

--enable-features=FeatureName		특정 실험적 기능 활성화

--disable-features=FeatureName		특정 실험적 기능 비활성화

```

---


# 외 다수....... ㅁ자정리의 분

---