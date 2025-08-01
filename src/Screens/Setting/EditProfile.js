import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EditProfile() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      {/* 상단 텍스트 */}
      <Text style={styles.title}>회원정보 수정</Text>

      {/* 프로필 사진 (클릭 시 수정 가능) */}
      <TouchableOpacity style={styles.photoContainer}>
        <Text style={styles.photoText}>photo</Text>
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
      <TouchableOpacity style={styles.saveButton}>
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
    borderRadius: 150,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  photoText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
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
