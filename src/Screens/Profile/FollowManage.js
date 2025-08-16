import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Follower from './Follower';
import Following from './Following';
import { getFollowersList, getFollowingList, getFollowersCount, getFollowingCount } from '../../config/api';

export default function FollowManage() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // route params에서 초기 탭과 사용자 닉네임, 사용자 ID 가져오기
  const initialTab = route.params?.initialTab || 'followers';
  const userNickname = route.params?.userNickname || '사용자';
  const otherUserId = route.params?.otherUserId; // 다른 사용자의 ID
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // 자식 컴포넌트에 대한 ref
  const followerRef = useRef();
  const followingRef = useRef();

  console.log('=== FollowManage 컴포넌트 ===');
  console.log('otherUserId:', otherUserId);
  console.log('userNickname:', userNickname);
  console.log('initialTab:', initialTab);

  // 팔로워 카운트 가져오기
  const fetchFollowersCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const count = await getFollowersCount(token);
      setFollowersCount(count);
      console.log('✅ 팔로워 카운트 업데이트:', count);
    } catch (error) {
      console.error('팔로워 카운트 조회 실패:', error);
    }
  };

  // 팔로잉 카운트 가져오기
  const fetchFollowingCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const count = await getFollowingCount(token);
      setFollowingCount(count);
      console.log('✅ 팔로잉 카운트 업데이트:', count);
    } catch (error) {
      console.error('팔로잉 카운트 조회 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 두 카운트 모두 가져오기
  useEffect(() => {
    fetchFollowersCount();
    fetchFollowingCount();
  }, []);

  // 화면에 포커스가 돌아올 때마다 카운트 새로고침
  useFocusEffect(
    React.useCallback(() => {
      console.log('FollowManage 화면 포커스, 카운트 새로고침');
      if (activeTab === 'followers') {
        fetchFollowersCount();
      } else {
        fetchFollowingCount();
      }
    }, [activeTab])
  );

  // 탭 변경 시 해당 카운트 새로고침
  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowersCount();
    } else {
      fetchFollowingCount();
    }
  }, [activeTab]);

  // 자식 컴포넌트에서 데이터 변경 시 카운트 새로고침
  const handleDataUpdate = (type) => {
    console.log('데이터 변경 감지:', type);
    if (type === 'followers') {
      fetchFollowersCount();
    } else if (type === 'following') {
      fetchFollowingCount();
    }
  };

  // 팔로워/팔로잉 데이터 변경 후 카운트 새로고침
  const handleDataChange = async (type) => {
    console.log('데이터 변경 처리:', type);
    
    // 잠시 대기 후 카운트 새로고침 (API 응답 대기)
    setTimeout(() => {
      if (type === 'followers') {
        fetchFollowersCount();
      } else if (type === 'following') {
        fetchFollowingCount();
      }
    }, 500);
  };

  const handleBackPress = () => {
    // 뒤로가기 시 네비게이션 스택 유지
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userNickname}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 탭 버튼들 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'followers' && styles.activeTabButton]}
          onPress={() => setActiveTab('followers')}
        >
                  <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
          {Math.max(0, followersCount || 0)} Follower
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'following' && styles.activeTabButton]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            {Math.max(0, followingCount || 0)} Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 내용 */}
      <View style={styles.tabContent}>
        {activeTab === 'followers' ? (
          <Follower 
            ref={followerRef}
            otherUserId={otherUserId}
            onDataChange={() => handleDataChange('followers')}
          />
        ) : (
          <Following 
            ref={followingRef}
            otherUserId={otherUserId}
            onDataChange={() => handleDataChange('following')}
          />
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});
