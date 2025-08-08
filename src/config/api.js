// API 설정 파일
export const API_CONFIG = {
  // 개발 환경 (로컬 모의 서버)
  development: {
    baseURL: 'http://175.202.152.66:3001/api',
    mapBoundsEndpoint: 'http://175.202.152.66:3001/api/map-bounds',
    memosEndpoint: 'http://175.202.152.66:3001/api/memos',
  },
  
  // 프로덕션 환경 (실제 DB 서버)
  production: {
    baseURL: 'https://your-production-api.com/api',
    mapBoundsEndpoint: 'https://your-production-api.com/api/map-bounds',
    memosEndpoint: 'https://your-production-api.com/api/memos',
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

// 메모 생성 함수 (API 명세서에 맞춤)
export const createMemo = async (memoData, userToken = 'test-token') => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(config.memosEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(memoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 메모 생성 성공!');
    console.log('📡 서버 응답:', result);
    return result;
  } catch (error) {
    console.error('❌ 메모 생성 실패:', error.message);
    console.error('🔗 API 엔드포인트:', config.memosEndpoint);
    throw error;
  }
};

// 메모 목록 조회 함수
export const getMemos = async (page = 1, limit = 10, userToken = 'test-token') => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.memosEndpoint}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 메모 목록 조회 성공!');
    return result;
  } catch (error) {
    console.error('❌ 메모 목록 조회 실패:', error.message);
    console.error('🔗 API 엔드포인트:', config.memosEndpoint);
    throw error;
  }
};

// 메모 상세 조회 함수
export const getMemoById = async (memoId, userToken = 'test-token') => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.memosEndpoint}/${memoId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 메모 상세 조회 성공!');
    return result;
  } catch (error) {
    console.error('❌ 메모 상세 조회 실패:', error.message);
    console.error('🔗 API 엔드포인트:', `${config.memosEndpoint}/${memoId}`);
    throw error;
  }
};

// 메모 삭제 함수 (POST 메서드)
export const deleteMemo = async (memoId, userToken = 'test-token') => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/memo/delete/${memoId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 메모 삭제 성공!');
    console.log('📡 서버 응답:', result);
    return result;
  } catch (error) {
    console.error('❌ 메모 삭제 실패:', error.message);
    console.error('🔗 API 엔드포인트:', `${config.baseURL}/memo/delete/${memoId}`);
    throw error;
  }
};

// 메모 수정 함수 (API 명세서에 맞춤)
export const updateMemo = async (memoId, updateData, userToken = 'test-token') => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.memosEndpoint}/${memoId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 메모 수정 성공!');
    console.log('📡 서버 응답:', result);
    return result;
  } catch (error) {
    console.error('❌ 메모 수정 실패:', error.message);
    console.error('🔗 API 엔드포인트:', `${config.memosEndpoint}/${memoId}`);
    throw error;
  }
}; 