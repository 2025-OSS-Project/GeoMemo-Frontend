import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoById, followUser, unfollowUser, getFollowingList } from '../../config/api';

import OtherMemoList from './OtherMemoList';
import Insight from './Insight';
import HomeButton from '../Main/HomeButton';

export default function OtherProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('memo');
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState('none'); // none, pending, following
  const [isFollowLoading, setIsFollowLoading] = useState(false);

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

  // 화면 포커스 시 팔로우 상태 확인
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== useFocusEffect 실행 ===');
      console.log('otherUserId in useFocusEffect:', otherUserId);
      
      if (otherUserId) {
        const checkStatus = async () => {
          console.log('팔로우 상태 확인 시작...');
          const userToken = await AsyncStorage.getItem('userToken');
          if (userToken) {
            console.log('토큰 확인됨, checkFollowStatus 호출');
            await checkFollowStatus(userToken);
          } else {
            console.log('❌ 토큰이 없습니다.');
          }
        };
        checkStatus();
      } else {
        console.log('❌ otherUserId가 없습니다.');
      }
    }, [otherUserId])
  );

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
      
      // 팔로우 상태 확인
      await checkFollowStatus(userToken);
      
    } catch (error) {
      console.error('다른 사용자 정보 로드 실패:', error);
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 팔로우 상태 확인
  const checkFollowStatus = async (userToken) => {
    try {
      console.log('=== checkFollowStatus 실행 ===');
      console.log('otherUserId:', otherUserId);
      console.log('otherUserId 타입:', typeof otherUserId);
      
      // 현재 사용자의 팔로잉 목록 가져오기
      const followingResponse = await getFollowingList(userToken);
      console.log('팔로잉 목록 응답:', followingResponse);
      
      if (followingResponse.success && followingResponse.data) {
        const followingUsers = followingResponse.data.users || [];
        console.log('팔로잉 중인 사용자들:', followingUsers);
        console.log('팔로잉 사용자 수:', followingUsers.length);
        
        // 각 사용자의 ID 구조 확인
        followingUsers.forEach((user, index) => {
          console.log(`사용자 ${index}:`, {
            id: user.id,
            user_id: user.user_id,
            nickname: user.nickname,
            'id 타입': typeof user.id,
            'user_id 타입': typeof user.user_id
          });
        });
        
        // 현재 프로필의 사용자가 팔로잉 목록에 있는지 확인
        const followingUser = followingUsers.find(user => {
          const userId = user.id || user.user_id;
          const isMatch = userId && userId.toString() === otherUserId.toString();
          console.log(`비교: ${userId} === ${otherUserId} => ${isMatch}`);
          return isMatch;
        });
        
                 if (followingUser) {
           console.log('찾은 팔로잉 사용자:', followingUser);
           console.log('status 상태:', followingUser.status);
           
           if (followingUser.status === 'approved') {
             setFollowStatus('following');
             console.log('✅ 팔로우 중인 사용자입니다. (승인됨)');
           } else {
             setFollowStatus('pending');
             console.log('⏳ 팔로우 요청 대기중인 사용자입니다. (승인 대기)');
           }
         } else {
          setFollowStatus('none');
          console.log('❌ 팔로우하지 않는 사용자입니다.');
        }
      } else {
        console.log('❌ 팔로잉 목록을 가져올 수 없습니다.');
        console.log('응답 구조:', followingResponse);
        setFollowStatus('none');
      }
    } catch (error) {
      console.error('❌ 팔로우 상태 확인 실패:', error);
      setFollowStatus('none');
    }
  };

  // 팔로우 처리
  const handleFollow = async () => {
    try {
      setIsFollowLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }

      // 공개 설정에 따른 팔로우 동작
      if (userInfo?.user_privacy === 'closed') {
        Alert.alert('팔로우 불가', '이 사용자는 팔로우 요청을 받지 않습니다.');
        return;
      }

      const response = await followUser(otherUserId, userToken);
      
      if (response.success) {
        if (userInfo?.user_privacy === 'open') {
          // 전체 공개: 자동 승인
          setFollowStatus('following');
          Alert.alert('팔로우 성공', '팔로우되었습니다.');
        } else if (userInfo?.user_privacy === 'semi') {
          // 일부 공개: 승인 대기
          setFollowStatus('pending');
          Alert.alert('팔로우 요청', '팔로우 요청이 전송되었습니다. 승인을 기다려주세요.');
        }
        
        // 팔로우 상태를 다시 확인하여 최신 상태 반영
        setTimeout(async () => {
          const userToken = await AsyncStorage.getItem('userToken');
          if (userToken) {
            await checkFollowStatus(userToken);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('팔로우 실패:', error);
      
      // 에러 메시지에 따른 처리
      if (error.message.includes('자기 자신은 팔로우할 수 없습니다')) {
        Alert.alert('오류', '자기 자신은 팔로우할 수 없습니다.');
      } else if (error.message.includes('대상 유저가 존재하지 않습니다')) {
        Alert.alert('오류', '존재하지 않는 사용자입니다.');
      } else if (error.message.includes('이미 팔로우 요청을 보냈거나 팔로우 중입니다')) {
        Alert.alert('오류', '이미 팔로우 요청을 보냈거나 팔로우 중입니다.');
      } else if (error.message.includes('해당 유저는 팔로우 요청을 받을 수 없습니다')) {
        Alert.alert('오류', '해당 사용자는 팔로우 요청을 받을 수 없습니다.');
      } else {
        Alert.alert('오류', '팔로우 요청에 실패했습니다.');
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  // 팔로우 취소 처리
  const handleUnfollow = async () => {
    try {
      setIsFollowLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Login');
        return;
      }

      const response = await unfollowUser(otherUserId, userToken);
      
      if (response.success) {
        setFollowStatus('none');
        Alert.alert('팔로우 취소', '팔로우가 취소되었습니다.');
      }
      
    } catch (error) {
      console.error('팔로우 취소 실패:', error);
      
      // 에러 메시지에 따른 처리
      if (error.message.includes('팔로우 관계가 존재하지 않습니다')) {
        Alert.alert('오류', '팔로우 관계가 존재하지 않습니다.');
      } else {
        Alert.alert('오류', '팔로우 취소에 실패했습니다.');
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  // 팔로우 버튼 텍스트 및 스타일 결정
  const getFollowButtonConfig = () => {
    if (followStatus === 'following') {
      return {
        text: 'Unfollow',
        backgroundColor: '#FF3B30',
        disabled: false
      };
    } else if (followStatus === 'pending') {
      return {
        text: 'Pending',
        backgroundColor: '#FF9500',
        disabled: true
      };
    } else {
      return {
        text: 'Follow',
        backgroundColor: '#007AFF',
        disabled: false
      };
    }
  };

  const followButtonConfig = getFollowButtonConfig();

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
          <TouchableOpacity 
            style={[
              styles.followButton, 
              { backgroundColor: followButtonConfig.backgroundColor },
              followButtonConfig.disabled && styles.disabledFollowButton
            ]} 
            onPress={followStatus === 'following' ? handleUnfollow : handleFollow} 
            disabled={isFollowLoading}
          >
            {isFollowLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.followButtonText}>{followButtonConfig.text}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.followRow}>
            <TouchableOpacity style={styles.followBox} onPress={() => navigation.navigate('FollowManage', { initialTab: 'followers', userNickname: userInfo?.user_nickname || '사용자' })}>
              <Text style={styles.followNumber}>{userInfo?.follower_count || 0}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followBox} onPress={() => navigation.navigate('FollowManage', { initialTab: 'following', userNickname: userInfo?.user_nickname || '사용자' })}>
              <Text style={styles.followNumber}>{userInfo?.following_count || 0}</Text>
              <Text style={styles.followLabel}>Following</Text>
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
  disabledFollowButton: {
    opacity: 0.7,
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
