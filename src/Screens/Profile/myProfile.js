import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import ScrapMemo from './scrapMemo';
import Insight from './insight';

export default function MyProfile() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('scrap');

  return (
    <View style={styles.container}>
      {/* 상단 네비게이션 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 프로필 영역 */}
      <View style={styles.profileSection}>
        <View style={styles.photoCircle}>
          <Text style={styles.photoText}>photo</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.nickname}>닉네임</Text>
          <View style={styles.followRow}>
            <View style={styles.followBox}>
              <Text style={styles.followNumber}>###</Text>
              <Text style={styles.followLabel}>팔로워</Text>
            </View>
            <View style={styles.followBox}>
              <Text style={styles.followNumber}>###</Text>
              <Text style={styles.followLabel}>팔로잉</Text>
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10 ,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
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
    marginTop: 30,
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
