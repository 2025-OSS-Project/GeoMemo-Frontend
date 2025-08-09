import { RNS3 } from 'react-native-aws3';
import { getAWSConfig, getS3Url } from '../config/aws';

/**
 * 프론트엔드가 S3에 직접 업로드하는 방식
 * 1. 프론트엔드 → S3 직접 업로드
 * 2. 업로드된 URL을 백엔드에 USERID와 함께 저장 요청
 * 3. 조회 시 GET 요청으로 프로필 이미지 URL 받기
 * 
 * IAM 사용자: arn:aws:iam::067258969425:user/OSS_Back1
 */

/**
 * S3에 직접 업로드하는 함수
 * @param {string} imageUri - 로컬 이미지 URI
 * @param {string} userId - 사용자 ID (파일명에 사용)
 * @returns {Promise<string>} - 업로드된 이미지의 S3 URL
 */
export const uploadImageToS3 = async (imageUri, userId) => {
  try {
    console.log('S3 업로드 시작:', imageUri);
    console.log('사용자 ID:', userId);
    console.log('IAM 사용자: arn:aws:iam::067258969425:user/OSS_Back1');

    // AWS 설정 가져오기
    const awsConfig = getAWSConfig();
    
    // 파일명 생성 (사용자ID_timestamp.jpg)
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.jpg`;
    
    console.log('파일명:', fileName);
    console.log('S3 버킷:', awsConfig.bucket);
    console.log('리전:', awsConfig.region);

    // React Native용 파일 객체 생성
    const file = {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg'
    };

    // S3에 직접 업로드
    console.log('S3 업로드 중...');
    const result = await RNS3.put(file, awsConfig);
    
    if (result.status !== 201) {
      throw new Error(`S3 업로드 실패: ${result.status}`);
    }
    
    // 업로드된 URL 생성
    const uploadedUrl = result.body.postResponse.location;
    
    console.log('S3 업로드 성공!');
    console.log('업로드된 URL:', uploadedUrl);
    
    return uploadedUrl;
    
  } catch (error) {
    console.error('S3 업로드 실패:', error);
    console.error('에러 상세:', {
      message: error.message,
      stack: error.stack
    });
    throw new Error(`S3 업로드 실패: ${error.message}`);
  }
};

/**
 * 이미지 파일 크기 및 형식 검증
 * @param {string} imageUri - 이미지 URI
 * @returns {Promise<boolean>} - 검증 결과
 */
export const validateImage = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // 파일 크기 검사 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (blob.size > maxSize) {
      throw new Error('파일 크기가 5MB를 초과합니다.');
    }
    
    // 파일 형식 검사
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(blob.type)) {
      throw new Error('지원하지 않는 파일 형식입니다. (JPG, PNG만 가능)');
    }
    
    console.log('이미지 검증 통과');
    console.log('파일 크기:', (blob.size / 1024 / 1024).toFixed(2) + 'MB');
    console.log('파일 형식:', blob.type);
    
    return true;
    
  } catch (error) {
    console.error('이미지 검증 실패:', error);
    throw error;
  }
};
