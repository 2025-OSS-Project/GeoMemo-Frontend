import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoById, getCurrentUserInfo, getFollowingCount, getFollowersCount } from '../../config/api';

import ScrapMemo from './ScrapMemo';
import Insight from './Insight';
import HomeButton from '../Main/HomeButton';
import SearchButton from './SearchButton';
import BottomButtons from '../Main/BottomButtons';

export default function MyProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('scrap');
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    loadUserInfo();
  }, []);

  // 팔로우 수 새로고침 함수
  const refreshFollowCounts = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      const [followingCount, followersCount] = await Promise.all([
        getFollowingCount(userToken),
        getFollowersCount(userToken)
      ]);
      
      // 현재 사용자 정보에 팔로우 수 업데이트
      setUserInfo(prevInfo => ({
        ...prevInfo,
        following_count: followingCount,
        follower_count: followersCount
      }));
      
      console.log('✅ MyProfile 팔로우 수 새로고침 완료:', { followingCount, followersCount });
    } catch (error) {
      console.warn('MyProfile 팔로우 수 새로고침 실패:', error.message);
    }
  };

  // 화면에 포커스가 돌아올 때마다 사용자 정보 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadUserInfo();
      // 팔로우 수도 별도로 새로고침
      refreshFollowCounts();
      
      // FollowRequest에서 돌아왔을 때 추가로 팔로우 수 새로고침
      if (route.params?.refreshData) {
        console.log('FollowRequest에서 돌아옴, 팔로우 수 추가 새로고침');
        refreshFollowCounts();
        // 파라미터 초기화
        navigation.setParams({ refreshData: undefined });
      }
    }, [route.params?.refreshData])
  );

  // 사용자 정보 로드
  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }

      // 사용자 ID 가져오기 (실제로는 토큰에서 디코딩하거나 별도 API를 통해 가져와야 함)
      const userId = await getUserId();
      
      // API를 통해 사용자 정보 조회
      const userData = await getUserInfoById(userId, userToken);
      
      // 팔로잉/팔로워 수를 별도로 조회하여 업데이트
      try {
        const [followingCount, followersCount] = await Promise.all([
          getFollowingCount(userToken),
          getFollowersCount(userToken)
        ]);
        
        // 사용자 정보에 팔로우 수 업데이트
        const updatedUserData = {
          ...userData,
          following_count: followingCount,
          follower_count: followersCount
        };
        
        setUserInfo(updatedUserData);
        console.log('✅ 팔로우 수 업데이트 완료:', { followingCount, followersCount });
      } catch (followError) {
        console.warn('팔로우 수 조회 실패, 기본 정보만 표시:', followError.message);
        setUserInfo(userData);
      }
      
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 ID 가져오기 (실제로는 토큰에서 디코딩하거나 별도 API를 통해 가져와야 함)
  const getUserId = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // /api/auth/me API를 통해 현재 사용자 정보 가져오기
      const currentUserInfo = await getCurrentUserInfo(userToken);
      return currentUserInfo.user_id.toString();
    } catch (error) {
      console.error('사용자 ID 가져오기 실패:', error);
      throw new Error('사용자 정보를 가져올 수 없습니다.');
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

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
        animated={true}
      />
      {/* 상단 네비게이션 */}
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
        <TouchableOpacity onPress={() => navigation.navigate('SettingsHome')}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 프로필 영역 */}
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
          <View style={styles.followRow}>
            <TouchableOpacity style={styles.followBox} onPress={async () => {
              await refreshFollowCounts();
              navigation.navigate('FollowManage', { initialTab: 'followers', userNickname: userInfo?.user_nickname || '사용자' });
            }}>
              <Text style={styles.followNumber}>{userInfo?.follower_count || 0}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followBox} onPress={async () => {
              await refreshFollowCounts();
              navigation.navigate('FollowManage', { initialTab: 'following', userNickname: userInfo?.user_nickname || '사용자' });
            }}>
              <Text style={styles.followNumber}>{userInfo?.following_count || 0}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('scrap')}>
          <FontAwesome
            name="bookmark-o"
            size={24}
            color={activeTab === 'scrap' ? 'black' : '#bbb'}
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
        {activeTab === 'scrap' ? <ScrapMemo /> : <Insight />}
      </View>
      
      {/* 홈 버튼과 검색 버튼 */}
      <BottomButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
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
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
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
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  privacyIconContainer: {
    padding: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
