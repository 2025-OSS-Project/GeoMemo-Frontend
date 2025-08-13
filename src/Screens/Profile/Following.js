import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeButton from '../Main/HomeButton';
import BottomButtons from '../Main/BottomButtons';
import { getFollowingList, unfollowUser, followUser } from '../../config/api';

const Following = forwardRef(({ onDataUpdate, otherUserId, onDataChange }, ref) => {
  const navigation = useNavigation();
  const [followingData, setFollowingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log('=== Following 컴포넌트 ===');
  console.log('otherUserId:', otherUserId);
  console.log('otherUserId 타입:', typeof otherUserId);
  console.log('onDataChange prop:', onDataChange);

  // 부모 컴포넌트에 데이터 개수 전달
  useEffect(() => {
    if (onDataUpdate && typeof onDataUpdate === 'function') {
      const count = Array.isArray(followingData) ? followingData.length : 0;
      console.log('팔로잉 데이터 길이:', count, '데이터 타입:', typeof followingData);
      onDataUpdate(count);
    }
  }, [followingData, onDataUpdate]);

  // 부모 컴포넌트에서 호출할 수 있는 메서드들
  useImperativeHandle(ref, () => ({
    refresh: fetchFollowingList,
    getData: () => followingData
  }));

  // 팔로잉 목록 가져오기 (새로운 API 엔드포인트 사용)
  const fetchFollowingList = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const response = await getFollowingList(token);
      console.log('팔로잉 API 응답:', response);
      
      // 새로운 API 응답 구조에 맞춰 데이터 추출
      if (response && response.success && response.data && response.data.users) {
        const users = response.data.users;
        console.log('추출된 팔로잉 데이터:', users);
        
        // status가 'none'인 사용자들을 필터링하여 제거
        const validUsers = users.filter(user => user.status !== 'none');
        console.log('필터링된 팔로잉 데이터:', validUsers);
        
        // API에서 받은 데이터를 그대로 사용
        setFollowingData(validUsers);
      } else {
        console.log('팔로잉 데이터 없음 또는 실패');
        setFollowingData([]);
      }
    } catch (error) {
      console.error('팔로잉 목록 조회 실패:', error);
      Alert.alert('오류', '팔로잉 목록을 가져오는데 실패했습니다.');
      setFollowingData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 언팔로우 처리
  const handleUnfollow = async (userId, nickname) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      await unfollowUser(userId, token);
      
      // 언팔로우/취소 성공 시 해당 사용자를 목록에서 제거
      setFollowingData(prevData => 
        prevData.filter(user => user.userId !== userId)
      );
      
      // 부모 컴포넌트에 데이터 변경 알림
      if (onDataChange && typeof onDataChange === 'function') {
        console.log('✅ 팔로잉 데이터 변경 알림 전송 (언팔로우)');
        onDataChange();
      }
    } catch (error) {
      console.error('언팔로우 실패:', error);
      Alert.alert('오류', '언팔로우에 실패했습니다.');
    }
  };

  // 팔로우 처리
  const handleFollow = async (userId, nickname) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      await followUser(userId, token);
      
      // 팔로우 성공 시 해당 사용자를 pending 상태로 목록에 추가
      // (일부 공개 사용자로 가정)
      const newUser = {
        userId: userId,
        nickname: nickname,
        profileImageUrl: null, // 기존 데이터에서 가져올 수 없으므로 null
        status: 'pending'
      };
      
      setFollowingData(prevData => [...prevData, newUser]);
      
      // 부모 컴포넌트에 데이터 변경 알림
      if (onDataChange && typeof onDataChange === 'function') {
        console.log('✅ 팔로잉 데이터 변경 알림 전송 (팔로우)');
        onDataChange();
      }
    } catch (error) {
      console.error('팔로우 실패:', error);
      Alert.alert('오류', '팔로우에 실패했습니다.');
    }
  };

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchFollowingList();
    }, [])
  );

  // 새로고침 처리
  const onRefresh = () => {
    setRefreshing(true);
    fetchFollowingList();
  };

  const renderItem = ({ item }) => {
    // API에서 받은 데이터를 그대로 사용
    const userId = item.userId;
    const nickname = item.nickname;
    const status = item.status;
    const profileImageUrl = item.profileImageUrl;
    
    return (
      <View style={styles.followRow}>
        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => navigation.navigate('OtherProfile', { userId: userId })}
        >
          {profileImageUrl ? (
            <Image 
              source={{ uri: profileImageUrl }} 
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : null}
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{nickname}</Text>
          {status && (
            <Text style={[styles.statusText, 
              status === 'approved' ? styles.approvedStatus : styles.pendingStatus
            ]}>
              {status === 'approved' ? '팔로잉 중' : '요청 대기중'}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.unfollowButton,
            { backgroundColor: status === 'approved' ? '#FF3B30' : status === 'none' ? '#007AFF' : '#8E8E93' }
          ]}
          onPress={() => {
            if (status === 'approved' || status === 'pending') {
              handleUnfollow(userId, nickname);
            } else if (status === 'none') {
              handleFollow(userId, nickname);
            }
          }}
        >
          <Text style={styles.unfollowButtonText}>
            {status === 'approved' ? 'Unfollow' : status === 'none' ? 'Follow' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>팔로잉 목록을 불러오는 중...</Text>
        </View>
        <BottomButtons />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={followingData}
        keyExtractor={(item, index) => {
          const userId = item?.userId;
          return userId ? userId.toString() : `following-${index}`;
        }}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>팔로잉 중인 사용자가 없습니다.</Text>
            <Text style={styles.emptySubText}>관심 있는 사용자를 팔로우하면 여기에 표시됩니다.</Text>
          </View>
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  listContainer: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 100,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  unfollowButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unfollowButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 11,
    marginTop: 2,
  },
  approvedStatus: {
    color: '#34C759',
  },
  pendingStatus: {
    color: '#FF9500',
  },
});

export default Following;
