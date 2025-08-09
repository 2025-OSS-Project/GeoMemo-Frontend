import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMemos } from '../../config/Api';
import { AntDesign } from '@expo/vector-icons';

export default function AllMemo() {
  const navigation = useNavigation();

  const [memos, setMemos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 메모 목록 가져오기
  const fetchMemos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 저장된 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      const result = await getMemos(1, 20, userToken); // 첫 페이지, 20개씩
      
      if (result.success && result.data) {
        setMemos(result.data);
      } else {
        setError('메모 목록을 가져올 수 없습니다.');
      }
         } catch (error) {
       setError(`메모 목록 조회 실패: ${error.message}`);
     } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 메모 목록 가져오기
  useEffect(() => {
    fetchMemos();
  }, []);

  // 화면이 포커스될 때마다 메모 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchMemos();
    }, [])
  );

  // 메모 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>메모 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMemos}>
          <AntDesign name="reload1" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.memoList}>
      {memos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>메모가 없습니다</Text>
        </View>
      ) : (
        memos.map((memo) => (
          <TouchableOpacity
            key={memo.memoId}
            style={styles.memoItem}
            onPress={() => navigation.navigate('AllMemoView', { memo })}
          >
                                     <Text style={styles.title}>
              {memo.title || '제목 없음'}
            </Text>
            <Text style={styles.location}>
              {memo.location?.address || '위치 없음'} | {formatDate(memo.createdAt)}
            </Text>
            <Text style={styles.content} numberOfLines={2}>
              {memo.content}
            </Text>
            <Text style={styles.publicStatus}>
              {memo.isPublic ? '공개' : '비공개'}
            </Text>
          </TouchableOpacity>
        ))
      )}
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
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  publicStatus: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});
