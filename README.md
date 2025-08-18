# GeoMemo - 위치 기반 메모 앱

GeoMemo는 사용자가 특정 위치에 메모를 남기고, 지도를 통해 메모를 탐색할 수 있는 React Native 기반 모바일 애플리케이션입니다.

## 주요 기능

### 위치 기반 메모
- 현재 위치에 메모 작성 및 저장
- GPS 좌표 기반 메모 위치 지정
- 지도에서 메모 위치 시각화

### 지도 기능
- React Native Maps를 활용한 인터랙티브 지도
- Google Maps API 연동
- 지도 경계 추적 및 백엔드 동기화

### 소셜 기능
- 사용자 프로필 관리
- 팔로우/팔로잉 시스템
- 공개/비공개 메모 설정
- 다른 사용자의 메모 스크랩

### 사용자 인터페이스
- 슬라이드 패널을 통한 직관적인 네비게이션
- 애니메이션 효과가 적용된 UI
- 반응형 디자인

## 기술 스택

### 프론트엔드
- **React Native** 0.79.5
- **Expo** 53.0.20
- **React Navigation** 7.x
- **React Native Maps** 1.20.1

### 주요 라이브러리
- **Axios** - HTTP 클라이언트
- **AsyncStorage** - 로컬 데이터 저장
- **Expo Location** - 위치 서비스
- **Expo Sensors** - 센서 데이터 (자기장계)
- **Expo Image Picker** - 이미지 선택
- **React Native AWS3** - S3 업로드

### 개발 도구
- **Metro** - 번들러
- **Babel** - JavaScript 컴파일러

## 플랫폼 지원

- **Android** - API 21+ 지원
- **Web** - React Native Web을 통한 웹 지원

## 시작하기

### 필수 요구사항
- Node.js 18+
- Expo CLI
- Android Studio (Android 개발용)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone [repository-url]
cd GeoMemo-Frontend
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 시작**
```bash
npm start
```

4. **플랫폼별 실행**
```bash
# Android
npm run android

# Web
npm run web
```

## 환경 설정

### API 키 설정
`app.json`에서 Google Maps API 키를 설정해야 합니다:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### 환경 변수
`.env` 파일을 생성하여 필요한 환경 변수를 설정하세요:

```env
API_BASE_URL=your_api_base_url
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
```

## 프로젝트 구조

```
GeoMemo-Frontend/
├── android/                 # Android 네이티브 코드
├── assets/                  # 앱 아이콘 및 이미지
├── src/                     # 소스 코드
│   ├── config/             # API 설정 및 유틸리티
│   ├── Navigation/         # 네비게이션 설정
│   ├── Screens/            # 화면 컴포넌트
│   │   ├── Auth/          # 인증 관련 화면
│   │   ├── Main/          # 메인 화면 (지도, 홈)
│   │   ├── MemoManage/    # 메모 관리 화면
│   │   ├── Profile/       # 프로필 및 사용자 관리
│   │   └── Setting/       # 설정 화면
│   └── utils/             # 유틸리티 함수
├── App.js                  # 메인 앱 컴포넌트
├── app.json               # Expo 설정
├── eas.json               # EAS Build 설정
├── index.js               # 앱 진입점
├── package.json           # 의존성 및 스크립트
└── README.md              # 프로젝트 문서
```

## 주요 화면

### 인증
- **Login.js** - 사용자 로그인
- **SignUp.js** - 회원가입
- **EmailVerification.js** - 이메일 인증

### 메인 기능
- **Home.js** - 메인 화면 (지도 + 메모 목록)
- **MapSection.js** - 지도 컴포넌트
- **AddMemo.js** - 메모 작성

### 메모 관리
- **AllMemo.js** - 전체 메모 목록
- **ThisMemo.js** - 개별 메모 상세보기
- **MemoManager.js** - 메모 관리

### 프로필
- **MyProfile.js** - 내 프로필
- **OtherProfile.js** - 다른 사용자 프로필
- **ScrapMemo.js** - 스크랩한 메모

## API 구조

### 백엔드 연동
- CloudFront를 통한 CDN 서비스
- RESTful API 엔드포인트
- JWT 기반 인증
- S3 이미지 업로드 지원

### 주요 API
- `POST /api/memo/` - 메모 생성
- `GET /api/memo/` - 메모 조회
- `POST /api/map-bounds` - 지도 경계 전송

## 개발 가이드

### 코드 스타일
- 함수형 컴포넌트 사용
- React Hooks 활용
- ES6+ 문법 사용
- 일관된 네이밍 컨벤션 준수

### 상태 관리
- React의 useState, useEffect 등 기본 Hooks 사용
- AsyncStorage를 통한 로컬 데이터 저장
- Context API 활용 고려

### 네비게이션
- React Navigation 7.x 사용
- 스택 네비게이션과 탭 네비게이션 조합
- 화면 간 데이터 전달 시 route.params 활용

### 에러 처리
- try-catch 구문을 통한 적절한 에러 핸들링
- 사용자에게 명확한 에러 메시지 제공
- 네트워크 오류 및 권한 오류 처리

## 테스트 방법

### 개발 환경 테스트
```bash
# 개발 서버 시작
npm start

# Android 에뮬레이터에서 실행
npm run android

# 웹 브라우저에서 실행
npm run web
```

### 실기기 테스트
1. Expo Go 앱 설치 (Google Play Store)
2. 개발 PC와 같은 Wi-Fi 네트워크 연결
3. QR 코드 스캔하여 앱 실행

### 주요 테스트 포인트
- 위치 권한 요청 및 처리
- 지도 로딩 및 마커 표시
- 메모 작성 및 저장
- 사용자 인증 플로우
- 이미지 업로드 기능

## 트러블슈팅

### 일반적인 문제들

**Metro 번들러 오류**
```bash
# 캐시 클리어
npx expo start --clear
```

**Android 빌드 오류**
```bash
# Gradle 캐시 클리어
cd android
./gradlew clean
cd ..
```

**의존성 충돌**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

**위치 권한 문제**
- Android Manifest에서 권한 확인
- 런타임 권한 요청 코드 확인

### 디버깅 팁
- React Native Debugger 사용
- console.log를 통한 로깅
- Expo DevTools 활용
- Chrome DevTools로 웹 디버깅

## 배포

### EAS Build
```bash
# Android APK 빌드
eas build --platform android
```

### 앱 스토어 배포
- Google Play Store

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**GeoMemo** - 위치와 함께하는 스마트한 메모 앱
