import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signUp, sendEmailVerification, USER_ERROR_CODES, USER_ERROR_MESSAGES } from '../../config/api';
import SafeScreen from '../../utils/SafeScreen';

export default function SignUp() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 실시간 유효성 검증 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // 클라이언트 측 유효성 검증 함수들
  const validateEmail = (email) => {
    if (!email) return { isValid: false, message: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) 
      ? { isValid: true, message: '' }
      : { isValid: false, message: '유효하지 않은 이메일 형식입니다' };
  };

  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: '' };
    if (password.length < 6) {
      return { isValid: false, message: '비밀번호는 6자 이상이어야 합니다' };
    }
    if (password.length > 50) {
      return { isValid: false, message: '비밀번호는 50자 이하여야 합니다' };
    }
    return { isValid: true, message: '' };
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return { isValid: false, message: '' };
    if (confirmPassword !== password) {
      return { isValid: false, message: '비밀번호가 일치하지 않습니다' };
    }
    return { isValid: true, message: '' };
  };

  const validateNickname = (nickname) => {
    if (!nickname) return { isValid: false, message: '' };
    if (nickname.length > 12) {
      return { isValid: false, message: '닉네임은 12자 이하여야 합니다' };
    }
    return { isValid: true, message: '' };
  };

  const validatePhone = (phone) => {
    if (!phone) return { isValid: false, message: '' };
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: '전화번호는 10-11자리 숫자로 입력해주세요' };
    }
    return { isValid: true, message: '' };
  };

  // 실시간 유효성 검증 핸들러들
  const handleEmailChange = (text) => {
    setEmail(text);
    const validation = validateEmail(text);
    setEmailError(validation.message);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordError(validation.message);
    
    // 비밀번호 확인도 다시 검증
    if (confirmPassword) {
      const confirmValidation = validateConfirmPassword(confirmPassword, text);
      setConfirmPasswordError(confirmValidation.message);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    const validation = validateConfirmPassword(text, password);
    setConfirmPasswordError(validation.message);
  };

  const handleNicknameChange = (text) => {
    setNickname(text);
    const validation = validateNickname(text);
    setNicknameError(validation.message);
  };

  const handlePhoneChange = (text) => {
    setPhone(text);
    const validation = validatePhone(text);
    setPhoneError(validation.message);
  };

  const handleSignUp = async () => {
    // 클라이언트 측 유효성 검증
    if (!email || !password || !confirmPassword || !name || !nickname || !phone) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    // 각 필드별 유효성 검증
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword, password);
    const nicknameValidation = validateNickname(nickname);
    const phoneValidation = validatePhone(phone);

    // 오류가 있으면 첫 번째 오류 메시지 표시
    if (!emailValidation.isValid) {
      Alert.alert('입력 오류', emailValidation.message);
      return;
    }
    if (!passwordValidation.isValid) {
      Alert.alert('입력 오류', passwordValidation.message);
      return;
    }
    if (!confirmPasswordValidation.isValid) {
      Alert.alert('입력 오류', confirmPasswordValidation.message);
      return;
    }
    if (!nicknameValidation.isValid) {
      Alert.alert('입력 오류', nicknameValidation.message);
      return;
    }
    if (!phoneValidation.isValid) {
      Alert.alert('입력 오류', phoneValidation.message);
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: name.trim(),
        nickname: nickname.trim(),
        password: password,
        email: email.trim(),
        phone: phone.trim()
      };

      const result = await signUp(userData);
      
      if (result.success) {
        // 회원가입 성공 시 이메일 인증 코드 발송
        try {
          await sendEmailVerification(email.trim());
          Alert.alert(
            '인증 코드 발송 완료', 
            '입력하신 이메일로 인증 코드가 발송되었습니다. 이메일을 확인해주세요.',
            [
              {
                text: '확인',
                onPress: () => {
                  navigation.navigate('EmailVerification', { email: email.trim() });
                }
              }
            ]
          );
        } catch (error) {
          console.error('이메일 인증 코드 발송 에러:', error);
          
          let errorMessage = error.message || '이메일 인증 코드 발송에 실패했습니다.';
          
          // 특별한 에러 타입에 대한 추가 처리
          if (error.status === 400) {
            Alert.alert(
              '이메일 오류', 
              '이메일 주소를 확인해주세요.',
              [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.navigate('EmailVerification', { email: email.trim() });
                  }
                }
              ]
            );
          } else if (error.status === 422) {
            Alert.alert(
              '입력 오류', 
              '이메일 형식이 올바르지 않습니다.',
              [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.navigate('EmailVerification', { email: email.trim() });
                  }
                }
              ]
            );
          } else if (error.status === 429) {
            Alert.alert(
              '요청 제한', 
              '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
              [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.navigate('EmailVerification', { email: email.trim() });
                  }
                }
              ]
            );
          } else if (error.status >= 500) {
            Alert.alert(
              '서버 오류', 
              '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
              [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.navigate('EmailVerification', { email: email.trim() });
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              '인증 코드 발송 실패', 
              errorMessage,
              [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.navigate('EmailVerification', { email: email.trim() });
                  }
                }
              ]
            );
          }
        }
      } else {
        Alert.alert('오류', '회원가입에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('회원가입 에러:', error);
      console.error('에러 상태 코드:', error.status);
      console.error('에러 코드:', error.errorCode);
      console.error('에러 상세:', error.detail);
      console.error('에러 메시지:', error.message);
      
      let errorMessage = error.message || '회원가입에 실패했습니다.';
      let errorCode = error.errorCode;
      
      // 이미지의 오류 코드 테이블에 따른 구체적인 에러 메시지 처리
      if (errorCode) {
        console.log('오류 코드로 처리:', errorCode);
        switch (errorCode) {
          case USER_ERROR_CODES.USR_001:
            errorMessage = '필수 입력값이 누락되었습니다 (사용자명, 비밀번호 등)';
            break;
          case USER_ERROR_CODES.USR_002:
            errorMessage = '유효하지 않은 이메일 형식입니다';
            break;
          case USER_ERROR_CODES.USR_003:
            errorMessage = '비밀번호 형식이 올바르지 않습니다 (너무 짧거나 조건 미달)';
            break;
          case USER_ERROR_CODES.USR_004:
            errorMessage = '이미 존재하는 사용자명입니다 (중복 아이디)';
            break;
          case USER_ERROR_CODES.USR_005:
            errorMessage = '이미 사용 중인 이메일입니다';
            break;
          case USER_ERROR_CODES.USR_006:
            errorMessage = '닉네임 길이가 제한을 초과했습니다';
            break;
          case USER_ERROR_CODES.USR_007:
            errorMessage = '전화번호 형식이 올바르지 않습니다';
            break;
          case USER_ERROR_CODES.USR_999:
            errorMessage = '서버 내부 오류가 발생했습니다 (DB 문제 등)';
            break;
          default:
            errorMessage = error.message || '회원가입에 실패했습니다';
        }
      } else {
        console.log('오류 코드 없음, HTTP 상태 코드로 처리:', error.status);
        // 오류 코드가 없는 경우 HTTP 상태 코드별 처리
        if (error.status === 400) {
          // 잘못된 요청 데이터
          const detail = error.detail || '';
          if (detail.includes('email') || detail.includes('이메일')) {
            errorMessage = '유효하지 않은 이메일 형식입니다';
          } else if (detail.includes('nickname') || detail.includes('닉네임')) {
            errorMessage = '닉네임 길이가 제한을 초과했습니다';
          } else if (detail.includes('phone') || detail.includes('전화번호')) {
            errorMessage = '전화번호 형식이 올바르지 않습니다';
          } else if (detail.includes('password') || detail.includes('비밀번호')) {
            errorMessage = '비밀번호 형식이 올바르지 않습니다';
          } else {
            errorMessage = '입력 정보를 확인해주세요';
          }
        } else if (error.status === 409) {
          // 충돌 (중복된 데이터)
          const detail = error.detail || '';
          if (detail.includes('email') || detail.includes('이메일')) {
            errorMessage = '이미 사용 중인 이메일입니다';
          } else if (detail.includes('nickname') || detail.includes('닉네임')) {
            errorMessage = '이미 사용 중인 닉네임입니다';
          } else if (detail.includes('phone') || detail.includes('전화번호')) {
            errorMessage = '이미 사용 중인 전화번호입니다';
          } else {
            errorMessage = '이미 존재하는 계정입니다';
          }
        } else if (error.status === 422) {
          errorMessage = '입력 정보가 올바르지 않습니다';
        } else if (error.status >= 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
        }
      }
      
      console.log('최종 에러 메시지:', errorMessage);
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeScreen>
      <StatusBar style="dark" translucent={true} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <Text style={styles.title}>회원가입</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={[styles.input, emailError ? styles.inputError : null]} 
            placeholder="email@email.com" 
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            returnKeyType="next"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <Text style={styles.label}>비밀번호</Text>
          <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="비밀번호 (6자 이상)" 
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <Text style={styles.label}>비밀번호 확인</Text>
          <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="비밀번호 확인" 
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

          <Text style={styles.label}>이름</Text>
          <TextInput 
            style={styles.input} 
            placeholder="이름" 
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />

          <Text style={styles.label}>닉네임</Text>
          <TextInput 
            style={[styles.input, nicknameError ? styles.inputError : null]} 
            placeholder="12글자 이내로 입력하세요." 
            placeholderTextColor="#999"
            maxLength={12} 
            value={nickname}
            onChangeText={handleNicknameChange}
            returnKeyType="next"
          />
          {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}

          <Text style={styles.label}>전화번호</Text>
          <TextInput 
            style={[styles.input, phoneError ? styles.inputError : null]} 
            placeholder="'-' 없이 입력하세요." 
            placeholderTextColor="#999"
            keyboardType="phone-pad" 
            value={phone}
            onChangeText={handlePhoneChange}
            returnKeyType="done"
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.disabledButton]} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '처리중...' : '가입하기'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  container: {
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
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '400',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
