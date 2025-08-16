/**
 * S4(보안 강화된 S3 호환) presigned 업로드 유틸리티
 * 
 * 보안상 IAM 키를 클라이언트에 노출하지 않고 presigned URL을 통한 안전한 업로드만 지원
 * RNS3 직접 업로드는 보안상 위험하므로 제거됨
 */

/**
 * 파일명/타입 안전 처리 헬퍼
 * @param {Object} asset - 이미지 에셋 객체
 * @returns {Object} - { fileName, mime }
 */
export const pickFileNameAndType = (asset) => {
  const mime = asset?.mimeType || 'image/jpeg';
  const ext = mime === 'image/png' ? 'png'
            : mime === 'image/webp' ? 'webp'
            : 'jpeg';
  const fileName = `upload_${Date.now()}.${ext}`;
  return { fileName, mime };
};

/**
 * presigned URL을 통한 안전한 업로드 (권장)
 * @param {string} uploadUrl - presigned URL
 * @param {string} fileUri - 로컬 파일 URI
 * @param {string} mime - MIME 타입
 * @param {Function} onProgress - 진행률 콜백 (선택사항)
 * @returns {Promise<void>}
 */
export const uploadWithPresigned = async (uploadUrl, fileUri, mime, onProgress) => {
  try {
    console.log('Presigned 업로드 시작:', { uploadUrl: uploadUrl.substring(0, 100) + '...', mime });
    
    // 로컬 파일을 Blob으로 읽기
    const fileRes = await fetch(fileUri);
    const blob = await fileRes.blob();
    
    console.log('파일 크기:', (blob.size / 1024 / 1024).toFixed(2) + 'MB');
    
    // PUT 요청으로 업로드
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mime },
      body: blob,
    });

    if (!putRes.ok) {
      const errorText = await putRes.text().catch(() => '');
      throw new Error(`업로드 실패 ${putRes.status}: ${errorText}`);
    }

    console.log('✅ Presigned 업로드 성공');
    if (onProgress) onProgress(100);
    
  } catch (error) {
    console.error('❌ Presigned 업로드 실패:', error);
    throw error;
  }
};

/**
 * 진행률이 필요한 경우를 위한 XHR 업로드 (대안)
 * @param {string} uploadUrl - presigned URL
 * @param {string} fileUri - 로컬 파일 URI
 * @param {string} mime - MIME 타입
 * @param {Function} onProgress - 진행률 콜백
 * @returns {Promise<void>}
 */
export const uploadWithXHR = (uploadUrl, fileUri, mime, onProgress) => new Promise(async (resolve, reject) => {
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);

    xhr.setRequestHeader('Content-Type', mime);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`업로드 실패 ${xhr.status}: ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('업로드 중 네트워크 오류'));

    xhr.send(blob);
  } catch (e) {
    reject(e);
  }
});

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

/**
 * @deprecated RNS3 직접 업로드는 보안상 위험하므로 사용하지 마세요
 * 대신 presigned URL을 통한 업로드를 사용하세요
 */
export const uploadImageToS3 = async () => {
  throw new Error('RNS3 직접 업로드는 보안상 위험하므로 사용이 중단되었습니다. presigned URL 방식을 사용하세요.');
};
