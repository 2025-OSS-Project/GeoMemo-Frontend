import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import OtherMemoList from './OtherMemoList';
import Insight from './Insight';
import HomeButton from '../Main/HomeButton';

export default function OtherProfile() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('memo');

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        {/* 설정 버튼은 없음 */}
      </View>

      {/* 프로필 섹션 */}
      <View style={styles.profileSection}>
        <View style={styles.photoCircle}>
          <Text style={styles.photoText}>photo</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.nickname}>닉네임</Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>팔로우</Text>
          </TouchableOpacity>
          <View style={styles.followRow}>
            <TouchableOpacity style={styles.followBox} onPress={() => navigation.navigate('Follower')}>
              <Text style={styles.followNumber}>###</Text>
              <Text style={styles.followLabel}>팔로워</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followBox} onPress={() => navigation.navigate('Following')}>
              <Text style={styles.followNumber}>###</Text>
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
        {activeTab === 'memo' ? <OtherMemoList /> : <Insight />}
      </View>
      
      {/* 홈 버튼 */}
      <HomeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 5,
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
});
