import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThisMemo from './ThisMemo';
import AllMemo from './AllMemo';

export default function MemoManager() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('current');

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>my memo</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>현재 장소 메모</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>전체 장소 메모</Text>
        </TouchableOpacity>
      </View>

      {/* 메모 리스트 */}
      {activeTab === 'current' ? <ThisMemo /> : <AllMemo />}
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tabText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#333',
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  plus: {
    fontSize: 30,
    color: '#333',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // Adjust as needed to balance the back button and title
  },
});
