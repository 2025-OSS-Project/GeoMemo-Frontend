import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadImageToS3, validateImage } from '../../utils/s3Upload';
import { saveProfileImage } from '../../config/api';

export default function EditProfile() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // 사용자 ID 가져오기 (실제로는 AsyncStorage나 Context에서 가져와야 함)
  const getUserId = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('로그인이 필요합니다.');
      }
      // 실제로는 토큰을 디코딩하거나 API를 통해 사용자 ID를 가져와야 합니다
      // 임시로 토큰을 사용자 ID로 사용
      return userToken.substring(0, 10); // 임시 사용자 ID
    } catch (error) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }
  };

  // 프로필 저장 함수 (S3 업로드 + API 호출)
  const handleSaveProfile = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '변경할 프로필 사진을 선택해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. 이미지 검증
      await validateImage(selectedImage);
      
      // 2. 사용자 토큰과 ID 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }
      
      const userId = await getUserId();
      
      // 3. S3에 이미지 직접 업로드
      console.log('S3 업로드 시작...');
      const imageUrl = await uploadImageToS3(selectedImage, userId);
      
      // 4. 백엔드에 이미지 URL 저장 (API 명세서에 맞춤)
      console.log('백엔드에 URL 저장 시작...');
      const result = await saveProfileImage(imageUrl, userToken);
      
      if (result.success) {
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
      } else {
        throw new Error('프로필 이미지 저장에 실패했습니다.');
      }
      
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
    marginTop: 275,
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
});
