import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AllMemo() {
  const navigation = useNavigation();

  const allMemos = [
    { id: 1, place: '서울역', time: '09:00', title: '출근길', content: '지하철 너무 붐벼', isPublic: true },
    { id: 2, place: '카페', time: '10:20', title: '라떼 한 잔', content: '오늘도 라떼 맛있다', isPublic: false },
    { id: 3, place: '학교', time: '11:00', title: '강의 중 메모', content: '교수님 수업 졸림', isPublic: true },
  ];

  return (
    <ScrollView contentContainerStyle={styles.memoList}>
      {allMemos.map((memo) => (
        <TouchableOpacity
          key={memo.id}
          style={styles.memoItem}
          onPress={() => navigation.navigate('AllMemoView', { memo })}
        >
          <Text style={styles.time}>{memo.place} | {memo.time}</Text>
          <Text style={styles.title}>{memo.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  memoList: {
    gap: 10,
    paddingBottom: 20,
  },
  memoItem: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
});
