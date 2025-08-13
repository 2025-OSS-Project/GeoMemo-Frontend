import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getFollowersList, acceptFollowRequest, declineFollowRequest } from '../../config/api';
import BottomButtons from '../Main/BottomButtons';

export default function FollowRequest() {
  const navigation = useNavigation();
  const [pendingFollowers, setPendingFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleBackPress = () => {
    // MyProfile로 돌아갈 때 데이터 새로고침 신호 전달
    navigation.navigate('MyProfile', { refreshData: true });
  };

  // pending 상태인 팔로워들만 가져오기
  const fetchPendingFollowers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const response = await getFollowersList(token);
      if (response && response.success && response.data && response.data.users) {
        const users = response.data.users;
        // status가 'pending'인 사용자들만 필터링
        const pendingUsers = users.filter(user => user.status === 'pending');
        setPendingFollowers(pendingUsers);
      } else {
        setPendingFollowers([]);
      }
    } catch (error) {
      console.error('팔로워 목록 조회 실패:', error);
      Alert.alert('오류', '팔로워 목록을 가져오는데 실패했습니다.');
      setPendingFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  // 팔로우 요청 승인
  const handleAccept = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      await acceptFollowRequest(userId, token);
      // 승인된 사용자를 목록에서 제거
      setPendingFollowers(prevData => 
        prevData.filter(user => user.userId !== userId)
      );
      
      // 성공 메시지 제거 - alert 창 없이 처리
    } catch (error) {
      console.error('팔로우 요청 승인 실패:', error);
      // 오류 alert 제거
    }
  };

  // 팔로우 요청 거절
  const handleDecline = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      await declineFollowRequest(userId, token);
      // 거절된 사용자를 목록에서 제거
      setPendingFollowers(prevData => 
        prevData.filter(user => user.userId !== userId)
      );
      
      // 성공 메시지 제거 - alert 창 없이 처리
    } catch (error) {
      console.error('팔로우 요청 거절 실패:', error);
      // 오류 alert 제거
    }
  };

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchPendingFollowers();
    }, [])
  );

  const renderItem = ({ item }) => {
    const userId = item.userId;
    const nickname = item.nickname;
    const profileImageUrl = item.profileImageUrl;
    
    return (
      <View style={styles.requestRow}>
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
          <Text style={styles.statusText}>Follow Request</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleAccept(userId)}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDecline(userId)}
          >
            <Text style={styles.declineButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Follow Request</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>팔로우 요청을 불러오는 중...</Text>
        </View>
        <BottomButtons />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Follow Request</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={pendingFollowers}
        keyExtractor={(item) => item.userId?.toString() || `pending-${item.nickname}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>대기 중인 팔로우 요청이 없습니다.</Text>
            <Text style={styles.emptySubText}>새로운 팔로우 요청이 오면 여기에 표시됩니다.</Text>
          </View>
        }
      />
      <BottomButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#262626',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 100,
  },
  requestRow: {
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
  statusText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  declineButtonText: {
    color: '#262626',
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
});
