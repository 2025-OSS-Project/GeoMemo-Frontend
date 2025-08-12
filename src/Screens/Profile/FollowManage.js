import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Follower from './Follower';
import Following from './Following';

export default function FollowManage() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // route params에서 초기 탭과 사용자 닉네임 가져오기
  const initialTab = route.params?.initialTab || 'followers';
  const userNickname = route.params?.userNickname || '사용자';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const followerRef = useRef();
  const followingRef = useRef();

  // 컴포넌트 마운트 시 데이터 즉시 로딩
  useEffect(() => {
    const loadInitialData = () => {
      // 약간의 지연 후 자식 컴포넌트 새로고침
      setTimeout(() => {
        if (followerRef.current?.refresh) {
          followerRef.current.refresh();
        }
        if (followingRef.current?.refresh) {
          followingRef.current.refresh();
        }
      }, 100);
    };

    loadInitialData();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // 자식 컴포넌트에서 데이터 개수 받기
  const handleFollowersDataUpdate = (count) => {
    console.log('팔로워 카운트 업데이트:', count, typeof count);
    setFollowersCount(Number(count) || 0);
  };

  const handleFollowingDataUpdate = (count) => {
    console.log('팔로잉 카운트 업데이트:', count, typeof count);
    setFollowingCount(Number(count) || 0);
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
            {Math.max(0, followersCount || 0)} Followers
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
            onDataUpdate={handleFollowersDataUpdate}
          />
        ) : (
          <Following 
            ref={followingRef}
            onDataUpdate={handleFollowingDataUpdate}
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
