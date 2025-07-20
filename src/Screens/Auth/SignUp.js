import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function SignUp() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} placeholder="email@eamil.com" keyboardType="email-address" />

      <Text style={styles.label}>비밀번호</Text>
      <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry />

      <Text style={styles.label}>비밀번호 확인</Text>
      <TextInput style={styles.input} placeholder="비밀번호 확인" secureTextEntry />

      <Text style={styles.label}>이름</Text>
      <TextInput style={styles.input} placeholder="이름" />

      <Text style={styles.label}>닉네임</Text>
      <TextInput style={styles.input} placeholder="12글자 이내로 입력하세요." maxLength={12} />

      <Text style={styles.label}>전화번호</Text>
      <TextInput style={styles.input} placeholder="'-' 없이 입력하세요." keyboardType="phone-pad" />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>가입하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: -50,
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 14,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
