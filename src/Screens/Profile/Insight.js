import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserInsights } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Insight() {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 인사이트 데이터 가져오기
  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (!userToken || !userInfo) {
        console.error('사용자 정보가 없습니다.');
        return;
      }

      const user = JSON.parse(userInfo);
      const insightsData = await getUserInsights(user.id, userToken);
      setInsights(insightsData);
    } catch (error) {
      console.error('인사이트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 화면에 포커스가 돌아왔을 때 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchInsights();
    }, [fetchInsights])
  );

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  }, [fetchInsights]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>인사이트를 분석하고 있습니다...</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataSubText}>메모를 작성하면 주간 인사이트를 받을 수 있어요!</Text>
      </View>
    );
  }

  const emotionColors = {
    '기쁨': '#FFD700',
    '놀람': '#FF6B6B',
    '분노': '#FF4757',
    '불안': '#FFA502',
    '상처': '#A55EEA',
    '슬픔': '#74B9FF'
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* 상태 표시 */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>분석 상태:</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: insights.status === 'DONE' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {insights.status === 'DONE' ? '완료' : '진행중'}
            </Text>
          </View>
        </View>

        {/* 감정 통계 */}
        {insights.emotionCount && (
          <View style={styles.emotionSection}>
            <Text style={styles.sectionTitle}>이번 주 감정 분포</Text>
            <View style={styles.emotionGrid}>
              {Object.entries(insights.emotionCount).map(([emotion, count]) => (
                <View key={emotion} style={styles.emotionItem}>
                  <View style={[styles.emotionColor, { backgroundColor: emotionColors[emotion] || '#999' }]} />
                  <Text style={styles.emotionName}>{emotion}</Text>
                  <Text style={styles.emotionCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 인사이트 내용 */}
        {insights.content && (
          <View style={styles.insightSection}>
            <Text style={styles.sectionTitle}>주간 인사이트</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>{insights.content}</Text>
            </View>
          </View>
        )}

        {/* 인사이트가 아직 없는 경우 */}
        {!insights.content && insights.status === 'PENDING' && (
          <View style={styles.pendingSection}>
            <Text style={styles.pendingText}>인사이트 분석이 진행 중입니다.</Text>
            <Text style={styles.pendingSubText}>잠시만 기다려주세요...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emotionSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  emotionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emotionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  insightSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  insightContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  pendingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  pendingSubText: {
    fontSize: 14,
    color: '#999',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
