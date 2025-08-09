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
import { updateNickname } from '../../config/api';

export default function ChangeNickname() {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 닉네임 변경 처리 함수
  const handleNicknameChange = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '새로운 닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2) {
      Alert.alert('알림', '닉네임은 최소 2글자 이상이어야 합니다.');
      return;
    }

    if (nickname.length > 20) {
      Alert.alert('알림', '닉네임은 20글자를 초과할 수 없습니다.');
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
      const result = await updateNickname(nickname, userToken);

      if (result.success) {
        Alert.alert(
          '성공', 
          '닉네임이 성공적으로 변경되었습니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(result.error || '닉네임 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('닉네임 변경 오류:', error);
      Alert.alert('오류', error.message || '닉네임 변경 중 오류가 발생했습니다.');
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
          <Text style={styles.title}>닉네임 변경</Text>

          {/* 안내 문구 */}
          <Text style={styles.label}>새로운 닉네임을 입력해주세요.</Text>

          {/* 입력 필드 */}
          <TextInput
            style={styles.input}
            placeholder="새로운 닉네임을 입력하세요"
            placeholderTextColor="#aaa"
            value={nickname}
            onChangeText={setNickname}
            editable={!isLoading}
            maxLength={20}
            returnKeyType="done"
          />

          {/* 글자수 표시 */}
          <Text style={styles.characterCount}>{nickname.length}/20</Text>

          {/* 저장 버튼 */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleNicknameChange}
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
    fontSize: 15,
    marginBottom: 12,
    marginTop: 30,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: -15,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6EE58F',
    borderRadius: 999, 
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 410,
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
