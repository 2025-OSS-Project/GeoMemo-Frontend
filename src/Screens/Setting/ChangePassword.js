import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePassword } from '../../config/api';

export default function ChangePassword() {
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    // 최소 8자, 영문, 숫자, 특수문자 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // 비밀번호 변경 처리 함수
  const handlePasswordChange = async () => {
    // 입력값 검증
    if (!currentPassword.trim()) {
      Alert.alert('알림', '현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('알림', '새 비밀번호를 입력해주세요.');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('알림', '새 비밀번호 확인을 입력해주세요.');
      return;
    }

    // 새 비밀번호 유효성 검사
    if (!validatePassword(newPassword)) {
      Alert.alert(
        '알림', 
        '비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.'
      );
      return;
    }

    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
      Alert.alert('알림', '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 현재 비밀번호와 새 비밀번호가 같은지 확인
    if (currentPassword === newPassword) {
      Alert.alert('알림', '현재 비밀번호와 새 비밀번호가 동일합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // AsyncStorage에서 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }

      // API 호출
      const result = await updatePassword(newPassword, userToken);

      if (result.success) {
        Alert.alert(
          '성공', 
          '비밀번호가 성공적으로 변경되었습니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(result.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      Alert.alert('오류', error.message || '비밀번호 변경 중 오류가 발생했습니다.');
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
          {/* 제목 */}
          <Text style={styles.title}>비밀번호 변경</Text>

          {/* 안내 문구 */}
          <Text style={styles.label}>새로운 비밀번호를 입력해주세요.</Text>

          {/* 현재 비밀번호 */}
          <Text style={styles.inputLabel}>현재 비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="현재 비밀번호를 입력하세요"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            editable={!isLoading}
            returnKeyType="next"
          />

          {/* 새 비밀번호 */}
          <Text style={styles.inputLabel}>새 비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="새 비밀번호를 입력하세요"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!isLoading}
            returnKeyType="next"
          />
          <Text style={styles.passwordHint}>8자 이상, 영문, 숫자, 특수문자 포함</Text>

          {/* 새 비밀번호 확인 */}
          <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            placeholder="새 비밀번호를 다시 입력하세요"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
            returnKeyType="done"
          />

          {/* 저장 버튼 */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handlePasswordChange}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveText}>저장</Text>
            )}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingBottom: 100, // 키보드 공간 확보
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: -15,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#6EE58F',
    borderRadius: 999, // 완전 둥글게
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 200,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
