import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../../config/api';

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

  const handleSignUp = async () => {
    // 입력값 검증
    if (!email || !password || !confirmPassword || !name || !nickname || !phone) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: name.trim(), // API 명세서에 맞춰 name 필드 사용
        nickname: nickname.trim(),
        password: password,
        email: email.trim(),
        phone: phone.trim()
      };

      const result = await signUp(userData);
      
      if (result.success) {
        Alert.alert('성공', '회원가입이 완료되었습니다!', [
          { text: '확인', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('오류', '회원가입에 실패했습니다.');
      }
      
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            style={styles.input} 
            placeholder="email@email.com" 
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            returnKeyType="next"
          />

          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="비밀번호 (6자 이상)" 
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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

          <Text style={styles.label}>비밀번호 확인</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="비밀번호 확인" 
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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

          <Text style={styles.label}>이름</Text>
          <TextInput 
            style={styles.input} 
            placeholder="이름" 
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />

          <Text style={styles.label}>닉네임</Text>
          <TextInput 
            style={styles.input} 
            placeholder="12글자 이내로 입력하세요." 
            maxLength={12} 
            value={nickname}
            onChangeText={setNickname}
            returnKeyType="next"
          />

          <Text style={styles.label}>전화번호</Text>
          <TextInput 
            style={styles.input} 
            placeholder="'-' 없이 입력하세요." 
            keyboardType="phone-pad" 
            value={phone}
            onChangeText={setPhone}
            returnKeyType="done"
          />

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
    </SafeAreaView>
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
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 6,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#000',
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
