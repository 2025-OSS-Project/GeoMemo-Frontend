import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);

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

  // 프로필 저장 함수 (나중에 S3 업로드 로직 추가 예정)
  const handleSaveProfile = () => {
    if (selectedImage) {
      Alert.alert(
        '알림',
        '프로필 사진이 선택되었습니다. S3 업로드 기능은 백엔드와 협의 후 구현 예정입니다.',
        [
          {
            text: '확인',
            onPress: () => console.log('선택된 이미지:', selectedImage)
          }
        ]
      );
    } else {
      Alert.alert('알림', '변경할 프로필 사진을 선택해주세요.');
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveText}>저장</Text>
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
  saveText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
