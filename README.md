# GeoMemo-Frontend (Expo / React Native)

위치·시간과 연동된 감정/메모 데이터를 기록하고 시각화하는 **모바일 프런트엔드 앱**입니다. Expo(Managed) 워크플로를 사용합니다.

## 주요 기능

* 장소/시간/감정 기록 화면
* 타임라인·지도 기반 시각화
* 백엔드(FastAPI 등)와 REST API 연동
* EAS Build를 통한 Android/iOS 빌드

---

## 프로젝트 구조

```
.
├─ android/
├─ assets/
├─ src/
├─ App.js
├─ app.json
├─ eas.json
├─ index.js
└─ package.json
```

---

## 사전 준비

* Node.js LTS(권장 v18+), npm 또는 pnpm
* Android Studio(에뮬레이터) / macOS의 경우 Xcode(iOS 시뮬레이터)
* (선택) EAS CLI: `npm i -g eas-cli`

---

## 빠른 시작

```bash
# 1) 클론 & 설치
git clone https://github.com/2025-OSS-Project/GeoMemo-Frontend.git
cd GeoMemo-Frontend
npm install

# 2) 개발 서버 실행
npx expo start

# 3) 디바이스 실행
# 안드로이드 에뮬레이터
npx expo run:android
# iOS 시뮬레이터(macOS)
npx expo run:ios
```

> 실기기에서 테스트 시, PC와 기기가 같은 네트워크에 있어야 합니다.

---

## 환경 변수(.env) 및 백엔드 연결

### 권장: `EXPO_PUBLIC_` 접두 사용

아래 파일을 루트에 생성하세요.
에뮬레이터에서 호스트(개발 PC)의 `localhost`는 **`10.0.2.2`** 입니다.

`./.env.development`

```env
EXPO_PUBLIC_API_BASE=http://10.0.2.2:8000
```

`./.env.production`

```env
EXPO_PUBLIC_API_BASE=https://api.example.com
```

코드 사용 예시 (`src/api/client.ts`)

```ts
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? "http://10.0.2.2:8000";
```

> 실기기 테스트 시엔 `http://<개발PC LAN IP>:8000`으로 변경하세요.

---

## NPM 스크립트(권장)

`package.json`에 아래를 추가하면 편합니다.

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "clean": "expo start --clear"
  }
}
```

---

## 빌드 & 배포(EAS)

```bash
# 1) 로그인(또는 EXPO_TOKEN 사용)
eas login

# 2) 빌드 설정 초기화(최초 1회)
eas build:configure

# 3) 프로덕션 빌드
eas build --platform android --profile production
eas build --platform ios --profile production
```

> 서명/프로파일은 EAS 가이드에 따라 1회 설정해 두면 이후 자동화가 수월합니다.

---

## GitHub Actions — EAS 빌드 파이프라인(옵션)

1. GitHub 저장소 **Settings → Secrets and variables → Actions → New repository secret**에서
   `EXPO_TOKEN`(Expo 계정 토큰) 등록
2. 아래 워크플로 파일 생성

`.github/workflows/eas-build.yml`

```yaml
name: EAS Build (Frontend)

on:
  push:
    branches: [ main, dev ]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            ~/.cache/expo
            ~/.cache/eas
          key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
          restore-keys: ${{ runner.os }}-npm-

      - name: Setup Expo & EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - run: npm ci

      # 필요 시 .env 파일을 환경별로 주입하거나, EAS Vars를 사용하세요.
      # 예: eas env:pull --environment preview --path .env

      - name: EAS Build (Android)
        run: eas build --platform android --profile preview --non-interactive --wait

      # iOS도 함께 빌드하려면 아래 주석 해제
      # - name: EAS Build (iOS)
      #   run: eas build --platform ios --profile preview --non-interactive --wait
```

---

## 트러블슈팅 요약

* **Android 에뮬레이터에서 백엔드 접속 실패**: `localhost` 대신 `10.0.2.2` 사용
* **포트 충돌/캐시 문제**: `npm run clean` 또는 `expo start --clear`
* **실기기 연결 불가**: PC와 기기를 동일 Wi-Fi에 연결, 방화벽/회사망 프록시 확인

---

## 라이선스

이 프로젝트는 조직 정책에 따라 라이선스를 명시합니다. (`LICENSE` 파일 참고)

---

## 기여

이슈 생성 → 브랜치(`feature/*`) → PR → 리뷰 승인 후 머지
PR 템플릿/코드 스타일/커밋 컨벤션은 팀 규칙에 따릅니다.

---

필요하시면 다음 순서로 **Backend → AI**도 같은 방식으로 “복붙용 README”를 만들어 드리겠습니다.
