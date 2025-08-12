import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFollowersList } from '../../config/api';

export default function FollowRequestButton({ style }) {
  const navigation = useNavigation();
  const [pendingCount, setPendingCount] = useState(0);

  // pending 상태인 팔로워 수 가져오기
  const fetchPendingCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await getFollowersList(token);
      if (response && response.success && response.data && response.data.users) {
        const users = response.data.users;
        // status가 'pending'인 사용자들만 필터링하여 개수 계산
        const pendingUsers = users.filter(user => user.status === 'pending');
        setPendingCount(pendingUsers.length);
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.error('팔로우 요청 수 조회 실패:', error);
      setPendingCount(0);
    }
  };

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchPendingCount();
    }, [])
  );

  return (
    <TouchableOpacity 
      style={[styles.followRequestButton, style]} 
      onPress={() => navigation.navigate('FollowRequest')}
      activeOpacity={0.8}
    >
      <SimpleLineIcons name="user-following" size={24} color="black" />
      
      {/* 팔로우 요청이 있을 때 빨간 점 표시 */}
      {pendingCount > 0 && (
        <View style={styles.notificationDot}>
          <Text style={styles.notificationText}>
            {pendingCount > 99 ? '99+' : pendingCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  followRequestButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
