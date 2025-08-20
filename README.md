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

### 인사이트 및 분석
- 주간 감정 분포 분석
- 육각형 레이더 차트를 통한 감정 시각화
- 감정별 메모 통계 (기쁨, 놀람, 분노, 불안, 상처, 슬픔)
- AI 기반 주간 인사이트 제공
- 감정 데이터 기반 사용자 패턴 분석

### 사용자 인터페이스
- 슬라이드 패널을 통한 직관적인 네비게이션
- 애니메이션 효과가 적용된 UI
- 반응형 디자인
- **Safe Area 지원**: 노치, 상태바, 홈 인디케이터 등 시스템 UI와의 안전한 거리 확보
- **Edge-to-Edge 모드**: Android 12+ (API 31+) 지원으로 현대적인 UI 경험 제공

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
- **react-native-safe-area-context** - Safe Area 관리
- **expo-status-bar** - StatusBar 제어

### 개발 도구
- **Metro** - 번들러
- **Babel** - JavaScript 컴파일러

## 플랫폼 지원

- **Android** - API 21+ 지원 (API 31+에서 Edge-to-Edge 모드 지원)
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

### Safe Area 및 StatusBar 설정
앱은 자동으로 Safe Area를 처리하며, Android의 Edge-to-Edge 모드를 지원합니다:

```json
{
  "expo": {
    "androidStatusBar": {
      "translucent": true,
      "backgroundColor": "transparent",
      "barStyle": "dark-content"
    },
    "androidNavigationBar": {
      "backgroundColor": "#FFFFFF",
      "barStyle": "dark-content"
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
│       └── SafeScreen.js  # Safe Area 관리 컴포넌트
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
- **Insight.js** - 사용자 인사이트 및 감정 분석
- **FollowRequest.js** - 팔로우 요청 관리
- **UserSearch.js** - 사용자 검색
- **MemoView.js** - 메모 상세 보기

## Safe Area 및 StatusBar 관리

### SafeScreen 컴포넌트
모든 화면에서 일관된 Safe Area 처리를 위해 `SafeScreen` 컴포넌트를 사용합니다:

```javascript
import SafeScreen from '../../utils/SafeScreen';

export default function MyScreen() {
  return (
    <SafeScreen>
      <StatusBar style="dark" translucent={true} />
      {/* 화면 내용 */}
    </SafeScreen>
  );
}
```

### 주요 특징
- **자동 Safe Area 처리**: 노치, 상태바, 홈 인디케이터와의 안전한 거리 자동 계산
- **Edge-to-Edge 지원**: Android 12+에서 현대적인 UI 경험 제공
- **일관된 StatusBar**: 모든 화면에서 동일한 StatusBar 스타일 적용
- **반응형 레이아웃**: 다양한 디바이스 크기와 Safe Area에 자동 대응

### 적용된 화면
- ✅ Login.js
- ✅ SignUp.js
- ✅ Home.js
- ✅ MemoManager.js
- ✅ MyProfile.js
- ✅ SettingsHome.js
- ✅ FollowManage.js
- ✅ FollowRequest.js
- ✅ UserSearch.js
- ✅ AddMemo.js
- ✅ MemoView.js

## API 구조

### 백엔드 연동
- CloudFront를 통한 CDN 서비스
- RESTful API 엔드포인트
- JWT 기반 인증
- S3 이미지 업로드 지원

### 주요 API
- `POST /api/memo/` - 메모 생성
- `GET /api/memo/` - 메모 조회
- `POST /api/memo/all` - 지도 경계 전송
- `GET /api/mq/insights/{userId}` - 사용자 인사이트 조회

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

### Safe Area 처리
- 모든 화면에서 `SafeScreen` 컴포넌트 사용
- `expo-status-bar`의 `StatusBar` 컴포넌트 활용
- `translucent={true}` 설정으로 Edge-to-Edge 모드 지원

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
- 인사이트 데이터 로딩 및 차트 표시
- 감정 분석 데이터 시각화
- **Safe Area 처리**: 노치, 상태바 영역에서 UI가 잘리지 않는지 확인
- **Edge-to-Edge 모드**: Android 12+ 디바이스에서 현대적인 UI 경험 확인

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

**Safe Area 관련 문제**
```bash
# Safe Area 관련 라이브러리 재설치
npm install react-native-safe-area-context
npx expo install expo-status-bar
```

### 디버깅 팁
- React Native Debugger 사용
- console.log를 통한 로깅
- Expo DevTools 활용
- Chrome DevTools로 웹 디버깅
- **Safe Area Inspector**: Expo DevTools에서 Safe Area 영역 시각화

## 배포

### EAS Build
```bash
# Android APK 빌드
eas build --platform android
```

### 앱 스토어 배포
- Google Play Store

## 인사이트 기능 상세 설명

### 감정 분석 시스템
GeoMemo는 사용자가 작성한 메모의 감정을 분석하여 주간 인사이트를 제공합니다.

#### 감정 분류
- **기쁨** - 긍정적이고 즐거운 감정
- **놀람** - 예상치 못한 상황에 대한 반응
- **분노** - 화나거나 짜증나는 감정
- **불안** - 걱정이나 긴장감
- **상처** - 마음에 상처를 받은 감정
- **슬픔** - 우울하거나 슬픈 감정

#### 시각화 기능
- **육각형 레이더 차트**: 6가지 감정을 육각형 형태로 표시
- **감정별 통계**: 각 감정의 발생 빈도를 숫자로 표시
- **그리드 시스템**: 배경 육각형 그리드를 통한 직관적인 비교
- **반응형 디자인**: 다양한 화면 크기에 최적화된 차트

#### 데이터 처리
- **실시간 업데이트**: 화면 포커스 시 자동 데이터 새로고침
- **풀-투-리프레시**: 사용자 수동 새로고침 지원
- **에러 핸들링**: 네트워크 오류 및 데이터 부재 상황 처리
- **로딩 상태**: 데이터 로딩 중 사용자 피드백 제공

### 기술적 특징
- **React Native 최적화**: 네이티브 성능을 활용한 부드러운 애니메이션
- **SVG 기반 차트**: 정확한 기하학적 계산을 통한 차트 렌더링
- **메모리 효율성**: useCallback과 useFocusEffect를 통한 최적화
- **접근성**: 색맹 사용자를 고려한 색상 대비 및 텍스트 라벨

## 최근 업데이트

### Safe Area 및 StatusBar 개선 (2024)
- **SafeScreen 컴포넌트 도입**: 모든 화면에서 일관된 Safe Area 처리
- **Edge-to-Edge 모드 지원**: Android 12+ (API 31+)에서 현대적인 UI 경험
- **StatusBar 통합 관리**: `expo-status-bar`를 통한 일관된 StatusBar 스타일
- **반응형 레이아웃**: 다양한 디바이스의 Safe Area에 자동 대응

### 적용된 화면
모든 주요 화면에 SafeScreen 컴포넌트가 적용되어 노치, 상태바, 홈 인디케이터와의 안전한 거리를 자동으로 확보합니다.

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**GeoMemo** - 위치와 함께하는 스마트한 메모 앱
