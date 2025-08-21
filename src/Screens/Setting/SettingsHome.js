import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { deleteAccount, getUserInfo } from '../../config/api';
import SafeScreen from '../../utils/SafeScreen';

const { width, height } = Dimensions.get('window');

export default function SettingsHome() {
  const navigation = useNavigation();
  const [currentPrivacySetting, setCurrentPrivacySetting] = useState('open');
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 조회
  const fetchUserInfo = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const userInfo = await getUserInfo(userToken);
        console.log('사용자 정보 조회 완료:', userInfo);
        console.log('전체 응답 키들:', Object.keys(userInfo));
        
        // 공개설정 상태 설정
        if (userInfo.privacy_settings) {
          console.log('privacy_settings 필드 발견:', userInfo.privacy_settings);
          setCurrentPrivacySetting(userInfo.privacy_settings);
        } else if (userInfo.privacy_setting) {
          console.log('privacy_setting 필드 발견:', userInfo.privacy_setting);
          setCurrentPrivacySetting(userInfo.privacy_setting);
        } else if (userInfo.is_public !== undefined) {
          console.log('is_public 필드 발견:', userInfo.is_public);
          setCurrentPrivacySetting(userInfo.is_public ? 'open' : 'closed');
        } else if (userInfo.privacy) {
          console.log('privacy 필드 발견:', userInfo.privacy);
          setCurrentPrivacySetting(userInfo.privacy);
        } else {
          console.log('공개설정 관련 필드를 찾을 수 없음');
          console.log('사용 가능한 필드들:', Object.keys(userInfo));
        }
      }
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 화면에 포커스가 올 때마다 사용자 정보 새로 조회
  useFocusEffect(
    React.useCallback(() => {
      fetchUserInfo();
    }, [])
  );

  // 공개설정 텍스트 변환
  const getPrivacyText = (setting) => {
    console.log('공개설정 변환:', setting);
    switch (setting) {
      case 'open':
        return '전체 공개';
      case 'semi':
        return '일부 공개';
      case 'closed':
        return '비공개';
      default:
        console.log('알 수 없는 공개설정:', setting);
        return '전체 공개';
    }
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // AsyncStorage에서 토큰 삭제
              await AsyncStorage.removeItem('userToken');
              console.log('로그아웃 완료: 토큰 삭제됨');
              
              // Login 화면으로 이동 (스택 초기화)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 회원탈퇴 함수
  const handleDeleteAccount = async () => {
    Alert.alert(
      '회원탈퇴',
      '정말로 회원탈퇴를 하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            try {
              // 저장된 토큰 가져오기
              const userToken = await AsyncStorage.getItem('userToken');
              if (!userToken) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
              }

              // 회원탈퇴 API 호출
              const result = await deleteAccount(userToken);
              
              if (result.success) {
                // AsyncStorage에서 토큰 삭제
                await AsyncStorage.removeItem('userToken');
                console.log('회원탈퇴 완료');
                
                Alert.alert(
                  '탈퇴 완료',
                  '회원탈퇴가 완료되었습니다.',
                  [
                    {
                      text: '확인',
                      onPress: () => {
                        // Login 화면으로 이동 (스택 초기화)
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        });
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('오류', '회원탈퇴에 실패했습니다.');
              }
            } catch (error) {
              console.error('회원탈퇴 오류:', error);
              Alert.alert('오류', `회원탈퇴 중 오류가 발생했습니다: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeScreen>
      <StatusBar style="dark" translucent={true} />
      <View style={styles.container}>
        {/* 회원정보 수정 */}
        <TouchableOpacity
        style={styles.boxButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.boxText}>회원정보 수정</Text>
      </TouchableOpacity>

      {/* 공개설정 변경 */}
      <TouchableOpacity
        style={styles.boxButton}
        onPress={() => navigation.navigate('PrivacySetting')}
      >
        <View style={styles.settingRow}>
          <Text style={styles.boxText}>공개설정 변경</Text>
          {!isLoading && (
            <Text style={styles.currentSettingText}>
              {getPrivacyText(currentPrivacySetting)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 회원탈퇴 */}
      <TouchableOpacity style={styles.withdrawButton} onPress={handleDeleteAccount}>
        <Text style={styles.withdrawText}>회원탈퇴</Text>
      </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  boxButton: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boxText: {
    fontSize: 15,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 8,
  },
  currentSettingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  withdrawButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 999, // 완전 둥글게
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 80,
  },
  withdrawText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
