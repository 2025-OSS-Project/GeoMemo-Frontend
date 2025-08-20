// API 예외 처리를 위한 통합 에러 핸들러
import { Alert } from 'react-native';

// HTTP 상태 코드별 에러 타입
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// 에러 코드별 사용자 친화적인 메시지
export const ERROR_MESSAGES = {
  // 회원가입 관련 (USR_001, USR_002, USR_003, USR_004, USR_005, USR_006, USR_007, USR_999)
  USR_001: '필수 입력값이 누락되었습니다. (사용자명, 비밀번호 등)',
  USR_002: '유효하지 않은 이메일 형식입니다.',
  USR_003: '비밀번호 형식이 올바르지 않습니다. (최소 8자, 문자+숫자 포함)',
  USR_004: '이미 존재하는 닉네임입니다.',
  USR_005: '이미 사용 중인 이메일입니다.',
  USR_006: '닉네임 길이가 너무 깁니다. (최대 20자)',
  USR_007: '전화번호 형식이 올바르지 않습니다.',
  USR_999: '서버 내부 오류가 발생했습니다.',

  // 정수 에러 코드 (백엔드에서 전송하는 형태)
  4003: '비밀번호 형식이 올바르지 않습니다. (최소 8자, 문자+숫자 포함)',
  4006: '닉네임 길이가 너무 깁니다. (최대 20자)',
  4007: '전화번호 형식이 올바르지 않습니다.',
  4091: '이미 존재하는 닉네임입니다.',
  4092: '이미 사용 중인 이메일입니다.',
  5999: '서버 내부 오류가 발생했습니다.',

  // 기타
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  
  // 인사이트 조회 관련
  USER_NOT_FOUND: '해당 사용자가 없습니다.',
  INSIGHT_NOT_FOUND: '인사이트가 없습니다.',
  CONNECTION_ERROR: 'DB 오류 발생: 데이터베이스 연결에 문제가 발생했습니다.',
  UNEXPECTED_ERROR: '예상치 못한 오류 발생: 잠시 후 다시 시도해주세요.',
  
  // 추천 요청 관련
  LOCATION_NOT_FOUND: '조건에 맞는 장소가 없습니다.',
  
  // 감정 분석 요청 관련
  MEMO_NOT_FOUND: '해당 메모를 찾을 수 없습니다.',
  
  // 추천 결과 조회 관련
  RECOMMENDATION_NOT_FOUND: '추천 결과가 아직 없습니다.',
  REDIS_ERROR: 'Redis 오류 발생: 캐시 서버에 문제가 발생했습니다.',
  
  // 메모 생성 관련
  INVALID_INPUT: '입력 정보가 올바르지 않습니다',
  
  // 정수 에러 코드 (인사이트 조회)
  2000: '해당 사용자가 없습니다.',
  4005: '인사이트가 없습니다.',
  9000: '예상치 못한 오류 발생: 잠시 후 다시 시도해주세요.',
  9001: 'DB 오류 발생: 데이터베이스 연결에 문제가 발생했습니다.',
  
  // 정수 에러 코드 (추천 요청)
  4008: '조건에 맞는 장소가 없습니다.',
  
  // 정수 에러 코드 (감정 분석 요청)
  4002: '해당 사용자의 공개 메모가 없습니다.',
  
  // 정수 에러 코드 (추천 결과 조회)
  4009: '추천 결과가 아직 없습니다.',
  
  // 정수 에러 코드 (메모 생성)
  1100: '입력 정보가 올바르지 않습니다. 제목, 내용, 위치 정보, 주소, 카테고리를 확인해주세요.',
  
  // 정수 에러 코드 (메모 삭제)
  4010: '삭제할 메모가 없습니다.',
  4011: '해당 메모에 연결된 위치를 찾을 수 없습니다.',
  
  // 정수 에러 코드 (메모 수정)
  4012: '메모가 존재하지 않습니다.',
  2004: '해당 메모를 수정할 권한이 없습니다.',
  
  // 정수 에러 코드 (모든 메모 조회)
  1101: '유효하지 않은 view_setting 값입니다. 올바른 값을 입력해주세요.',
  
  // 정수 에러 코드 (단일 메모 조회)
  4013: '해당 사용자의 메모를 찾을 수 없습니다.',
  
  // 정수 에러 코드 (메모 스크랩)
  4014: '스크랩하려는 메모가 존재하지 않습니다.',
  2005: '비공개 메모는 스크랩할 수 없습니다.',
  1102: '이미 스크랩한 메모입니다.',
  
  // 정수 에러 코드 (스크랩 해제)
  4001: '해당 스크랩이 존재하지 않습니다.'
};

// HTTP 상태 코드별 에러 타입 매핑
export const getErrorTypeByStatus = (status) => {
  if (status >= 200 && status < 300) return null; // 성공
  
  if (status === 400) return ERROR_TYPES.VALIDATION_ERROR;
  if (status === 401) return ERROR_TYPES.AUTHENTICATION_ERROR;
  if (status === 403) return ERROR_TYPES.AUTHORIZATION_ERROR;
  if (status === 404) return ERROR_TYPES.NOT_FOUND_ERROR;
  if (status === 409) return ERROR_TYPES.CONFLICT_ERROR;
  if (status === 422) return ERROR_TYPES.VALIDATION_ERROR;
  if (status === 429) return ERROR_TYPES.VALIDATION_ERROR;
  if (status >= 500) return ERROR_TYPES.SERVER_ERROR;
  
  return ERROR_TYPES.UNKNOWN_ERROR;
};

// 에러 코드 추출 함수
export const extractErrorCode = (errorData) => {
  if (!errorData) return null;

  // 다양한 에러 코드 필드명 확인
  let errorCode = errorData.errorCode ||
                  errorData.error_code ||
                  errorData.code ||
                  errorData.errorCode ||
                  null;

  // 에러 코드가 숫자 문자열인 경우 정수로 변환
  if (errorCode && !isNaN(errorCode)) {
    errorCode = parseInt(errorCode, 10);
  }

  return errorCode;
};

// 에러 메시지 추출 함수
export const extractErrorMessage = (errorData) => {
  if (!errorData) return '알 수 없는 오류가 발생했습니다';
  
  // 상세 메시지 우선 추출
  if (errorData.detail) {
    if (Array.isArray(errorData.detail)) {
      return errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
    }
    return errorData.detail;
  }
  
  // 기타 메시지 필드 확인
  return errorData.error || errorData.message || '알 수 없는 오류가 발생했습니다';
};

// 사용자 친화적인 에러 메시지 생성
export const getUserFriendlyMessage = (status, errorCode, detail) => {
  // 에러 코드가 있으면 해당 메시지 사용 (문자열과 정수 모두)
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // 정수 에러 코드의 경우 API 명세서에 정의된 코드들만 처리
  if (typeof errorCode === 'number' && [1100, 1101, 1102, 2000, 2004, 2005, 4001, 4002, 4003, 4006, 4007, 4008, 4009, 4010, 4011, 4012, 4013, 4014, 4091, 4092, 5999, 4005, 9000, 9001].includes(errorCode)) {
    if (ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
  }
  
  // HTTP 상태 코드별 기본 메시지 (API 명세서에 정의된 것만)
  switch (status) {
    case 400:
      return '입력 정보를 확인해주세요';
      
    case 404:
      return '요청한 정보를 찾을 수 없습니다';
      
    case 409:
      return '입력하신 정보 중 중복된 항목이 있습니다. 이메일, 닉네임을 확인해주세요';
      
    case 429:
      return ERROR_MESSAGES.TOO_MANY_REQUESTS;
      
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
      
    default:
      return '알 수 없는 오류가 발생했습니다';
  }
};

// API 에러 객체 생성
export const createApiError = (status, errorData, originalError = null) => {
  const errorCode = extractErrorCode(errorData);
  const detail = extractErrorMessage(errorData);
  const message = getUserFriendlyMessage(status, errorCode, detail);
  const type = getErrorTypeByStatus(status);
  
  const error = new Error(message);
  error.status = status;
  error.errorCode = errorCode;
  error.detail = detail;
  error.type = type;
  error.originalError = originalError;
  
  return error;
};

// 네트워크 에러 처리
export const handleNetworkError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    const networkError = new Error('네트워크 연결을 확인해주세요');
    networkError.type = ERROR_TYPES.NETWORK_ERROR;
    networkError.originalError = error;
    return networkError;
  }
  return error;
};

// 에러 로깅 (개발 환경에서만)
export const logError = (context, error, additionalInfo = {}) => {
  // 콘솔 에러 출력 제거
  // if (__DEV__) {
  //   console.error(`❌ ${context} 실패:`, {
  //     message: error.message,
  //     status: error.status,
  //     errorCode: error.errorCode,
  //     type: error.type,
  //     detail: error.detail,
  //     ...additionalInfo
  //   });
    
  //   if (error.originalError) {
  //     console.error('원본 에러:', error.originalError);
  //   }
  // }
};

// 사용자에게 에러 알림 표시
export const showErrorAlert = (title, message, onPress = null) => {
  Alert.alert(
    title || '오류',
    message || '알 수 없는 오류가 발생했습니다',
    [
      {
        text: '확인',
        onPress: onPress
      }
    ]
  );
};

// 에러 타입별 적절한 사용자 피드백 제공
export const handleErrorForUser = (error, context = '작업') => {
  const errorMessage = error.message || '알 수 없는 오류가 발생했습니다';
  
  // 에러 타입별 다른 처리
  switch (error.type) {
    case ERROR_TYPES.AUTHENTICATION_ERROR:
      showErrorAlert('인증 오류', '로그인이 필요하거나 만료되었습니다. 다시 로그인해주세요.');
      break;
      
    case ERROR_TYPES.AUTHORIZATION_ERROR:
      showErrorAlert('권한 없음', '해당 작업을 수행할 권한이 없습니다.');
      break;
      
    case ERROR_TYPES.VALIDATION_ERROR:
      showErrorAlert('입력 오류', errorMessage);
      break;
      
    case ERROR_TYPES.NOT_FOUND_ERROR:
      showErrorAlert('찾을 수 없음', errorMessage);
      break;
      
    case ERROR_TYPES.CONFLICT_ERROR:
      showErrorAlert('충돌', errorMessage);
      break;
      
    case ERROR_TYPES.SERVER_ERROR:
      showErrorAlert('서버 오류', '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      break;
      
    case ERROR_TYPES.NETWORK_ERROR:
      showErrorAlert('네트워크 오류', '네트워크 연결을 확인해주세요.');
      break;
      
    default:
      showErrorAlert('오류', errorMessage);
      break;
  }
};

// API 응답 에러 처리 통합 함수
export const handleApiError = async (response, context = 'API 요청') => {
  if (response.ok) return null;
  
  let errorData = null;
  
  try {
    errorData = await response.json();
  } catch (parseError) {
    try {
      const errorText = await response.text();
      errorData = { detail: errorText };
    } catch (textError) {
      errorData = { detail: `HTTP error! status: ${response.status}` };
    }
  }
  
  const error = createApiError(response.status, errorData);
  // logError(context, error, { responseStatus: response.status });
  
  return error
};

// 특정 에러 코드에 대한 처리 함수
export const isSpecificError = (error, errorCode) => {
  return error.errorCode === errorCode;
};

// 재시도 가능한 에러인지 확인
export const isRetryableError = (error) => {
  return error.type === ERROR_TYPES.SERVER_ERROR || 
         error.type === ERROR_TYPES.NETWORK_ERROR ||
         error.status >= 500;
};

// 에러 복구 제안 메시지
export const getRecoverySuggestion = (error) => {
  switch (error.type) {
    case ERROR_TYPES.AUTHENTICATION_ERROR:
      return '다시 로그인해주세요';
      
    case ERROR_TYPES.NETWORK_ERROR:
      return '네트워크 연결을 확인하고 다시 시도해주세요';
      
    case ERROR_TYPES.SERVER_ERROR:
      return '잠시 후 다시 시도해주세요';
      
    case ERROR_TYPES.VALIDATION_ERROR:
      return '입력 정보를 확인하고 다시 시도해주세요';
      
    default:
      return '다시 시도해주세요';
  }
};
