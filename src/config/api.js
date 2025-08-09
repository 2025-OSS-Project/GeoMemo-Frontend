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
    console.log('백엔드 전송 성공!');
    console.log('서버 응답:', result);
    return result;
  } catch (error) {
    console.error(' 지도 경계 전송 실패:', error.message);
    console.error(' API 엔드포인트:', config.mapBoundsEndpoint);
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

    console.log('API Call:', config.memosEndpoint);
    console.log('Headers:', headers);

    const response = await fetch(config.memosEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(memoData)
    });

    console.log('Status:', response.status, response.statusText);

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
    console.log('Success Response:', JSON.stringify(result, null, 2));
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
    }

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
    console.log(' 메모 목록 조회 성공!');
    return result;
  } catch (error) {
    console.error(' 메모 목록 조회 실패:', error.message);
    console.error(' API 엔드포인트:', config.memosEndpoint);
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

    const response = await fetch(`${config.memosEndpoint}${memoId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(' 메모 상세 조회 성공!');
    return result;
  } catch (error) {
    console.error(' 메모 상세 조회 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.memosEndpoint}${memoId}`);
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
    console.log(' 메모 삭제 성공!');
    console.log(' 서버 응답:', result);
    return result;
  } catch (error) {
    console.error(' 메모 삭제 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/memo/delete/${memoId}`);
    throw error;
  }
};

// 메모 수정 함수 (새로운 API 명세서에 맞춤)
export const updateMemo = async (memoId, updateData, userToken = null) => {
  const config = getApiConfig();
  
  try {
    console.log('🔧 updateMemo 함수 시작');
    console.log('📝 memoId:', memoId);
    console.log('📝 updateData:', JSON.stringify(updateData, null, 2));
    console.log('🔑 userToken:', userToken ? '토큰 있음' : '토큰 없음');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있을 때만 Authorization 헤더 추가
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const url = `${config.baseURL}/memo/update/${memoId}`;
    console.log(' 요청 URL:', url);
    console.log(' 요청 메서드:', 'POST');
    console.log(' 요청 헤더:', JSON.stringify(headers, null, 2));

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
    console.log(' 메모 수정 성공!');
    console.log(' 서버 응답:', result);
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
      console.log(' 회원가입 성공!');
      console.log(' 서버 응답:', result);
      console.log(' 응답 타입:', typeof result);
      console.log(' success 필드:', result.success);
      console.log(' data 필드:', result.data);
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트로 읽기
      const responseText = await response.text();
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    // HTTP 200이면 성공으로 처리 (실제 DB에 저장되었으므로)
    console.log(' HTTP 200 응답 - 성공 처리');
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
  const config = getApiConfig();
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${config.baseURL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials)
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
      console.log(' 로그인 성공!');
      console.log(' 서버 응답:', result);
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트로 읽기
      const responseText = await response.text();
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    return result;
  } catch (error) {
    console.error(' 로그인 실패:', error.message);
    console.error(' API 엔드포인트:', `${config.baseURL}/auth/login`);
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
    console.log(' 회원탈퇴 성공!');
    console.log(' 서버 응답:', result);
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
    console.log(' 닉네임 변경 성공!');
    console.log(' 서버 응답:', result);
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
    console.log(' 비밀번호 변경 성공!');
    console.log(' 서버 응답:', result);
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

    console.log('프로필 이미지 저장 시작:', profileImageUrl);

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
    console.log('프로필 이미지 저장 성공!');
    console.log('서버 응답:', result);
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

    console.log('프로필 이미지 조회 시작:', userId);

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
    console.log(' 프로필 이미지 조회 성공!');
    console.log(' 서버 응답:', result);
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
    console.log('사용자 검색 API 호출:', url);

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
    console.log('사용자 검색 성공!');
    console.log('검색 결과:', result);
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

    console.log('공개설정 변경 시작:', privacySetting);

    const response = await fetch(`${config.baseURL}/api/user/update-privacy`, {
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
    console.log('공개설정 변경 성공!');
    console.log('서버 응답:', result);
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

    console.log('공개설정 조회 시작');

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
    console.log('공개설정 조회 성공!');
    console.log('서버 응답:', result);
    return result;
  } catch (error) {
    console.error('공개설정 조회 실패:', error.message);
    console.error('API 엔드포인트:', `${config.baseURL}/user/privacy-setting`);
    throw error;
  }
}; 