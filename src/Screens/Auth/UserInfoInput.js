import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UserInfo( ) {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사용자 정보입력</Text>

      <Text style={styles.label}>닉네임</Text>
      <TextInput
        style={styles.input}
        placeholder="12글자 이내로 입력하세요."
        maxLength={12}
        value={nickname}
        onChangeText={setNickname}
      />

      <Text style={styles.label}>전화번호</Text>
      <TextInput
        style={styles.input}
        placeholder="'-' 없이 입력하세요."
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>가입완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    alignSelf: 'center' 
  },
  label: { 
    ontSize: 16, 
    marginBottom: 4 
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc',
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 395,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
