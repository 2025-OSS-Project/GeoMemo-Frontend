/**
 * AWS 설정 파일
 * 보안을 위해 실제 키는 환경변수나 별도 설정에서 관리
 */

// AWS IAM 사용자 정보
export const AWS_CONFIG = {
  // IAM 사용자 ARN: arn:aws:iam::067258969425:user/OSS_Back1
  accountId: '067258969425',
  iamUser: 'OSS_Back1',
  
  // S3 설정
  s3: {
    bucket: 'geomemo',
    region: 'ap-northeast-2',
    keyPrefix: 'profile-images/',
  },
  
  // 실제 키는 여기서 설정 (프로덕션에서는 환경변수 사용)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET_ACCESS_KEY',
  }
};

// 개발/프로덕션 환경별 설정
export const getAWSConfig = () => {
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    // 개발 환경: 실제 키 사용 (보안 주의!)
    return {
      ...AWS_CONFIG.s3,
      accessKey: AWS_CONFIG.credentials.accessKeyId,
      secretKey: AWS_CONFIG.credentials.secretAccessKey,
      successActionStatus: 201
    };
  } else {
    // 프로덕션 환경: 환경변수에서 가져오기
    return {
      ...AWS_CONFIG.s3,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      successActionStatus: 201
    };
  }
};

// S3 URL 생성 함수
export const getS3Url = (key) => {
  return `https://${AWS_CONFIG.s3.bucket}.s3.${AWS_CONFIG.s3.region}.amazonaws.com/${key}`;
};

// IAM 정책 예시 (참고용)
export const REQUIRED_IAM_POLICY = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": `arn:aws:s3:::${AWS_CONFIG.s3.bucket}/${AWS_CONFIG.s3.keyPrefix}*`
    }
  ]
};
