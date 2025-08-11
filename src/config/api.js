// API 설정 파일
export const API_CONFIG = {
  // 개발 환경 (새로운 백엔드 서버)
  development: {
    baseURL: 'https://dco69dhctdpt.cloudfront.net/api',
    mapBoundsEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/map-bounds',
    memosEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/memo/',
  },
  
  // 프로덕션 환경 (새로운 백엔드 서버)
  production: {
    baseURL: 'https://dco69dhctdpt.cloudfront.net/api',
    mapBoundsEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/map-bounds',
    memosEndpoint: 'https://dco69dhctdpt.cloudfront.net/api/memo/',
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
    console.log('지도 경계 전송 성공 - bounds:', formattedBounds);
    return result;
  } catch (error) {
    console.error(' 지도 경계 전송 실패:', error.message);
    console.error(' API 엔드포인트:', config.mapBoundsEndpoint);
    console.error(' 전송 시도한 bounds:', formattedBounds);
    throw error;
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
        console.error('서버 에러 응답:', errorData);
        console.error(' 에러 상세 정보:', JSON.stringify(errorData, null, 2));
        
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
          console.error(' 서버 텍스트 응답:', errorText);
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
    console.error(' 메모 생성 실패:', error.message);
    console.error(' API 엔드포인트:', config.memosEndpoint);
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
      console.log('메모 목록 조회에 토큰 사용:', userToken.substring(0, 20) + '...');
    } else {
      console.warn('메모 목록 조회에 토큰이 없음');
    }

    console.log('메모 목록 조회 시작:', { page, limit, hasToken: !!userToken });

    const response = await fetch(`${config.memosEndpoint}?page=${page}&limit=${limit}`, {
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
    console.error(' 메모 목록 조회 실패:', error.message);
    console.error(' API 엔드포인트:', config.memosEndpoint);
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
      console.log('전체 메모 조회에 토큰 사용:', userToken.substring(0, 20) + '...');
    } else {
      console.warn('전체 메모 조회에 토큰이 없음');
    }

    // API 명세서에 맞춰 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      view_setting: viewSetting
    });

    // config 사용으로 일관성 유지
    const url = `${config.memosEndpoint}all?${queryParams}`;

    console.log('전체 메모 조회 요청:', { url, viewSetting, hasToken: !!userToken });

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
    console.log('✅ 전체 메모 조회 성공:', { count: result.data?.length || 0, viewSetting });
    return result;
  } catch (error) {
    console.error('전체 메모 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.memosEndpoint}all`);
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
      console.log('메모 상세 조회에 토큰 사용:', userToken.substring(0, 20) + '...');
    } else {
      console.warn('메모 상세 조회에 토큰이 없음');
    }

    const response = await fetch(`${config.memosEndpoint}${memoId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('메모 상세 조회 에러 응답:', errorData);
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
    console.log('✅ 메모 상세 조회 성공:', memoId);
    return result;
  } catch (error) {
    console.error('❌ 메모 상세 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.memosEndpoint}${memoId}`);
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
      console.log('메모 삭제에 토큰 사용:', userToken.substring(0, 20) + '...');
    } else {
      console.warn('메모 삭제에 토큰이 없음');
    }

    const response = await fetch(`${config.baseURL}/memo/delete/${memoId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('메모 삭제 에러 응답:', errorData);
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
    console.log('✅ 메모 삭제 성공:', memoId);
    return result;
  } catch (error) {
    console.error('❌ 메모 삭제 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/memo/delete/${memoId}`);
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
        console.error('서버 에러 응답:', errorData);
        console.error(' 에러 상세 정보:', JSON.stringify(errorData, null, 2));
        
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
          console.error(' 서버 텍스트 응답:', errorText);
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
    console.error(' 메모 수정 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/memo/update/${memoId}`);
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
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
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
    console.error(' 회원가입 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/auth/signup`);
    throw error;
  }
};

// 로그인 함수
export const signIn = async (credentials) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    console.log('로그인 요청 시작:', {
      url: 'https://dco69dhctdpt.cloudfront.net/api/auth/login',
      method: 'POST',
      headers,
      credentials: { ...credentials, password: '***' }
    });

    const response = await fetch(`https://dco69dhctdpt.cloudfront.net/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials)
    });

    console.log('로그인 응답 상태:', response.status);
    console.log('로그인 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('로그인 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          console.error('로그인 에러 텍스트:', errorText);
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
      console.log('로그인 성공 응답:', result);
      console.log('응답 키들:', Object.keys(result));
      
      // 토큰 필드 확인
      if (result.access_token) {
        console.log('✅ access_token 발견:', result.access_token.substring(0, 20) + '...');
      } else if (result.token) {
        console.log('✅ token 발견:', result.token.substring(0, 20) + '...');
      } else if (result.accessToken) {
        console.log('✅ accessToken 발견:', result.accessToken.substring(0, 20) + '...');
      } else {
        console.warn('토큰 필드를 찾을 수 없음. 사용 가능한 필드들:', Object.keys(result));
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트로 읽기
      const responseText = await response.text();
      console.error('로그인 응답 JSON 파싱 실패:', responseText);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    return result;
  } catch (error) {
    console.error('로그인 실패:', error.message);
    console.error('API 엔드포인트:', 'https://dco69dhctdpt.cloudfront.net/api/auth/login');
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
    console.error(' 회원탈퇴 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/user/delete-account`);
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
    console.error(' 닉네임 변경 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/user/update-nickname`);
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
    console.error(' 비밀번호 변경 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/user/update-password`);
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
    console.error('프로필 이미지 저장 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/profile-image`);
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
    console.error(' 프로필 이미지 조회 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/user/profile-image?user_id=${userId}`);
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
    console.error('사용자 검색 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/search`);
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
    console.error('공개설정 변경 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/update-privacy`);
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
    console.error('공개설정 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/privacy-setting`);
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
    console.error('사용자 정보 조회 실패:', error.message);
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
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('사용자 정보 조회 에러 응답:', errorData);
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
    console.log('✅ 사용자 정보 조회 성공:', userId);
    return result;
  } catch (error) {
    console.error('❌ 사용자 정보 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/${userId}`);
    throw error;
  }
};

// 토큰 유효성 검증 함수
export const validateToken = async (token) => {
  if (!token) {
    console.log('❌ 토큰이 없음');
    return false;
  }
  
  try {
    console.log('토큰 유효성 검증 시작...');
    console.log('토큰 길이:', token.length);
    console.log('토큰 시작 부분:', token.substring(0, 20) + '...');
    
    const userInfo = await getUserInfo(token);
    console.log('✅ 토큰 유효성 검증 성공:', userInfo);
    return true;
  } catch (error) {
    console.error('❌ 토큰 유효성 검증 실패:', error.message);
    return false;
  }
};

// 저장된 토큰 확인 함수
export const checkStoredToken = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('userToken');
    
    if (token) {
      console.log('저장된 토큰 발견:', token.substring(0, 20) + '...');
      console.log('토큰 길이:', token.length);
      
      // 토큰 유효성 검증
      const isValid = await validateToken(token);
      return isValid ? token : null;
    } else {
      console.log('저장된 토큰 없음');
      return null;
    }
  } catch (error) {
    console.error('❌ 저장된 토큰 확인 실패:', error);
    return null;
  }
};

// 메모 조회 시 토큰 전달 상태 확인 함수
export const checkMemoTokenStatus = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('userToken');
    
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
    
    return token;
  } catch (error) {
    console.error('❌ 토큰 상태 확인 실패:', error);
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

    console.log('뷰 설정 업데이트 요청:', {
      url: `${config.baseURL}/user/update-view`,
      method: 'POST',
      headers,
      body: requestBody
    });

    const response = await fetch(`${config.baseURL}/user/update-view`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    console.log('뷰 설정 업데이트 응답 상태:', response.status);
    console.log('뷰 설정 업데이트 응답 헤더:', response.headers);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('서버 에러 응답:', errorData);
        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기
        try {
          const errorText = await response.text();
          console.error('서버 에러 텍스트:', errorText);
          errorMessage = `Server response: ${errorText}`;
        } catch (textError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('뷰 설정 업데이트 성공 응답:', result);
    return result;
  } catch (error) {
    console.error('뷰 설정 업데이트 실패:', error.message);
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

// 이메일 인증 코드 재발송 함수


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

    const result = await response.json();
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

    const result = await response.json();
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
