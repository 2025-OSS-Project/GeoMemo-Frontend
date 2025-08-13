import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { generatePresignedUrl, updateProfileImage } from '../../config/api';

export default function EditProfile() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  // 권한 요청 함수
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  // 이미지 선택 옵션 표시
  const showImagePicker = () => {
    Alert.alert(
      '프로필 사진 선택',
      '어떤 방법으로 사진을 선택하시겠어요?',
      [
        {
          text: '카메라',
          onPress: openCamera,
        },
        {
          text: '갤러리',
          onPress: openGallery,
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  // 카메라로 사진 촬영
  const openCamera = async () => {
    const hasPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (hasPermission.status !== 'granted') {
      Alert.alert('권한 필요', '카메라를 사용하려면 카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      console.log('선택된 이미지 URI:', result.assets[0].uri);
    }
  };

  // 갤러리에서 사진 선택
  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      console.log('선택된 이미지 URI:', result.assets[0].uri);
    }
  };

  // 프로필 저장 함수 (Presigned URL 방식 + axios)
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
      
      // 2. 파일명과 타입 설정
      const fileExtension = selectedImage.split('.').pop();
      const fileName = `profile_${Date.now()}.${fileExtension}`;
      const fileType = `image/${fileExtension}`;

      // 3. Presigned URL 생성
      console.log('Presigned URL 생성 시작...');
      const presignedUrl = await generatePresignedUrl(fileName, fileType, userToken);
      
      // 4. 이미지를 base64로 변환 (React Native 호환)
      const response = await fetch(selectedImage);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // 5. axios를 사용하여 S3에 직접 업로드
      console.log('S3 업로드 시작...');
      setStatus('파일 업로드 중...');
      
      await axios.put(presignedUrl, base64, {
        headers: {
          'Content-Type': fileType,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      setStatus('업로드 완료');
      setProgress(100);

      // 6. 업로드된 이미지 URL 생성 (presigned URL에서 쿼리 파라미터 제거)
      const imageUrl = presignedUrl.split('?')[0];
      
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
