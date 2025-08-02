import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ChangePassword() {
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <View style={styles.container}>

      {/* 제목 */}
      <Text style={styles.title}>비밀번호 변경</Text>

      {/* 안내 문구 */}
      <Text style={styles.label}>새로운 비밀번호를 입력해주세요.</Text>

      {/* 현재 비밀번호 */}
      <Text style={styles.inputLabel}>현재 비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      {/* 새 비밀번호 */}
      <Text style={styles.inputLabel}>새 비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      {/* 새 비밀번호 확인 */}
      <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

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
    marginBottom: 30,
  },
  label: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6EE58F',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignSelf: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#6EE58F',
    borderRadius: 999, // 완전 둥글게
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 200,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
