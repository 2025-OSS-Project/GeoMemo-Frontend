import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { checkEmailVerification } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmailVerification() {
  const navigation = useNavigation();
  const route = useRoute();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 회원가입에서 전달받은 이메일 주소
  const email = route.params?.email || '';

  const handleVerification = async () => {
    if (!code.trim()) {
      setErrorMessage('인증 코드를 입력해주세요.');
      return;
    }

    if (code.length !== 6) {
      setErrorMessage('6자리 인증 코드를 정확히 입력해주세요.');
      return;
    }

    if (!email) {
      setErrorMessage('이메일 정보를 찾을 수 없습니다. 회원가입을 다시 진행해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('이메일 인증 시작:', { email, code });
      
      const result = await checkEmailVerification(email, code);
      
      console.log('이메일 인증 성공:', result);
      
      // 인증 성공 시 사용자에게 알림
      Alert.alert(
        '인증 완료',
        '이메일 인증이 완료되었습니다. 로그인 화면으로 이동합니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 인증 완료 상태를 저장
              AsyncStorage.setItem('emailVerified', 'true');
              // 로그인 화면으로 이동
              navigation.navigate('Login');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('이메일 인증 실패:', error.message);
      
      let displayMessage = '인증에 실패했습니다.';
      
      // API 에러 메시지 처리
      if (error.message.includes('422')) {
        displayMessage = '잘못된 인증 코드입니다. 다시 확인해주세요.';
      } else if (error.message.includes('400')) {
        displayMessage = '잘못된 요청입니다.';
      } else if (error.message.includes('500')) {
        displayMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('Validation error')) {
        displayMessage = '입력 정보를 확인해주세요.';
      } else {
        displayMessage = error.message || '인증에 실패했습니다.';
      }
      
      setErrorMessage(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />



      <View style={styles.content}>
        <Text style={styles.title}>이메일 인증</Text>
        <Text style={styles.description}>
          {email ? `${email}로 발송된` : '이메일로 발송된'} 6자리 인증 코드를 입력해주세요.
        </Text>

        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>이메일 주소:</Text>
          <Text style={styles.emailText}>{email || '이메일 정보 없음'}</Text>
        </View>

        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder="6자리 숫자를 입력하세요"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (errorMessage) setErrorMessage('');
          }}
          editable={!isLoading}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity 
          style={styles.backToLoginButton} 
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
        >
          <Text style={styles.backToLoginText}>첫 화면으로 돌아가기</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading ? styles.buttonDisabled : null]} 
          onPress={handleVerification}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>인증 완료</Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingBottom: 100, // 키보드 공간 확보
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  emailContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    marginTop: 6,
  },
  emailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  button: {
    marginTop: 300,
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backToLoginButton: {
    padding: 0,
    alignItems: 'flex-start',
    marginTop: 20,
  },
  backToLoginText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

});
