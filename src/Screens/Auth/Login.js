import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GeoMemo</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        placeholder="email@email.com"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        placeholder="비밀번호"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('MemoMap')}>
        <Text style={styles.loginButtonText} > 로그인</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.or}>또는</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => navigation.navigate('UserInfoInput')}>
        <Text style={styles.socialText}>Google로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, styles.naverButton]} onPress={() => navigation.navigate('UserInfoInput')}>
        <Text style={styles.socialText}>Naver로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, styles.kakaoButton]} onPress={() => navigation.navigate('UserInfoInput')}>
        <Text style={styles.socialText}>Kakao로 로그인</Text>
      </TouchableOpacity>


      <Text style={styles.bottomText}>
        계정이 없으신가요?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('SignUp')}>
          가입하기
        </Text>
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: -90,
    marginBottom: 40,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#aaa',
  },
  or: {
    marginHorizontal: 8,
    color: '#666',
  },
  socialButton: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  socialText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bottomText: {
    marginTop: 50,
    textAlign: 'left',
    color: '#333',
  },
  linkText: {
    color: '#3366ff',
    fontWeight: 'bold',
  },
    googleButton: {
    backgroundColor: '#e2e1e1ff',
  },
  naverButton: {
    backgroundColor: '#03C75A',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
});
