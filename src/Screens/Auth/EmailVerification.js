import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EmailVerification() {
  const navigation = useNavigation();
  const [code, setCode] = useState('');

  return (
    <View style={styles.container}>

      <Text style={styles.title}>이메일 인증 코드</Text>
      <Text style={styles.description}>
        이메일 인증 코드를 해당 이메일로 발급하였습니다. 아래에 6자리를 입력해주세요.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="6자리 숫자를 입력하세요"
        keyboardType="numeric"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MemoMap')}>
        <Text style={styles.buttonText}>가입완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 410,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
