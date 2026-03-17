# mealbot_insta

NEIS Open API를 통해 능주고등학교 급식 정보를 가져와 인스타그램 피드용 이미지로 자동 생성하고, 지정된 시간에 인스타그램에 자동 업로드하는 봇(Bot) 프로젝트입니다.

## 주요 기능

- **실시간 급식 정보 파싱**: NEIS API를 호출하여 조식, 중식, 석식 데이터를 가져옵니다.
- **이미지 자동 생성**: `Satori`와 `Sharp`를 사용해 React 컴포넌트(`<MealCard />`) 기반의 깔끔한 카드 UI를 `.jpg` 이미지로 렌더링합니다.
- **인스타그램 자동 업로드**: Python의 인스타그램 API 라이브러리를 활용해 생성된 1~3장의 이미지(조식/중식/석식)를 슬라이드 형태로 업로드합니다.
- **스케줄러 봇 지원**: `node-schedule`을 기반으로 매일 지정된 시간(오후 10시)에 내일의 급식 메뉴를 자동으로 업로드합니다.

## 요구 사항

- Node.js 22+
- pnpm
- Python 3.x (인스타그램 업로드 스크립트용, `.venv` 또는 시스템 파이썬)

## 환경 변수 설정 (.env)

프로젝트 루트 경로에 `.env` 파일을 생성하고 인스타그램 계정 정보 및 학교정보를 입력합니다.

```env
ID=INSTA_ID
PASSWORD=INSTA_PASSWORD
NEIS_ATPT_OFCDC_SC_CODE=NEIS_ATPT_OFCDC_SC_CODE
NEIS_SD_SCHUL_CODE=NEIS_SD_SCHUL_CODE
DISCORD_WEBHOOK_URL=DISCORD_WEBHOOK_URL
```

`DISCORD_WEBHOOK_URL`은 선택사항입니다. 설정하면 에러/종료시와 업로드 성공시 알림을 받을 수 있습니다.

_미설정시 `mealbot-monitor`앱이 errored라고 뜨는것은 정상입니다_

## 설치 및 실행

패키지 설치

```bash
pnpm install
```

가상환경 설정 및 패키지 설치

- linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install instagrapi
```

- window(CMD)

```bash
python3 -m venv .venv
.venv\Scripts\activate
pip install instagrapi
```

## 실행 스크립트

```bash
# 오늘자 급식 사진 즉시 업로드
pnpm run once
# 내일자 급식 사진 즉시 업로드
pnpm run onceto
# 스케줄러 봇 시작(pm2 시작)
pnpm run start
#봇 리로드
pnpm run reload
# 봇 종료
pnpm run stop
# 봇 재시작
pnpm run restart
# pm2 앱 삭제
pnpm run delete
# 빌드 후 스케줄러 봇 시작
pnpm run bstart
# 이미지 생성만 단독 테스트
pnpm run generate
# 로컬에서 세션 정보 생성
python.exe .\src\generate_session.py
```

- 실행 완료 후 생성된 이미지는 `output/` 폴더에서 확인할 수 있습니다.
- 로그는 화면 콘솔 및 `logs/combined.log`, `logs/error.log` 파일에 저장됩니다.
- 세션 정보를 생성 후 이를 이용하여 초기 로그인을 진행 할 수 있습니다.(선택)

## 대시보드

이 프로젝트는 봇의 실행 상태 및 최근 로그(업로드 기록, 에러 로그)를 쉽게 확인할 수 있도록 Express 기반의 간이 대시보드를 제공합니다. PM2로 실행 시(`pnpm run bstart`) 대시보드 서버도 함께 구동됩니다.

**접근 방법**

- 로컬 환경: 브라우저에서 `http://localhost:3000` 접속
- GCP 등 외부 서버:
    1. 클라우드 방화벽(Firewall) 설정에서 포트 `3000` (또는 지정한 포트)의 인바운드(수신) 트래픽을 허용(Allow) 처리해야 합니다.
    2. 브라우저에서 `http://[서버의_외부_IP]:3000` 으로 접속하여 대시보드를 확인합니다.

_(포트 번호는 환경 변수 `.env`에 `PORT=원하는포트번호`를 입력하여 변경할 수 있습니다. 기본값은 3000입니다.)_

## Authors

- [charlie-1126](https://github.com/charlie-1126)
- [bmcyver](https://github.com/bmcyver)
