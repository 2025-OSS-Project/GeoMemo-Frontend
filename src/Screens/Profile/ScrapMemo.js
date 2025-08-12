import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getScrapMemos } from '../../config/api';
import { AntDesign } from '@expo/vector-icons';

export default function ScrapMemo() {
  const navigation = useNavigation();
  const [scrapMemos, setScrapMemos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 스크랩 메모 목록 가져오기
  const fetchScrapMemos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 저장된 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const result = await getScrapMemos(userToken);
      
      if (result.success && result.data) {
        // isPublic이 true인 메모만 필터링
        const publicMemos = result.data.filter(memo => memo.isPublic === true);
        setScrapMemos(publicMemos);
      } else {
        setError('스크랩 메모 목록을 가져올 수 없습니다.');
      }
    } catch (error) {
      setError(`스크랩 메모 목록 조회 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 스크랩 메모 목록 가져오기
  useEffect(() => {
    fetchScrapMemos();
  }, []);

  // 화면이 포커스될 때마다 스크랩 메모 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchScrapMemos();
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
        <Text style={styles.loadingText}>스크랩 메모 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchScrapMemos}>
          <AntDesign name="reload1" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 스크랩 메모 목록만 스크롤 */}
      <ScrollView contentContainerStyle={styles.memoList}>
        {scrapMemos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>스크랩한 메모가 없습니다</Text>
          </View>
        ) : (
          scrapMemos.map((memo) => (
            <TouchableOpacity
              key={memo.memoId}
              style={styles.memoItem}
              onPress={() => navigation.navigate('MemoView', { memo })}
            >
              {/* 사용자 정보 표시 */}
              {memo.user && (
                <View style={styles.userInfoContainer}>
                  {memo.user.photoUrl ? (
                    <Image 
                      source={{ uri: memo.user.photoUrl }} 
                      style={styles.userPhoto}
                      defaultSource={require('../../../assets/icon.png')}
                    />
                  ) : (
                    <View style={styles.userPhotoPlaceholder}>
                      <AntDesign name="user" size={16} color="#999" />
                    </View>
                  )}
                  <Text style={styles.username}>{memo.user.username || '사용자'}</Text>
                </View>
              )}
              
              <Text style={styles.title}>
                {memo.title || '제목 없음'}
              </Text>
              
              <Text style={styles.content} numberOfLines={1} ellipsizeMode="tail">
                {memo.content}
              </Text>
              
              
              
              <View style={styles.bottomInfo}>
                <Text style={styles.publicStatus}>
                  {memo.isPublic ? '공개' : '비공개'}
                </Text>
                {memo.location && memo.location.category && (
                  <Text style={styles.categoryText}>
                    {memo.location.category}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  memoList: {
    gap: 10,
    paddingBottom: 20,
  },
  memoItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userPhoto: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  userPhotoPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  username: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  content: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publicStatus: {
    fontSize: 8,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 8,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
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
