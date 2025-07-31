// API 설정 파일
export const API_CONFIG = {
  // 개발 환경
  development: {
    baseURL: 'http://localhost:3000/api',
    mapBoundsEndpoint: 'http://localhost:3000/api/map-bounds',
  },
  
  // 프로덕션 환경
  production: {
    baseURL: 'https://your-production-api.com/api',
    mapBoundsEndpoint: 'https://your-production-api.com/api/map-bounds',
  }
};

// 현재 환경에 따른 API 설정
const getCurrentEnvironment = () => {
  // __DEV__는 React Native에서 개발 모드인지 확인하는 전역 변수
  return __DEV__ ? 'development' : 'production';
};

export const getApiConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env];
};

// 지도 경계 데이터를 백엔드로 전송하는 함수
export const sendMapBoundsToBackend = async (bounds, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // 사용자 토큰이 있다면 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await fetch(config.mapBoundsEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        bounds,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: 'react-native',
          version: '1.0.0'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 백엔드 전송 성공!');
    console.log('📡 서버 응답:', result);
    return result;
  } catch (error) {
    console.error('❌ 지도 경계 전송 실패:', error.message);
    console.error('🔗 API 엔드포인트:', config.mapBoundsEndpoint);
    throw error;
  }
}; 