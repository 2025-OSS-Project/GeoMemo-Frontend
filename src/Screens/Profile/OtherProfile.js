import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoById } from '../../config/api';

import OtherMemoList from './OtherMemoList';
import Insight from './Insight';
import HomeButton from '../Main/HomeButton';

export default function OtherProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('memo');
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 라우트에서 전달받은 사용자 ID
  const otherUserId = route.params?.userId;
  
  console.log('=== OtherProfile 컴포넌트 ===');
  console.log('route.params:', route.params);
  console.log('route.params?.userId:', route.params?.userId);
  console.log('otherUserId:', otherUserId);
  console.log('otherUserId 타입:', typeof otherUserId);
  console.log('otherUserId 값 검증:', otherUserId ? '유효함' : '유효하지 않음');

  // 컴포넌트 마운트 시 다른 사용자 정보 조회
  useEffect(() => {
    console.log('=== OtherProfile useEffect 실행 ===');
    console.log('otherUserId in useEffect:', otherUserId);
    console.log('otherUserId 타입 in useEffect:', typeof otherUserId);
    
    if (otherUserId) {
      console.log('✅ otherUserId가 유효함, 사용자 정보 로드 시작');
      loadOtherUserInfo();
    } else {
      console.error('❌ otherUserId가 유효하지 않음');
      setIsLoading(false);
      Alert.alert('오류', '사용자 ID가 필요합니다.');
      navigation.goBack();
    }
  }, [otherUserId]);

  // 다른 사용자 정보 로드
  const loadOtherUserInfo = async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }

      // API를 통해 다른 사용자 정보 조회
      const userData = await getUserInfoById(otherUserId, userToken);
      setUserInfo(userData);
      
    } catch (error) {
      console.error('다른 사용자 정보 로드 실패:', error);
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EE58F" />
        <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>사용자 정보를 찾을 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.privacyIconContainer}>
          <Ionicons 
            name={
              userInfo?.user_privacy === 'open' ? 'globe-outline' :
              userInfo?.user_privacy === 'semi' ? 'people-outline' :
              userInfo?.user_privacy === 'closed' ? 'lock-closed-outline' :
              'help-circle-outline'
            } 
            size={20} 
            color="#666" 
          />
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* 프로필 섹션 */}
      <View style={styles.profileSection}>
        <View style={styles.photoCircle}>
          {userInfo?.user_profile ? (
            <Image source={{ uri: userInfo.user_profile }} style={styles.profileImage} />
          ) : (
            <Text style={styles.photoText}>photo</Text>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.nickname}>{userInfo?.user_nickname || '닉네임'}</Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>팔로우</Text>
          </TouchableOpacity>
          <View style={styles.followRow}>
            <TouchableOpacity style={styles.followBox} onPress={() => navigation.navigate('Follower', { userId: otherUserId })}>
              <Text style={styles.followNumber}>{userInfo?.follower_count || 0}</Text>
              <Text style={styles.followLabel}>팔로워</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followBox} onPress={() => navigation.navigate('Following', { userId: otherUserId })}>
              <Text style={styles.followNumber}>{userInfo?.following_count || 0}</Text>
              <Text style={styles.followLabel}>팔로잉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('memo')}>
          <Ionicons
            name="reorder-three-outline"
            size={24}
            color={activeTab === 'memo' ? 'black' : '#bbb'}
          />
        </TouchableOpacity>
        <View style={styles.tabDivider} />
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('insight')}>
          <MaterialIcons
            name="insights"
            size={24}
            color={activeTab === 'insight' ? 'black' : '#bbb'}
          />
        </TouchableOpacity>
      </View>

      {/* 콘텐츠 영역 */}
      <View style={styles.contentArea}>
        {activeTab === 'memo' ? (
          userInfo?.user_id ? (
            <>
              {console.log('=== OtherMemoList 렌더링 ===')}
              {console.log('otherUserId for OtherMemoList:', otherUserId)}
              {console.log('userInfo.user_id for OtherMemoList:', userInfo?.user_id)}
              {console.log('userInfo.user_id 타입 for OtherMemoList:', typeof userInfo?.user_id)}
              <OtherMemoList userId={userInfo.user_id} />
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
            </View>
          )
        ) : (
          <Insight />
        )}
      </View>
      
      {/* 홈 버튼 */}
      <HomeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between for better alignment
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: '#fff',
    fontSize: 14,
  },
  profileInfo: {
    marginLeft: 45,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  nickname: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  followButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  followRow: {
    flexDirection: 'row',
    gap: 20,
  },
  followBox: {
    alignItems: 'center',
  },
  followNumber: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  followLabel: {
    fontSize: 12,
    color: '#555',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    padding: 20,
  },
  tabDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  contentArea: {
    flex: 1,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholder: {
    width: 24, // 뒤로가기 버튼과 동일한 크기로 조정
  },
  privacyIconContainer: {
    padding: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
