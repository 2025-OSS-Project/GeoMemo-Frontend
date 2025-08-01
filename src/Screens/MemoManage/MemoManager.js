import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThisMemo from './ThisMemo';
import AllMemo from './AllMemo';

export default function MemoManager() {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>my memo</Text>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={styles.tabText}>현재 장소 메모</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={styles.tabText}>전체 장소 메모</Text>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 15,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#555',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    marginBottom: 20,
  },
  plus: {
    fontSize: 24,
    color: '#333',
    marginBottom: 5,
  },
});
