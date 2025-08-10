import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn } from '../../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    // 입력값 검증
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const loginStartTime = performance.now();
    setIsLoading(true);

    try {
      const credentials = {
        email: email.trim(),
        password: password
      };

      const result = await signIn(credentials);
      
      if (result.access_token) {
        // 로그인 성공 - 즉시 화면 전환 (모든 백그라운드 작업 연기)
        const navigationStartTime = performance.now();
        console.log('로그인 성공! 홈 화면으로 즉시 이동...');
        
        // 즉시 화면 전환 (사용자 경험 최우선)
        navigation.navigate('MemoMap');
        
        const navigationEndTime = performance.now();
        console.log(`화면 전환 완료: ${(navigationEndTime - navigationStartTime).toFixed(2)}ms`);
        
        // 모든 백그라운드 작업을 더 긴 지연 후에 처리
        setTimeout(() => {
          // 토큰 저장
          AsyncStorage.setItem('userToken', result.access_token)
            .then(() => console.log('토큰 저장 완료'))
            .catch(error => console.error('토큰 저장 실패:', error));
        }, 500); // 500ms 후 백그라운드에서 처리
        
        const totalLoginTime = performance.now() - loginStartTime;
        console.log(`전체 로그인 프로세스: ${totalLoginTime.toFixed(2)}ms`);
      } else {
        Alert.alert('오류', '로그인에 실패했습니다.');
      }
      
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>GeoMemo</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        placeholder="email@email.com"
        placeholderTextColor="#999"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        editable={!isLoading}
      />

      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        placeholder="비밀번호"
        placeholderTextColor="#999"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        editable={!isLoading}
      />

      <TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.loginButtonText}>로그인 중...</Text>
          </View>
        ) : (
          <Text style={styles.loginButtonText}>로그인</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.or}>또는</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={[styles.socialButton, styles.googleButton]} disabled={isLoading}>
        <Text style={styles.socialText}>Google로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, styles.naverButton]} disabled={isLoading}>
        <Text style={styles.socialText}>Naver로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, styles.kakaoButton]} disabled={isLoading}>
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
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
