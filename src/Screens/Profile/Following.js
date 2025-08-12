import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeButton from '../Main/HomeButton';
import { getFollowingList, unfollowUser } from '../../config/api';

const Following = forwardRef(({ onDataUpdate }, ref) => {
  const navigation = useNavigation();
  const [followingData, setFollowingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // 팔로잉 목록 가져오기
  const fetchFollowingList = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const response = await getFollowingList(token);
      console.log('팔로잉 API 응답:', response);
      
      if (response && response.data) {
        let users = [];
        
        // 응답 구조에 따라 데이터 추출
        if (response.data.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        } else if (response.success && response.data.users) {
          users = response.data.users;
        }
        
        console.log('추출된 팔로잉 데이터:', users);
        
        // 데이터 유효성 검사 및 필터링
        const validUsers = users.filter(user => {
          if (!user || typeof user !== 'object') {
            console.log('유효하지 않은 사용자 객체:', user);
            return false;
          }
          
          // nickname은 필수, id나 user_id가 없으면 email을 식별자로 사용
          const hasRequiredFields = user.nickname && (user.id || user.user_id || user.email);
          if (!hasRequiredFields) {
            console.log('필수 필드가 누락된 사용자:', user);
            return false;
          }
          
          return true;
        });
        
        console.log('유효한 팔로잉 데이터:', validUsers);
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
    Alert.alert(
      '언팔로우',
      `${nickname}님을 언팔로우하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '언팔로우',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
              }

              // 즉시 UI에서 해당 사용자 제거 (낙관적 업데이트)
              setFollowingData(prevData => 
                prevData.filter(user => {
                  const currentUserId = user.id || user.user_id || user.email;
                  return currentUserId !== userId;
                })
              );

              // API 호출
              await unfollowUser(userId, token);
              
              // 성공 시 추가 알림 없이 목록 새로고침
              fetchFollowingList();
            } catch (error) {
              console.error('언팔로우 실패:', error);
              
              // 실패 시 원래 데이터 복원
              fetchFollowingList();
              
              // 오류 메시지 표시
              let errorMessage = '언팔로우에 실패했습니다.';
              if (error.message) {
                if (error.message.includes('401')) {
                  errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
                } else if (error.message.includes('404')) {
                  errorMessage = '사용자를 찾을 수 없습니다.';
                } else if (error.message.includes('500')) {
                  errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                } else {
                  errorMessage = error.message;
                }
              }
              
              Alert.alert('오류', errorMessage);
            }
          }
        }
      ]
    );
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
    // 데이터 유효성 검사 개선
    if (!item || typeof item !== 'object') {
      console.log('유효하지 않은 팔로잉 아이템 (타입 오류):', item);
      return null;
    }

    // 필수 필드 확인 - id가 없으면 email을 식별자로 사용
    const userId = item.id || item.user_id || item.email;
    const nickname = item.nickname;
    const email = item.email;
    const status = item.status;
    const profileImageUrl = item.profileImageUrl;

    if (!userId || !nickname) {
      console.log('필수 필드가 누락된 팔로잉 아이템:', item);
      return null;
    }
    
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
             { backgroundColor: status === 'approved' ? '#FF3B30' : '#8E8E93' }
           ]}
           onPress={() => handleUnfollow(userId, nickname)}
         >
                       <Text style={styles.unfollowButtonText}>
              {status === 'approved' ? 'Unfollow' : 'Cancel'}
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
        <HomeButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={followingData}
        keyExtractor={(item, index) => {
          const userId = item?.id || item?.user_id || item?.email;
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
    gap: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
     followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    borderRadius: 24,
  },
  profileInitial: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
       unfollowButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 60,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  unfollowButtonText: {
    color: '#fff',
    fontSize: 13,
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
    fontSize: 12,
    marginTop: 4,
  },
  approvedStatus: {
    color: '#34C759', // 예시 색상
  },
  pendingStatus: {
    color: '#FF9500', // 예시 색상
  },
});

export default Following;
