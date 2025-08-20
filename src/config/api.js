// API 설정 파일
import axios from 'axios';

// 회원가입 관련 오류코드 상수
export const USER_ERROR_CODES = {
  // 필수 입력값 누락
  USR_001: 'USR_001',
  // 유효하지 않은 이메일 형식
  USR_002: 'USR_002',
  // 비밀번호 형식 오류
  USR_003: 'USR_003',
  // 이미 존재하는 사용자명 (중복 아이디)
  USR_004: 'USR_004',
  // 이미 사용 중인 이메일
  USR_005: 'USR_005',
  // 닉네임 길이 초과
  USR_006: 'USR_006',
  // 전화번호 형식 오류
  USR_007: 'USR_007',
  // 서버 내부 오류
  USR_999: 'USR_999'
};

// 오류코드별 사용자 친화적인 메시지
export const USER_ERROR_MESSAGES = {
  [USER_ERROR_CODES.USR_001]: '필수 입력값이 누락되었습니다 (사용자명, 비밀번호 등)',
  [USER_ERROR_CODES.USR_002]: '유효하지 않은 이메일 형식입니다',
  [USER_ERROR_CODES.USR_003]: '비밀번호 형식이 올바르지 않습니다 (너무 짧거나 조건 미달)',
  [USER_ERROR_CODES.USR_004]: '이미 존재하는 사용자명입니다 (중복 아이디)',
  [USER_ERROR_CODES.USR_005]: '이미 사용 중인 이메일입니다',
  [USER_ERROR_CODES.USR_006]: '닉네임 길이가 제한을 초과했습니다',
  [USER_ERROR_CODES.USR_007]: '전화번호 형식이 올바르지 않습니다',
  [USER_ERROR_CODES.USR_999]: '서버 내부 오류가 발생했습니다 (DB 문제 등)'
};

export const API_CONFIG = {
  // 개발 환경 (새로운 백엔드 서버)
  development: {
    baseURL: 'https://dco69dhctdpt.cloudfront.net/api',
    mapBoundsEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/map-bounds',
    memosEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/memo/',
    presignedUrlEndpoint: 'https://dco69dhctdpt.cloudfront.net/generate-presigned-get-url',
  },
  
  // 프로덕션 환경 (새로운 백엔드 서버)
  production: {
    baseURL: 'https://dco69dhctdpt.cloudfront.net/api',
    mapBoundsEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/map-bounds',
    memosEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/memo/',
    presignedUrlEndpoint: 'https://dco69dhctdpt.cloudfront.net/generate-presigned-get-url',
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

    // API 전송 시에만 좌표를 7자리로 포맷팅
    const formatCoordinate = (coord) => coord ? parseFloat(coord.toFixed(7)) : coord;
    
    const formattedBounds = {
      ...bounds,
      // bounds 객체의 모든 좌표값을 7자리로 포맷팅
      ...(bounds.northWest && {
        northWest: {
          latitude: formatCoordinate(bounds.northWest.latitude),
          longitude: formatCoordinate(bounds.northWest.longitude)
        }
      }),
      ...(bounds.southEast && {
        southEast: {
          latitude: formatCoordinate(bounds.southEast.latitude),
          longitude: formatCoordinate(bounds.southEast.longitude)
        }
      }),
      // 기존 형식 지원 (lat1, lon1, lat2, lon2)
      ...(bounds.lat1 && { lat1: formatCoordinate(bounds.lat1) }),
      ...(bounds.lon1 && { lon1: formatCoordinate(bounds.lon1) }),
      ...(bounds.lat2 && { lat2: formatCoordinate(bounds.lat2) }),
      ...(bounds.lon2 && { lon2: formatCoordinate(bounds.lon2) })
    };

    const response = await fetch(config.mapBoundsEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        bounds: formattedBounds,
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
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('지도 경계 전송 성공');
    }
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('지도 경계 전송 실패:', error.message);
    }
    throw error;
  }
};

// Presigned URL 생성 함수 (비공개 S3 이미지 접근용)
export const generatePresignedGetUrl = async (fileUrl, userToken = null) => {
  const config = getApiConfig();
  const qs = `file_url=${encodeURIComponent(fileUrl)}`;
  const url = `${config.presignedUrlEndpoint}?${qs}`;

  try {
    const headers = {};
    if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

    const res = await fetch(url, { method: 'GET', headers });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${body}`);
    }

    const raw = await res.text();               // 서버가 "..."(따옴표 포함)로 줄 수 있음
    let out = raw.trim();

    // JSON 문자열이면 파싱
    try {
      const maybe = JSON.parse(raw);
      if (typeof maybe === 'string') out = maybe;      // "https://..." → https://...
      else if (maybe && typeof maybe === 'object' && maybe.url) out = maybe.url;
    } catch { /* 그냥 텍스트였던 경우 통과 */ }

    // 혹시 따옴표가 남아있으면 제거
    out = out.replace(/^"+|"+$/g, '');

    if (!/^https?:\/\//i.test(out)) {
      throw new Error(`Invalid presigned url: ${out}`);
    }
    return out;
  } catch (err) {
    console.error('❌ Presigned GET URL 생성 실패:', err.message, '\n➡️ 요청 URL:', url);
    throw err;
  }
};

// 메모 생성 함수 (API 명세서에 맞춤)
export const createMemo = async (memoData, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await fetch(config.memosEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(memoData)
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('서버 에러 응답:', errorData);
        }
        
        // 에러 메시지 추출 로직 개선
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          if (__DEV__) {
            console.error('서버 텍스트 응답:', errorText);
          }
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('메모 생성 실패:', error.message);
    }
    throw error;
  }
};

// 메모 목록 조회 함수
export const getMemos = async (page = 1, limit = 10, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      // 개발 환경에서만 토큰 사용 정보 출력
      if (__DEV__) {
        console.log('메모 목록 조회에 토큰 사용');
      }
    } else {
      // 개발 환경에서만 경고 출력
      if (__DEV__) {
        console.warn('메모 목록 조회에 토큰이 없음');
      }
    }

    // 개발 환경에서만 조회 정보 출력
    if (__DEV__) {
      console.log('메모 목록 조회 시작:', { page, limit, hasToken: !!userToken });
    }

    const response = await fetch(`${config.memosEndpoint}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // 404 에러는 메모가 없다는 의미이므로 빈 배열 반환
      if (response.status === 404) {
        if (__DEV__) {
          console.log('메모가 없습니다');
        }
        return {
          success: true,
          data: [],
          message: '메모가 없습니다'
        };
      }
      
      // 204 No Content도 메모가 없다는 의미
      if (response.status === 204) {
        if (__DEV__) {
          console.log('메모가 없습니다 (204 No Content)');
        }
        return {
          success: true,
          data: [],
          message: '메모가 없습니다'
        };
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('서버 에러 응답:', errorData);
        }
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('메모 목록 조회 실패:', error.message);
    }
    throw error;
  }
};

// 전체 메모 조회 함수 (지도 경계 기반)
export const getAllMemos = async (userToken = null, viewSetting = 'all') => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      // 개발 환경에서만 토큰 사용 정보 출력
      if (__DEV__) {
        console.log('전체 메모 조회에 토큰 사용');
      }
    } else {
      // 개발 환경에서만 경고 출력
      if (__DEV__) {
        console.warn('전체 메모 조회에 토큰이 없음');
      }
    }

    // API 명세서에 맞춰 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      view_setting: viewSetting
    });

    // config 사용으로 일관성 유지
    const url = `${config.memosEndpoint}all?${queryParams}`;

    // 개발 환경에서만 조회 정보 출력
    if (__DEV__) {
      console.log('전체 메모 조회 요청:', { viewSetting, hasToken: !!userToken });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('서버 에러 응답:', errorData);
        }
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('전체 메모 조회 성공:', { count: result.data?.length || 0, viewSetting });
    }
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('전체 메모 조회 실패:', error.message);
    }
    throw error;
  }
};

// 메모 상세 조회 함수
export const getMemoById = async (memoId, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      // 개발 환경에서만 토큰 사용 정보 출력
      if (__DEV__) {
        console.log('메모 상세 조회에 토큰 사용');
      }
    } else {
      // 개발 환경에서만 경고 출력
      if (__DEV__) {
        console.warn('메모 상세 조회에 토큰이 없음');
      }
    }

    const url = `${config.memosEndpoint}${memoId}`;
    // 개발 환경에서만 조회 정보 출력
    if (__DEV__) {
      console.log('메모 상세 조회 API 호출:', { memoId, hasToken: !!userToken });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    // 개발 환경에서만 응답 상태 출력
    if (__DEV__) {
      console.log('메모 상세 조회 HTTP 응답 상태:', response.status);
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('메모 상세 조회 에러 응답:', errorData);
        }
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          // 개발 환경에서만 에러 텍스트 출력
          if (__DEV__) {
            console.error('메모 상세 조회 에러 텍스트:', errorText);
          }
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('메모 상세 조회 성공');
    }
    
    // API 응답 구조 분석
    if (result && typeof result === 'object') {
      if (result.memoId || result.title || result.content) {
        if (__DEV__) {
          console.log('응답이 직접 메모 객체 형태');
        }
        return result;
      } else if (result.data && (result.data.memoId || result.data.title || result.data.content)) {
        if (__DEV__) {
          console.log('응답이 { data: {...} } 형태');
        }
        return result;
      } else if (result.success && result.data && (result.data.memoId || result.data.title || result.data.content)) {
        if (__DEV__) {
          console.log('응답이 { success: true, data: {...} } 형태');
        }
        return result;
      } else {
        if (__DEV__) {
          console.warn('예상치 못한 응답 구조, 원본 반환');
        }
        return result;
      }
    } else {
      if (__DEV__) {
        console.warn('응답이 객체가 아님, 원본 반환');
      }
      return result;
    }
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('메모 상세 조회 실패:', error.message);
    }
    throw error;
  }
};

// 메모 삭제 함수 (POST 메서드)
export const deleteMemo = async (memoId, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      // 개발 환경에서만 토큰 사용 정보 출력
      if (__DEV__) {
        console.log('메모 삭제에 토큰 사용:', userToken.substring(0, 20) + '...');
      }
    } else {
      // 개발 환경에서만 경고 출력
      if (__DEV__) {
        console.warn('메모 삭제에 토큰이 없음');
      }
    }

    const response = await fetch(`${config.baseURL}/memo/delete/${memoId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('메모 삭제 에러 응답:', errorData);
        }
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('✅ 메모 삭제 성공:', memoId);
    }
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('❌ 메모 삭제 실패:', error.message);
      console.error('API 엔드포인트:', `${config.baseURL}/memo/delete/${memoId}`);
    }
    throw error;
  }
};

// 메모 수정 함수 (새로운 API 명세서에 맞춤)
export const updateMemo = async (memoId, updateData, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const url = `${config.baseURL}/memo/update/${memoId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('서버 에러 응답:', errorData);
          console.error(' 에러 상세 정보:', JSON.stringify(errorData, null, 2));
        }
        
        // 에러 메시지 추출 로직 개선
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          // 개발 환경에서만 에러 텍스트 출력
          if (__DEV__) {
            console.error(' 서버 텍스트 응답:', errorText);
          }
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error(' 메모 수정 실패:', error.message);
      console.error(' API 엔드포인트:', `${config.baseURL}/memo/update/${memoId}`);
    }
    throw error;
  }
};

// 회원가입 함수 (API 명세서에 맞춤)
export const signUp = async (userData) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${config.baseURL}/auth/signup`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      let errorData = null;
      
      try {
        errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('회원가입 에러 응답:', errorData);
          console.error('에러 응답 전체 구조:', JSON.stringify(errorData, null, 2));
          console.error('에러 응답 키들:', Object.keys(errorData || {}));
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          // 개발 환경에서만 에러 텍스트 출력
          if (__DEV__) {
            console.error('회원가입 에러 텍스트:', errorText);
          }
          errorData = { detail: errorText };
        } catch (textError) {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
      }

      // HTTP 상태 코드별 사용자 친화적인 에러 메시지 (오류코드 테이블 참고)
      let errorMessage = '회원가입에 실패했습니다';
      let errorCode = null;
      
      // 다양한 오류 코드 필드명 확인
      const errorCodeStr = errorData?.errorCode || errorData?.error_code || errorData?.code || errorData?.errorCode || '';
      const detail = errorData?.detail || errorData?.message || errorData?.error || '';
      
      // 개발 환경에서만 오류 정보 출력
      if (__DEV__) {
        console.error('추출된 오류 코드:', errorCodeStr);
        console.error('추출된 상세 메시지:', detail);
      }
      
      if (response.status === 400) {
        // 잘못된 요청 데이터
        
        // 오류코드별 구체적인 메시지 처리
        if (errorCodeStr === USER_ERROR_CODES.USR_001) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_001];
          errorCode = USER_ERROR_CODES.USR_001;
        } else if (errorCodeStr === USER_ERROR_CODES.USR_002) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_002];
          errorCode = USER_ERROR_CODES.USR_002;
        } else if (errorCodeStr === USER_ERROR_CODES.USR_003) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_003];
          errorCode = USER_ERROR_CODES.USR_003;
        } else if (errorCodeStr === USER_ERROR_CODES.USR_006) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_006];
          errorCode = USER_ERROR_CODES.USR_006;
        } else if (errorCodeStr === USER_ERROR_CODES.USR_007) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_007];
          errorCode = USER_ERROR_CODES.USR_007;
        } else {
          // 기존 로직 유지 (오류코드가 없는 경우)
          if (detail.includes('email') || detail.includes('이메일')) {
            errorMessage = '이미 사용 중인 이메일입니다';
          } else if (detail.includes('nickname') || detail.includes('닉네임')) {
            errorMessage = '이미 사용 중인 닉네임입니다';
          } else if (detail.includes('phone') || detail.includes('전화번호')) {
            errorMessage = '이미 사용 중인 전화번호입니다';
          } else if (detail.includes('password') || detail.includes('비밀번호')) {
            errorMessage = '비밀번호 형식이 올바르지 않습니다';
          } else {
            errorMessage = '입력 정보를 확인해주세요';
          }
        }
      } else if (response.status === 409) {
        // 충돌 (중복된 데이터)
        
        if (errorCodeStr === USER_ERROR_CODES.USR_004) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_004];
          errorCode = USER_ERROR_CODES.USR_004;
        } else if (errorCodeStr === USER_ERROR_CODES.USR_005) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_005];
          errorCode = USER_ERROR_CODES.USR_005;
        } else {
          // 기존 로직 유지
          if (detail.includes('email') || detail.includes('이메일')) {
            errorMessage = '이미 사용 중인 이메일입니다';
          } else if (detail.includes('nickname') || detail.includes('닉네임')) {
            errorMessage = '이미 사용 중인 닉네임입니다';
          } else if (detail.includes('phone') || detail.includes('전화번호')) {
            errorMessage = '이미 사용 중인 전화번호입니다';
          } else {
            errorMessage = '이미 존재하는 계정입니다';
          }
        }
      } else if (response.status === 422) {
        // 유효성 검증 실패
        errorMessage = '입력 정보가 올바르지 않습니다';
      } else if (response.status >= 500) {
        // 서버 내부 오류
        if (errorCodeStr === USER_ERROR_CODES.USR_999) {
          errorMessage = USER_ERROR_MESSAGES[USER_ERROR_CODES.USR_999];
          errorCode = USER_ERROR_CODES.USR_999;
        } else {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
        }
      }
      
      // 개발 환경에서만 최종 오류 정보 출력
      if (__DEV__) {
        console.error('최종 오류 메시지:', errorMessage);
        console.error('최종 오류 코드:', errorCode);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.detail = detail;
      if (errorCode) {
        error.errorCode = errorCode;
      }
      throw error;
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트로 읽기
      const responseText = await response.text();
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    // HTTP 200이면 성공으로 처리 (실제 DB에 저장되었으므로)
    return {
      success: true,
      data: {
        userId: result.userId || result.data?.userId,
        username: result.username || result.data?.username
      }
    };
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error(' 회원가입 실패:', error.message);
      console.error(' API 엔드포인트:', `${config.baseURL}/auth/signup`);
    }
    throw error;
  }
};

// 로그인 함수
export const signIn = async (credentials) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // 개발 환경에서만 요청 정보 출력
    if (__DEV__) {
      console.log('로그인 요청 시작');
    }

    const response = await fetch(`https://dco69dhctdpt.cloudfront.net/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials)
    });

    // 개발 환경에서만 응답 상태 출력
    if (__DEV__) {
      console.log('로그인 응답 상태:', response.status);
    }

    if (!response.ok) {
      let errorData = null;
      
      try {
        errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.log('로그인 에러 응답:', errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          if (__DEV__) {
            console.log('로그인 에러 텍스트:', errorText);
          }
          errorData = { detail: errorText };
        } catch (textError) {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
      }

      // 401 응답에 대한 에러 처리 (구체적인 오류 내용 노출 방지)
      if (response.status === 401) {
        const detail = errorData?.detail || '';
        
        // 이메일 인증이 필요한 경우만 구체적으로 처리
        if (detail.includes('이메일 인증') || detail.includes('email verification') || detail.includes('verification')) {
          const error = new Error('이메일 인증이 필요합니다');
          error.status = 401;
          error.detail = detail;
          error.type = 'EMAIL_VERIFICATION';
          throw error;
        }
        
        // 기타 401 에러는 일반적인 로그인 실패 메시지로 처리 (보안상 구체적인 내용 노출 방지)
        const error = new Error('로그인에 실패했습니다. 입력 정보를 확인해주세요');
        error.status = 401;
        error.detail = detail;
        error.type = 'INVALID_CREDENTIALS';
        throw error;
      }
      
      // 403 응답 (가입 필요)
      if (response.status === 403) {
        const error = new Error('계정이 존재하지 않습니다. 회원가입을 진행해주세요');
        error.status = 403;
        error.detail = errorData?.detail || '가입이 필요합니다';
        error.type = 'REGISTRATION_REQUIRED';
        throw error;
      }
      
      // 404 응답 (계정을 찾을 수 없음)
      if (response.status === 404) {
        const error = new Error('계정을 찾을 수 없습니다. 회원가입을 진행해주세요');
        error.status = 404;
        error.detail = errorData?.detail || '계정이 존재하지 않습니다';
        error.type = 'REGISTRATION_REQUIRED';
        throw error;
      }
      
      // 기타 에러 - 더 사용자 친화적인 메시지로 변환
      let errorMessage = '로그인에 실패했습니다';
      if (response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
      } else if (response.status === 400) {
        errorMessage = '입력 정보를 확인해주세요';
      } else if (response.status === 429) {
        errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.detail = errorData?.detail || errorData?.error || errorData?.message || errorMessage;
      throw error;
    }

    let result;
    try {
      result = await response.json();
      // 개발 환경에서만 성공 응답 출력
      if (__DEV__) {
        console.log('로그인 성공 응답');
      }
      
      // 토큰 필드 확인 (개발 환경에서만)
      if (__DEV__) {
        if (result.access_token) {
          console.log('access_token 발견');
        } else if (result.token) {
          console.log('token 발견');
        } else if (result.accessToken) {
          console.log('accessToken 발견');
        } else {
          console.warn('토큰 필드를 찾을 수 없음');
        }
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트로 읽기
      const responseText = await response.text();
      if (__DEV__) {
        console.error('로그인 응답 JSON 파싱 실패:', responseText);
      }
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 정보 출력
    if (__DEV__) {
      console.log('로그인 실패:', error.message);
    }
    throw error;
  }
};

// 회원탈퇴 함수
export const deleteAccount = async (userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/delete-account`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error(' 회원탈퇴 실패:', error.message);
      console.error(' API 엔드포인트:', `${config.baseURL}/user/delete-account`);
    }
    throw error;
  }
};

// 닉네임 변경 함수
export const updateNickname = async (nickname, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/update-nickname`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ nickname })
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        
        // 에러 메시지 추출 로직
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error(' 닉네임 변경 실패:', error.message);
      console.error(' API 엔드포인트:', `${config.baseURL}/user/update-nickname`);
    }
    throw error;
  }
};

// 비밀번호 변경 함수
export const updatePassword = async (currentPassword, newPassword, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/update-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        password: currentPassword,
        new_password: newPassword 
      })
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        
        // 에러 메시지 추출 로직
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error(' 비밀번호 변경 실패:', error.message);
      console.error(' API 엔드포인트:', `${config.baseURL}/user/update-password`);
    }
    throw error;
  }
};

// 프로필 이미지 저장 함수 (API 명세서에 맞춤)
export const saveProfileImage = async (profileImageUrl, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/profile-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        profile_image_url: profileImageUrl 
      })
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        
        // 에러 메시지 추출 로직
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('프로필 이미지 저장 실패:', error.message);
      console.error('API 엔드포인트:', `${config.baseURL}/user/profile-image`);
    }
    throw error;
  }
};

// 프로필 이미지 조회 함수
export const getProfileImage = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/profile-image?user_id=${userId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.profile_image_url;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error(' 프로필 이미지 조회 실패:', error.message);
      console.error(' API 엔드포인트:', `${config.baseURL}/user/profile-image?user_id=${userId}`);
    }
    throw error;
  }
};

// 사용자 검색 함수
export const searchUsers = async (keyword, type = 'nickname', limit = 10, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    // 쿼리 파라미터 구성 (API 명세서에 맞춤)
    const queryParams = new URLSearchParams({
      keyword: keyword || '',
      type: type, // nickname 또는 email
      limit: limit.toString()
    });

    const url = `${config.baseURL}/user/search?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('사용자 검색 실패:', error.message);
      console.error('API 엔드포인트:', `${config.baseURL}/user/search`);
    }
    throw error;
  }
};

// 공개설정 변경 함수
export const updatePrivacySetting = async (privacySetting, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/update-privacy`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        privacy_settings: privacySetting // 'open', 'semi', 'closed'
      })
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        
        // 에러 메시지 추출 로직
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('공개설정 변경 실패:', error.message);
      console.error('API 엔드포인트:', `${config.baseURL}/user/update-privacy`);
    }
    throw error;
  }
};

// 공개설정 조회 함수
export const getUserPrivacySetting = async (userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/api/user/privacy-setting`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('공개설정 조회 실패:', error.message);
      console.error('API 엔드포인트:', `${config.baseURL}/user/privacy-setting`);
    }
    throw error;
  }
}; 

// 사용자 정보 조회 함수
export const getUserInfo = async (userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await fetch(`${config.baseURL}/auth/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('사용자 정보 조회 실패:', error.message);
    }
    throw error;
  }
};

// 사용자 정보 조회 함수 (API 명세서에 맞춤)
export const getUserInfoById = async (userId, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await fetch(`${config.baseURL}/user/${userId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // 404 에러는 사용자가 존재하지 않는다는 의미이므로 적절한 메시지 반환
      if (response.status === 404) {
        // 개발 환경에서만 로그 출력
        if (__DEV__) {
          console.log('📝 사용자를 찾을 수 없습니다');
        }
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다'
        };
      }
      
      // 204 No Content도 사용자가 존재하지 않는다는 의미
      if (response.status === 204) {
        // 개발 환경에서만 로그 출력
        if (__DEV__) {
          console.log('📝 사용자를 찾을 수 없습니다 (204 No Content)');
        }
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다'
        };
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('사용자 정보 조회 에러 응답:', errorData);
        }
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('✅ 사용자 정보 조회 성공:', userId);
    }
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('❌ 사용자 정보 조회 실패:', error.message);
      console.error('API 엔드포인트:', `${config.baseURL}/user/${userId}`);
    }
    throw error;
  }
};

// 토큰 유효성 검증 함수
export const validateToken = async (token) => {
  if (!token) {
    // 개발 환경에서만 로그 출력
    if (__DEV__) {
      console.log('❌ 토큰이 없음');
    }
    return false;
  }
  
  try {
    // 개발 환경에서만 로그 출력
    if (__DEV__) {
      console.log('토큰 유효성 검증 시작...');
      console.log('토큰 길이:', token.length);
      console.log('토큰 시작 부분:', token.substring(0, 20) + '...');
    }
    
    const userInfo = await getUserInfo(token);
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('✅ 토큰 유효성 검증 성공:', userInfo);
    }
    return true;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('❌ 토큰 유효성 검증 실패:', error.message);
    }
    return false;
  }
};

// 저장된 토큰 확인 함수
export const checkStoredToken = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('userToken');
    
    if (token) {
      // 개발 환경에서만 로그 출력
      if (__DEV__) {
        console.log('저장된 토큰 발견:', token.substring(0, 20) + '...');
        console.log('토큰 길이:', token.length);
      }
      
      // 토큰 유효성 검증
      const isValid = await validateToken(token);
      return isValid ? token : null;
    } else {
      // 개발 환경에서만 로그 출력
      if (__DEV__) {
        console.log('저장된 토큰 없음');
      }
      return null;
    }
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('❌ 저장된 토큰 확인 실패:', error);
    }
    return null;
  }
};

// 메모 조회 시 토큰 전달 상태 확인 함수
export const checkMemoTokenStatus = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('userToken');
    
    // 개발 환경에서만 로그 출력
    if (__DEV__) {
      console.log('메모 조회 토큰 상태 확인:');
      console.log('  - 저장된 토큰:', token ? '있음' : '없음');
      
      if (token) {
        console.log('  - 토큰 길이:', token.length);
        console.log('  - 토큰 시작 부분:', token.substring(0, 20) + '...');
        
        // 간단한 토큰 형식 검증
        if (token.includes('.')) {
          console.log('  - 토큰 형식: JWT 형식 (올바름)');
        } else {
          console.log('  - 토큰 형식: 일반 문자열');
        }
      }
    }
    
    return token;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('❌ 토큰 상태 확인 실패:', error);
    }
    return null;
  }
};

// 뷰 설정 업데이트 함수 (전체/팔로잉/나 필터)
export const updateViewSettings = async (viewSettings, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const requestBody = {
      view_settings: viewSettings
    };

    // 개발 환경에서만 요청 정보 출력
    if (__DEV__) {
      console.log('뷰 설정 업데이트 요청:', {
        url: `${config.baseURL}/user/update-view`,
        method: 'POST',
        headers,
        body: requestBody
      });
    }

    const response = await fetch(`${config.baseURL}/user/update-view`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    // 개발 환경에서만 응답 정보 출력
    if (__DEV__) {
      console.log('뷰 설정 업데이트 응답 상태:', response.status);
      console.log('뷰 설정 업데이트 응답 헤더:', response.headers);
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        // 개발 환경에서만 에러 응답 출력
        if (__DEV__) {
          console.error('서버 에러 응답:', errorData);
        }
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          // 개발 환경에서만 에러 텍스트 출력
          if (__DEV__) {
            console.error('서버 에러 텍스트:', errorText);
          }
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // 개발 환경에서만 성공 로그 출력
    if (__DEV__) {
      console.log('뷰 설정 업데이트 성공 응답:', result);
    }
    return result;
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (__DEV__) {
      console.error('뷰 설정 업데이트 실패:', error.message);
    }
    throw error;
  }
}; 

// 이메일 인증 코드 확인 함수 (API 명세서에 맞춤)
export const checkEmailVerification = async (email, code) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // 쿼리 파라미터로 email과 code 전달
    const queryParams = new URLSearchParams({
      email: email,
      code: code
    });

    const url = `${config.baseURL}/auth/check-mail?${queryParams}`;

    console.log('이메일 인증 요청:', {
      url: url,
      method: 'POST',
      headers: headers,
      email: email,
      code: code
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    console.log('이메일 인증 응답 상태:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('이메일 인증 에러 응답:', errorData);
        
        // 422 Validation Error 처리
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else {
          errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          console.error('이메일 인증 에러 텍스트:', errorText);
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 이메일 인증 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 이메일 인증 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/auth/check-mail`);
    throw error;
  }
};

// 이메일 인증 코드 발송 함수
export const sendEmailVerification = async (email) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${config.baseURL}/auth/send-mail?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorData = null;
      
      try {
        errorData = await response.json();
        console.error('이메일 인증 코드 발송 에러 응답:', errorData);
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          console.error('이메일 인증 코드 발송 에러 텍스트:', errorText);
          errorData = { detail: errorText };
        } catch (textError) {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
      }

      // HTTP 상태 코드별 사용자 친화적인 에러 메시지
      let errorMessage = '이메일 인증 코드 발송에 실패했습니다';
      
      if (response.status === 400) {
        // 잘못된 요청
        errorMessage = '이메일 주소를 확인해주세요';
      } else if (response.status === 422) {
        // 유효성 검증 실패
        if (errorData?.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map(err => err.msg || err.message).join(', ');
          errorMessage = `입력 정보 오류: ${validationErrors}`;
        } else {
          errorMessage = '이메일 형식이 올바르지 않습니다';
        }
      } else if (response.status === 429) {
        // 요청 제한
        errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
      } else if (response.status >= 500) {
        // 서버 오류
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.detail = errorData?.detail || errorData?.error || errorData?.message || errorMessage;
      throw error;
    }

    const result = await response.json();
    console.log('✅ 이메일 인증 코드 발송 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 이메일 인증 코드 발송 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/auth/send-mail`);
    throw error;
  }
};

// 이메일 인증 코드 재발송 함수


// 스크랩 상태 확인 함수
export const checkIsScraped = async (memoId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/memo/check-is-scraped/${memoId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('스크랩 상태 확인 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 스크랩 상태 확인 성공:', memoId, result);
    return result;
  } catch (error) {
    console.error('❌ 스크랩 상태 확인 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/memo/check-is-scraped/${memoId}`);
    throw error;
  }
};

// 스크랩 메모 함수
export const scrapMemo = async (memoId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/memo/scrap/${memoId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('스크랩 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    // API 응답이 문자열일 수 있으므로 먼저 텍스트로 읽기
    const responseText = await response.text();
    console.log('스크랩 API 응답 텍스트:', responseText);
    
    let result;
    try {
      // JSON으로 파싱 시도
      result = JSON.parse(responseText);
      console.log('스크랩 API 응답 JSON:', result);
    } catch (parseError) {
      // JSON 파싱 실패 시 문자열 그대로 사용
      result = responseText;
      console.log('스크랩 API 응답 문자열:', result);
    }
    
    console.log('✅ 메모 스크랩 성공:', memoId);
    return result;
  } catch (error) {
    console.error('❌ 메모 스크랩 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/memo/scrap/${memoId}`);
    throw error;
  }
};

// 언스크랩 메모 함수
export const unscrapMemo = async (memoId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/memo/unscrap/${memoId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('언스크랩 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    // API 응답이 문자열일 수 있으므로 먼저 텍스트로 읽기
    const responseText = await response.text();
    console.log('언스크랩 API 응답 텍스트:', responseText);
    
    let result;
    try {
      // JSON으로 파싱 시도
      result = JSON.parse(responseText);
      console.log('언스크랩 API 응답 JSON:', result);
    } catch (parseError) {
      // JSON 파싱 실패 시 문자열 그대로 사용
      result = responseText;
      console.log('언스크랩 API 응답 문자열:', result);
    }
    
    console.log('✅ 메모 언스크랩 성공:', memoId);
    return result;
  } catch (error) {
    console.error('❌ 메모 언스크랩 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/memo/unscrap/${memoId}`);
    throw error;
  }
}; 

export const getCurrentUserInfo = async (userToken) => {
  const config = getApiConfig();
  try {
    const response = await fetch(`${config.baseURL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('현재 사용자 정보 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ 현재 사용자 정보 조회 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 현재 사용자 정보 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/auth/me`);
    throw error;
  }
};

// 스크랩한 메모 목록 가져오기
export const getScrapMemos = async (userToken) => {
  const config = getApiConfig();
  try {
    const response = await fetch(`${config.baseURL}/memo/scrap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    if (!response.ok) {
      // 404 에러는 스크랩 메모가 없다는 의미이므로 빈 배열 반환
      if (response.status === 404) {
        console.log('📝 스크랩 메모가 없습니다');
        return {
          success: true,
          data: [],
          message: '스크랩한 메모가 없습니다'
        };
      }
      
      // 204 No Content도 스크랩 메모가 없다는 의미
      if (response.status === 204) {
        console.log('📝 스크랩 메모가 없습니다 (204 No Content)');
        return {
          success: true,
          data: [],
          message: '스크랩한 메모가 없습니다'
        };
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('스크랩 메모 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ 스크랩 메모 조회 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 스크랩 메모 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/memo/scrap`);
    throw error;
  }
};

// 특정 사용자의 메모 조회 함수 (API 명세서에 맞춤)
export const getUserMemos = async (userId, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      console.log('사용자 메모 조회에 토큰 사용:', userToken.substring(0, 20) + '...');
    } else {
      console.warn('사용자 메모 조회에 토큰이 없음');
    }

    const url = `${config.memosEndpoint}${userId}`;
    console.log('=== 사용자 메모 조회 요청 상세 ===');
    console.log('전달받은 userId:', userId);
    console.log('userId 타입:', typeof userId);
    console.log('userId 값 검증:', userId ? '유효함' : '유효하지 않음');
    console.log('최종 URL:', url);
    console.log('사용자 메모 조회 요청:', { url, userId, hasToken: !!userToken });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('HTTP 응답 상태:', response.status);
    console.log('HTTP 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('사용자 메모 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 사용자 메모 조회 성공 - 원본 응답:', result);
    console.log('응답 키들:', Object.keys(result));
    
    // API 명세서에 따라 응답이 배열 형태로 직접 반환되어야 함
    // 응답 구조에 따라 적절한 형태로 반환
    if (Array.isArray(result)) {
      // 응답이 직접 배열인 경우
      console.log('응답이 직접 배열 형태:', result.length);
      return result;
    } else if (result.data && Array.isArray(result.data)) {
      // 응답이 { data: [...] } 형태인 경우
      console.log('응답이 data 필드를 가진 객체 형태:', result.data.length);
      return result.data;
    } else if (result && typeof result === 'object') {
      // 다른 형태의 응답 구조인 경우, 가능한 메모 데이터를 찾아서 반환
      console.warn('예상치 못한 응답 구조, 가능한 메모 데이터를 찾아서 반환:', result);
      
      // result.data가 단일 메모 객체인 경우 (단일 메모)
      if (result.data && result.data.memoId && !Array.isArray(result.data)) {
        console.log('result.data가 단일 메모 객체:', result.data);
        return [result.data];
      }
      
      // result 자체가 메모 객체인 경우 (단일 메모)
      if (result.memoId || result.title) {
        return [result];
      }
      
      // result 내부에 메모 배열이 있는 경우
      const possibleMemoArrays = Object.values(result).filter(val => Array.isArray(val) && val.length > 0 && val[0] && (val[0].memoId || val[0].title));
      if (possibleMemoArrays.length > 0) {
        return possibleMemoArrays[0];
      }
      
      // 메모 데이터를 찾을 수 없는 경우
      console.error('응답에서 메모 데이터를 찾을 수 없음:', result);
      return [];
    } else {
      console.error('응답을 파싱할 수 없음:', result);
      return [];
    }
  } catch (error) {
    console.error('❌ 사용자 메모 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.memosEndpoint}${userId}`);
    throw error;
  }
};

// 팔로잉 목록 조회 함수
export const getFollowingList = async (userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/follows`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로잉 목록 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 팔로잉 목록 조회 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 팔로잉 목록 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/follows`);
    throw error;
  }
};

// 언팔로우 함수
export const unfollowUser = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    // 이미지에 표시된 API 경로에 맞춤: /api/user/unfollow/{user_id}
    const response = await fetch(`${config.baseURL}/user/unfollow/${userId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('언팔로우 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 언팔로우 성공:', userId);
    
    // 이미지의 API 명세에 따른 응답 구조 처리
    // { "success": true|false, "error": null|"Error Message" }
    if (result && typeof result === 'object') {
      if (result.success === true) {
        console.log('✅ 언팔로우 API 성공 응답:', result);
        return result;
      } else if (result.success === false) {
        // API에서 명시적으로 실패를 반환한 경우
        const errorMsg = result.error || '언팔로우에 실패했습니다.';
        throw new Error(errorMsg);
      } else {
        // success 필드가 없는 경우, 기존 응답 그대로 반환
        console.log('⚠️ success 필드가 없는 응답, 기존 형태로 반환:', result);
        return result;
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ 언팔로우 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/unfollow/${userId}`);
    throw error;
  }
};

// 팔로워 목록 조회 함수
export const getFollowersList = async (userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/followers`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로워 목록 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 팔로워 목록 조회 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 팔로워 목록 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/followers`);
    throw error;
  }
};

// 팔로우 요청 승인 함수
export const acceptFollowRequest = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/accept/${userId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로우 요청 승인 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 팔로우 요청 승인 성공:', userId);
    return result;
  } catch (error) {
    console.error('❌ 팔로우 요청 승인 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/accept/${userId}`);
    throw error;
  }
};

// 팔로우 요청 거절 함수
export const declineFollowRequest = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/decline/${userId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로우 요청 거절 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 팔로우 요청 거절 성공:', userId);
    return result;
  } catch (error) {
    console.error('❌ 팔로우 요청 거절 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/decline/${userId}`);
    throw error;
  }
};

// 팔로우 끊기 함수
export const defollowUser = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/defollow/${userId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로우 끊기 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 팔로우 끊기 성공:', userId);
    return result;
  } catch (error) {
    console.error('❌ 팔로우 끊기 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/defollow/${userId}`);
    throw error;
  }
};

// 팔로우 요청
export const followUser = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/follow/${userId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로우 요청 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ 팔로우 요청 성공:', userId);
    return result;
  } catch (error) {
    console.error('❌ 팔로우 요청 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/follow/${userId}`);
    throw error;
  }
};

// 팔로잉 수 조회 함수
export const getFollowingCount = async (userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/follows`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로잉 수 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // 응답에서 팔로잉 수 추출
    let followingCount = 0;
    if (result && result.data && Array.isArray(result.data.users)) {
      followingCount = result.data.users.length;
    } else if (result && Array.isArray(result)) {
      followingCount = result.length;
    } else if (result && result.count !== undefined) {
      followingCount = result.count;
    }
    
    console.log('✅ 팔로잉 수 조회 성공:', followingCount);
    return followingCount;
  } catch (error) {
    console.error('❌ 팔로잉 수 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/follows`);
    throw error;
  }
};

// 팔로워 수 조회 함수
export const getFollowersCount = async (userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${config.baseURL}/user/followers`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('팔로워 수 조회 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // 응답에서 팔로워 수 추출
    let followersCount = 0;
    if (result && result.data && Array.isArray(result.data.users)) {
      followersCount = result.data.users.length;
    } else if (result && Array.isArray(result)) {
      followersCount = result.length;
    } else if (result && result.count !== undefined) {
      followersCount = result.count;
    }
    
    console.log('✅ 팔로워 수 조회 성공:', followersCount);
    return followersCount;
  } catch (error) {
    console.error('❌ 팔로워 수 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/followers`);
    throw error;
  }
};

// 특정 사용자의 팔로잉/팔로워 수를 한 번에 조회하는 함수
export const getUserFollowCounts = async (userId, userToken) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    // 팔로잉과 팔로워 수를 병렬로 조회
    const [followingResponse, followersResponse] = await Promise.all([
      fetch(`${config.baseURL}/user/follows`, {
        method: 'GET',
        headers,
      }),
      fetch(`${config.baseURL}/user/followers`, {
        method: 'GET',
        headers,
      })
    ]);

    // 팔로잉 수 처리
    let followingCount = 0;
    if (followingResponse.ok) {
      try {
        const followingResult = await followingResponse.json();
        if (followingResult && followingResult.data && Array.isArray(followingResult.data.users)) {
          followingCount = followingResult.data.users.length;
        } else if (followingResult && Array.isArray(followingResult)) {
          followingCount = followingResult.length;
        } else if (followingResult && followingResult.count !== undefined) {
          followingCount = followingResult.count;
        }
      } catch (parseError) {
        console.warn('팔로잉 응답 파싱 실패:', parseError);
      }
    }

    // 팔로워 수 처리
    let followersCount = 0;
    if (followersResponse.ok) {
      try {
        const followersResult = await followersResponse.json();
        if (followersResult && followersResult.data && Array.isArray(followersResult.data.users)) {
          followersCount = followersResult.data.users.length;
        } else if (followersResult && Array.isArray(followersResult)) {
          followersCount = followersResult.length;
        } else if (followersResult && followersResult.count !== undefined) {
          followersCount = followersResult.count;
        }
      } catch (parseError) {
        console.warn('팔로워 응답 파싱 실패:', parseError);
      }
    }

    console.log('✅ 사용자 팔로우 수 조회 성공:', { userId, followingCount, followersCount });
    return {
      following_count: followingCount,
      follower_count: followersCount
    };
  } catch (error) {
    console.error('❌ 사용자 팔로우 수 조회 실패:', error.message);
    throw error;
  }
};

// 프로필 이미지 업로드를 위한 presigned URL 생성 함수
export const generatePresignedUrl = async (fileName, fileType, userToken) => {
  try {
    const headers = {
      'Authorization': `Bearer ${userToken}`,
    };

    const url = `https://dco69dhctdpt.cloudfront.net/generate-presigned-url?file_name=${encodeURIComponent(fileName)}&file_type=${encodeURIComponent(fileType)}`;
    
    console.log('🔗 Presigned URL 요청 URL:', url);
    console.log('📁 파일명:', fileName);
    console.log('📋 파일 타입:', fileType);

    const response = await axios.get(url, { headers });

    const presignedData = response.data;
    if (!presignedData) throw new Error('presigned URL을 받지 못했습니다.');

    // S4 호환성: 응답이 문자열이거나 { url: "..." } 객체일 수 있음
    let presignedUrl;
    if (typeof presignedData === 'string') {
      presignedUrl = presignedData;
    } else if (presignedData && typeof presignedData === 'object' && presignedData.url) {
      presignedUrl = presignedData.url;
    } else {
      throw new Error('presigned URL 형식이 올바르지 않습니다.');
    }

    console.log('✅ Presigned URL 생성 성공:', presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error('❌ Presigned URL 생성 실패:', error.message);
    throw error;
  }
};

// 프로필 이미지 업데이트 함수
export const updateProfileImage = async (profileImageUrl, userToken) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await axios.post('https://dco69dhctdpt.cloudfront.net/api/user/profile-image', {
      profile_image_url: profileImageUrl
    }, { headers });

    const result = response.data;
    console.log('✅ 프로필 이미지 업데이트 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 프로필 이미지 업데이트 실패:', error.message);
    throw error;
  }
};

// 프로필 이미지를 기본 이미지로 변경하는 함수
export const setDefaultProfileImage = async (userToken) => {
  try {
    const headers = {
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await axios.post('https://dco69dhctdpt.cloudfront.net/api/user/set/profile-image-default', {}, { headers });

    const result = response.data;
    console.log('✅ 기본 프로필 이미지 설정 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 기본 프로필 이미지 설정 실패:', error.message);
    throw error;
  }
};

// 장소 추천 함수 (POST 요청만 수행)
export const recommendPlaces = async (userLatitude, userLongitude, top = 3, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    // 쿼리 파라미터 구성 (API 명세서에 맞춤)
    const queryParams = new URLSearchParams({
      user_latitude: userLatitude.toString(),
      user_longitude: userLongitude.toString(),
      top: top.toString()
    });

    const url = `${config.baseURL}/mq/recommend?${queryParams}`;

    console.log('장소 추천 POST 요청:', { 
      url, 
      userLatitude, 
      userLongitude, 
      top, 
      hasToken: !!userToken 
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      // 404 에러는 추천 장소가 없다는 의미이므로 성공으로 처리
      if (response.status === 404) {
        console.log('📝 추천 장소가 없습니다');
        return {
          success: true,
          data: [],
          message: '추천 장소가 없습니다'
        };
      }
      
      // 204 No Content도 추천 장소가 없다는 의미
      if (response.status === 204) {
        console.log('📝 추천 장소가 없습니다 (204 No Content)');
        return {
          success: true,
          data: [],
          message: '추천 장소가 없습니다'
        };
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('장소 추천 에러 응답:', errorData);
         
        // 422 Validation Error 처리
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else {
          errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          console.error('장소 추천 에러 텍스트:', errorText);
          errorMessage = `HTTP error! status: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ 장소 추천 POST 요청 성공');
    return { success: true };
  } catch (error) {
    console.error('❌ 장소 추천 POST 요청 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/mq/recommend`);
    throw error;
  }
};

// 추천 장소 목록 가져오기 (GET 요청)
export const getRecommendations = async (userId, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {};
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const url = `${config.baseURL}/mq/recommendations/${userId}`;

    console.log('추천 장소 목록 GET 요청:', { 
      url, 
      userId, 
      hasToken: !!userToken 
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // 404 에러는 추천 장소가 없다는 의미이므로 빈 배열 반환
      if (response.status === 404) {
        console.log('📝 추천 장소가 없습니다');
        return {
          success: true,
          data: [],
          message: '추천 장소가 없습니다'
        };
      }
      
      // 204 No Content도 추천 장소가 없다는 의미
      if (response.status === 204) {
        console.log('📝 추천 장소가 없습니다 (204 No Content)');
        return {
          success: true,
          data: [],
          message: '추천 장소가 없습니다'
        };
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('추천 장소 목록 에러 응답:', errorData);
         
        // 422 Validation Error 처리
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else {
          errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          console.error('추천 장소 목록 에러 텍스트:', errorText);
          errorMessage = `HTTP error! status: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ 추천 장소 목록 GET 요청 성공:', data);
    return data;
  } catch (error) {
    console.error('❌ 추천 장소 목록 GET 요청 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/mq/recommendations/${userId}`);
    throw error;
  }
};

// 사용자 인사이트 가져오기 (GET 요청)
export const getUserInsights = async (userId, userToken = null) => {
  const config = getApiConfig();
  
  try {
    const headers = {};
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const url = `${config.baseURL}/mq/insights/${userId}`;

    console.log('사용자 인사이트 GET 요청:', { 
      url, 
      userId, 
      hasToken: !!userToken 
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('사용자 인사이트 에러 응답:', errorData);
         
        // 422 Validation Error 처리
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else {
          errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          console.error('사용자 인사이트 에러 텍스트:', errorText);
          errorMessage = `HTTP error! status: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ 사용자 인사이트 GET 요청 성공:', data);
    return data;
  } catch (error) {
    console.error('❌ 사용자 인사이트 GET 요청 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/mq/insights/${userId}`);
    throw error;
  }
};