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

export default function ChangeNickname() {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');

  return (
    <View style={styles.container}>

      {/* 제목 */}
      <Text style={styles.title}>닉네임 변경</Text>

      {/* 안내 문구 */}
      <Text style={styles.label}>새로운 닉네임을 입력해주세요.</Text>

      {/* 입력 필드 */}
      <TextInput
        style={styles.input}
        placeholder="전 닉네임"
        placeholderTextColor="#aaa"
        value={nickname}
        onChangeText={setNickname}
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
    fontSize: 15,
    marginBottom: 12,
    marginTop: 30,
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
    borderRadius: 999, // 완전 둥글게
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 475,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
