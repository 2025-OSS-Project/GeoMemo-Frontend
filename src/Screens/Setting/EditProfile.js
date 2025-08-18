import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// expo-image-picker 사용 (권장)
import * as ExpoImagePicker from 'expo-image-picker';
// react-native-image-picker도 설치되어 있어서 별칭 사용
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePresignedUrl, updateProfileImage, setDefaultProfileImage } from '../../config/api';
import { uploadWithXHR } from '../../utils/s3Upload';

export default function EditProfile() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  // ExpoImagePicker MediaTypes 설정
  console.log('🔧 ExpoImagePicker 객체 확인:', {
    ExpoImagePicker: ExpoImagePicker,
    hasMediaTypeOptions: !!ExpoImagePicker.MediaTypeOptions,
    MediaTypeOptions: ExpoImagePicker.MediaTypeOptions,
    MediaType: ExpoImagePicker.MediaType,
    availableKeys: Object.keys(ExpoImagePicker)
  });
  
  // MediaTypeOptions가 없을 경우를 대비한 안전한 처리
  let MEDIA_TYPES;
  try {
    if (ExpoImagePicker.MediaTypeOptions && ExpoImagePicker.MediaTypeOptions.Images) {
      MEDIA_TYPES = ExpoImagePicker.MediaTypeOptions.Images;
      console.log('✅ MediaTypeOptions.Images 사용:', MEDIA_TYPES);
    } else {
      // fallback: 숫자 값 사용 (expo-image-picker 내부적으로 1은 이미지를 의미)
      MEDIA_TYPES = 1;
      console.log('⚠️ MediaTypeOptions.Images 없음, fallback 값 사용:', MEDIA_TYPES);
    }
  } catch (error) {
    console.error('❌ MediaTypes 설정 실패:', error);
    MEDIA_TYPES = 1; // 최후 fallback
  }
  
  console.log('🔧 MediaTypes 최종 값:', MEDIA_TYPES);

  // 미디어 라이브러리 권한 확실히 확보
  const ensureMediaPermission = async () => {
    try {
      // 현재 권한 상태 먼저 확인
      const current = await ExpoImagePicker.getMediaLibraryPermissionsAsync();
      console.log('현재 미디어 라이브러리 권한 상태:', current);
      
      if (current.granted) {
        console.log('✅ 미디어 라이브러리 권한 이미 허용됨');
        return true;
      }

      // 권한 요청
      console.log('미디어 라이브러리 권한 요청 중...');
      const { status, canAskAgain } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('권한 요청 결과:', { status, canAskAgain });
      
      if (status === 'granted') {
        console.log('✅ 미디어 라이브러리 권한 허용됨');
        return true;
      }

      if (!canAskAgain) {
        Alert.alert(
          '권한 필요',
          '설정 > 앱 권한에서 사진 라이브러리 접근을 허용해주세요.',
          [
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
            { text: '취소', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      }
      return false;
    } catch (error) {
      console.error('권한 확인/요청 실패:', error);
      return false;
    }
  };

  // 기본 이미지로 변경하는 함수
  const handleSetDefaultImage = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }

      Alert.alert(
        '기본 이미지로 변경',
        '프로필 사진을 기본 이미지로 변경하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '변경',
            onPress: async () => {
              try {
                await setDefaultProfileImage(userToken);
                setSelectedImage(null); // 선택된 이미지 초기화
                Alert.alert(
                  '성공',
                  '프로필 사진이 기본 이미지로 변경되었습니다!',
                  [
                    {
                      text: '확인',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } catch (error) {
                console.error('기본 이미지 설정 실패:', error);
                Alert.alert('오류', '기본 이미지로 변경 중 오류가 발생했습니다.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('기본 이미지 설정 실패:', error);
      Alert.alert('오류', '기본 이미지로 변경 중 오류가 발생했습니다.');
    }
  };

  // 이미지 선택 옵션 표시
  const showImagePicker = () => {
    console.log('이미지 선택 옵션 표시');
    Alert.alert(
      '프로필 사진 선택',
      '어떤 방법으로 사진을 선택하시겠어요?',
      [
        {
          text: '카메라',
          onPress: () => {
            console.log('카메라 선택됨');
            openCamera();
          },
        },
        {
          text: '갤러리',
          onPress: () => {
            console.log('갤러리 선택됨');
            openGallery();
          },
        },
        {
          text: '기본 이미지',
          onPress: () => {
            console.log('기본 이미지로 변경 선택됨');
            handleSetDefaultImage();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 카메라 권한 확실히 확보
  const ensureCameraPermission = async () => {
    try {
      // 현재 권한 상태 먼저 확인
      const current = await ExpoImagePicker.getCameraPermissionsAsync();
      console.log('현재 카메라 권한 상태:', current);
      
      if (current.granted) {
        console.log('✅ 카메라 권한 이미 허용됨');
        return true;
      }

      // 권한 요청
      console.log('카메라 권한 요청 중...');
      const { status, canAskAgain } = await ExpoImagePicker.requestCameraPermissionsAsync();
      console.log('카메라 권한 요청 결과:', { status, canAskAgain });
      
      if (status === 'granted') {
        console.log('✅ 카메라 권한 허용됨');
        return true;
      }

      if (!canAskAgain) {
        Alert.alert(
          '권한 필요',
          '설정 > 앱 권한에서 카메라 접근을 허용해주세요.',
          [
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
            { text: '취소', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('권한 필요', '카메라를 사용하려면 카메라 접근 권한이 필요합니다.');
      }
      return false;
    } catch (error) {
      console.error('카메라 권한 확인/요청 실패:', error);
      return false;
    }
  };

  // 카메라로 사진 촬영
  const openCamera = async () => {
    try {
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) return;

      console.log('카메라 실행 중...');
      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: MEDIA_TYPES,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        console.log('✅ 카메라로 촬영된 이미지 URI:', uri);
      }
    } catch (error) {
      console.error('카메라 실행 실패:', error);
      Alert.alert('오류', '카메라를 실행할 수 없습니다.');
    }
  };

  // 갤러리에서 사진 선택
  const openGallery = async () => {
    try {
      const hasPermission = await ensureMediaPermission();
      if (!hasPermission) return;

      console.log('갤러리 실행 중...');
      
      // 일부 단말은 권한 요청 직후 바로 실행하면 UI가 안 뜨는 버그가 있어, 100ms 지연
      setTimeout(async () => {
        try {
          const result = await ExpoImagePicker.launchImageLibraryAsync({
            mediaTypes: MEDIA_TYPES,   // 호환성 있는 방식
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            presentationStyle: 'fullScreen',            // iOS용, 문제 없으면 둬도 됨
          });

          if (!result.canceled && result.assets && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            console.log('✅ 갤러리에서 선택된 이미지 URI:', uri);
          }
        } catch (error) {
          console.error('갤러리 실행 중 오류:', error);
          Alert.alert('오류', '갤러리를 열 수 없습니다.');
        }
      }, 100);
      
    } catch (error) {
      console.error('갤러리 열기 실패:', error);
      Alert.alert('오류', '갤러리를 열 수 없습니다.');
    }
  };

  // 파일명/타입 안전 처리 헬퍼
  const pickFileNameAndType = (asset) => {
    const mime = asset?.mimeType || 'image/jpeg';
    const ext = mime === 'image/png' ? 'png'
              : mime === 'image/webp' ? 'webp'
              : 'jpeg';
    const fileName = `profile_${Date.now()}.${ext}`;
    return { fileName, mime };
  };

  // 프로필 저장 함수 (S4 호환 presigned 방식)
  const handleSaveProfile = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '변경할 프로필 사진을 선택해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. 사용자 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }
      
      // 2-1. 파일명/타입 안전 결정
      // 실제 이미지에서 MIME 타입 추출 시도
      let mimeType = 'image/jpeg'; // 기본값
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        mimeType = blob.type || 'image/jpeg';
      } catch (error) {
        console.warn('MIME 타입 추출 실패, 기본값 사용:', error.message);
      }
      
      const asset = { uri: selectedImage, mimeType };
      const { fileName, mime } = pickFileNameAndType(asset);

      // 3. Presigned URL 생성 (백엔드 스펙에 맞춰 그대로 유지)
      console.log('Presigned URL 생성 시작...');
      const presigned = await generatePresignedUrl(fileName, mime, userToken);
      const uploadUrl = typeof presigned === 'string' ? presigned : presigned.url; // ★ 중요
      if (!uploadUrl) throw new Error('Presigned URL이 비어있습니다.');

      // 4. 진행률이 필요한 경우 XHR 사용, 아니면 fetch 사용
      console.log('S3(S4) 업로드 시작...');
      setStatus('파일 업로드 중...');
      
      if (true) { // 진행률 표시를 원할 경우 true로 설정
        // XHR을 사용한 진행률 표시 업로드
        await uploadWithXHR(uploadUrl, selectedImage, mime, (progress) => {
          setProgress(progress);
        });
      } else {
        // fetch를 사용한 간단한 업로드 (진행률 없음)
        const fileRes = await fetch(selectedImage);
        const blob = await fileRes.blob();
        
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': mime },
          body: blob,
        });

        if (!putRes.ok) {
          const t = await putRes.text().catch(() => '');
          throw new Error(`업로드 실패 ${putRes.status}: ${t}`);
        }
      }

      setStatus('업로드 완료');
      setProgress(100);

      // 6. 보기용 URL (버킷/CF 공개 정책에 따라 달라질 수 있음)
      const imageUrl = uploadUrl.split('?')[0];

      // 7. 백엔드에 이미지 URL 저장
      console.log('백엔드에 URL 저장 시작...');
      await updateProfileImage(imageUrl, userToken);
      
      Alert.alert(
        '성공',
        '프로필 사진이 성공적으로 변경되었습니다!',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('프로필 사진 업로드 실패:', error);
      Alert.alert(
        '오류', 
        error.message || '프로필 사진 업로드 중 오류가 발생했습니다.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* 상단 텍스트 */}
      <Text style={styles.title}>회원정보 수정</Text>

      {/* 프로필 사진 (클릭 시 수정 가능) */}
      <TouchableOpacity style={styles.photoContainer} onPress={showImagePicker}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera" size={30} color="#fff" />
            <Text style={styles.photoText}>사진 선택</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 닉네임 변경 버튼 */}
      <TouchableOpacity style={styles.optionBox} onPress={() => navigation.navigate('ChangeNickname')}>
        <Text style={styles.optionText}>닉네임 변경</Text>
      </TouchableOpacity>

      {/* 비밀번호 변경 버튼 */}
      <TouchableOpacity style={styles.optionBox} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.optionText}>비밀번호 변경</Text>
      </TouchableOpacity>

      {/* 업로드 진행률 표시 */}
      {isUploading && (
        <View style={styles.progressContainer}>
          <Text style={styles.statusText}>{status}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      {/* 저장 버튼 */}
      <TouchableOpacity 
        style={[styles.saveButton, isUploading && styles.saveButtonDisabled]} 
        onPress={handleSaveProfile}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.saveText}>저장</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 30,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  optionBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6EE58F',
    borderRadius: 999, // 완전 둥글게
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 235,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6EE58F',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
