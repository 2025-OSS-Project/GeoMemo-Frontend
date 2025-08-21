import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, validateToken } from '../../config/api';
import SafeScreen from '../../utils/SafeScreen';

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
    
    // 디버깅: 현재 저장된 토큰 확인
    try {
      const existingToken = await AsyncStorage.getItem('userToken');
      if (existingToken) {
        console.log('기존 저장된 토큰 발견:', existingToken.substring(0, 20) + '...');
      } else {
        console.log('기존 저장된 토큰 없음');
      }
    } catch (error) {
      console.log('기존 토큰 확인 실패:', error.message);
    }

    try {
      const credentials = {
        email: email.trim(),
        password: password
      };

      const result = await signIn(credentials);
      
      // 로그인 성공 시에만 콘솔 출력
      console.log('로그인 성공! 홈 화면으로 이동합니다.');
      
      // 다양한 토큰 필드명 지원
      let token = null;
      if (result.access_token) {
        token = result.access_token;
      } else if (result.token) {
        token = result.token;
      } else if (result.accessToken) {
        token = result.accessToken;
      } else if (result.data && result.data.access_token) {
        token = result.data.access_token;
      } else {
        // 토큰을 찾을 수 없는 경우만 경고 출력
        console.warn('토큰을 찾을 수 없습니다. 응답 구조를 확인해주세요.');
        Alert.alert('오류', '서버에서 토큰을 받지 못했습니다. 관리자에게 문의하세요.');
        return;
      }
      
      if (token) {
        // 로그인 성공 - 즉시 화면 전환 (모든 백그라운드 작업 연기)
        const navigationStartTime = performance.now();
        console.log('홈 화면으로 즉시 이동...');
        
        // 즉시 화면 전환 (사용자 경험 최우선)
        navigation.navigate('MemoMap');
        
        const navigationEndTime = performance.now();
        console.log(`화면 전환 완료: ${(navigationEndTime - navigationStartTime).toFixed(2)}ms`);
        
        // 모든 백그라운드 작업을 더 긴 지연 후에 처리
        setTimeout(async () => {
          try {
            // 토큰 저장
            await AsyncStorage.setItem('userToken', token);
            console.log('토큰 저장 완료');
            
            // 저장된 토큰 확인
            const savedToken = await AsyncStorage.getItem('userToken');
            if (savedToken) {
              console.log('토큰 저장 확인: 성공');
            } else {
              console.warn('토큰 저장 확인: 실패');
            }
            
            // 토큰 유효성 검증
            if (savedToken) {
              const isValid = await validateToken(savedToken);
              if (isValid) {
                console.log('토큰 유효성 검증 성공');
              } else {
                console.warn('저장된 토큰이 유효하지 않음');
                await AsyncStorage.removeItem('userToken');
              }
            }
                      } catch (error) {
              Alert.alert('경고', '토큰 저장에 실패했습니다. 앱을 다시 시작해주세요.');
            }
        }, 500); // 500ms 후 백그라운드에서 처리
        
        const totalLoginTime = performance.now() - loginStartTime;
        console.log(`전체 로그인 프로세스: ${totalLoginTime.toFixed(2)}ms`);
      } else {
        Alert.alert('오류', '로그인에 실패했습니다.');
      }
      
         } catch (error) {
       // API에서 이미 사용자 친화적인 메시지를 제공하므로 직접 사용
      let errorMessage = error.message || '로그인에 실패했습니다.';
      
      // 특별한 에러 타입 처리
      if (error.type === 'EMAIL_VERIFICATION') {
        // 이메일 인증이 필요한 경우
        Alert.alert(
          '이메일 인증 필요',
          '이메일 인증이 완료되지 않았습니다. 인증 코드를 입력해주세요.',
          [
            {
              text: '취소',
              style: 'cancel'
            },
            {
              text: '인증하기',
              onPress: () => {
                // 이메일 인증 화면으로 이동 (이메일 정보와 출처 전달)
                navigation.navigate('EmailVerification', { 
                  email: email.trim(),
                  source: 'login'
                });
              }
            }
          ]
        );
        return;
      } else if (error.type === 'REGISTRATION_REQUIRED') {
        // 가입이 필요한 경우
        Alert.alert(
          '계정이 존재하지 않습니다',
          '가입되지 않은 계정입니다. 회원가입을 진행해주세요.',
          [
            {
              text: '취소',
              style: 'cancel'
            },
            {
              text: '회원가입',
              onPress: () => {
                navigation.navigate('SignUp');
              }
            }
          ]
        );
        return;
      }
      
      // 일반적인 로그인 실패 - API에서 제공한 메시지 사용
      Alert.alert('로그인 실패', errorMessage);
      // 로그인 실패 시 비밀번호만 초기화
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeScreen>
      <StatusBar style="dark" translucent={true} />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>GeoMemo</Text>
          <Text style={styles.subtitle}>지역 기반 메모 서비스</Text>
        </View>

        <View style={styles.formSection}>
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
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.bottomText}>
            계정이 없으신가요?{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('SignUp')}>
              가입하기
            </Text>
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingTop: 0, // SafeScreen에서 이미 top safe area를 처리하므로 제거
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 10,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    fontWeight: '400',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
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
  footerSection: {
    marginTop: 30,
  },
  bottomText: {
    textAlign: 'left',
    color: '#333',
  },
  linkText: {
    color: '#3366ff',
    fontWeight: 'bold',
  },
});
