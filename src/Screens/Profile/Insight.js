import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserInsights } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Insight({ profileUserId }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 인사이트 데이터 가져오기
  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        console.error('사용자 토큰이 없습니다.');
        return;
      }

      // 프로필 사용자 ID 가져오기 (MyProfile 또는 OtherProfile에서 전달받은 ID)
      let userId = profileUserId;
      if (!userId) {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          userId = user.id;
        }
      }

      if (!userId) {
        console.error('사용자 ID가 없습니다. profileUserId:', profileUserId);
        return;
      }

      console.log('인사이트 요청 - userId:', userId);
      const insightsData = await getUserInsights(userId, userToken);
      
      // 테스트용 하드코딩 데이터 제거하고 실제 API 응답 사용
      setInsights(insightsData);
    } catch (error) {
      console.error('인사이트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profileUserId]);

  // 화면에 포커스가 돌아왔을 때 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchInsights(); // 실제 API 호출 활성화
    }, [fetchInsights])
  );

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  }, [fetchInsights]);

  // 육각형 레이더 차트 컴포넌트
  const HexagonChart = ({ data, size = 220 }) => { // 180 → 220으로 증가
    const radius = size / 2;
    const center = size / 2;
    
    // 총합 계산
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    // total이 0이어도 차트를 표시 (삭제)
    // if (total === 0) return null;

    // 육각형 꼭지점 계산 (감정별)
    const emotions = ['기쁨', '놀람', '분노', '불안', '상처', '슬픔'];
    const points = emotions.map((emotion, index) => {
      const angle = (index * 60 - 90) * (Math.PI / 180); // -90도부터 시작하여 위쪽이 기쁨
      const count = data[emotion] || 0;
      const maxCount = Math.max(...Object.values(data));
      const normalizedRadius = maxCount > 0 ? (count / maxCount) * radius : 0;
      
      return {
        emotion,
        count,
        x: center + normalizedRadius * Math.cos(angle),
        y: center + normalizedRadius * Math.sin(angle),
        angle: angle * (180 / Math.PI),
        color: emotionColors[emotion]
      };
    });

    return (
      <View style={styles.chartContainer}>
        <View style={[styles.chart, { width: size, height: size }]}>
          {/* 배경 육각형 그리드 */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, gridIndex) => (
            <View
              key={gridIndex}
              style={[
                styles.gridHexagon,
                {
                  width: size * scale,
                  height: size * scale,
                  borderRadius: (size * scale) / 2,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  position: 'absolute',
                  top: (size - size * scale) / 2,
                  left: (size - size * scale) / 2,
                }
              ]}
            />
          ))}
          
          {/* 감정 축 라벨 */}
          {emotions.map((emotion, index) => {
            const angle = (index * 60 - 90) * (Math.PI / 180);
            const labelRadius = radius + 35; // 60 → 35로 원래대로
            const labelX = center + labelRadius * Math.cos(angle);
            const labelY = center + labelRadius * Math.sin(angle);
            
            return (
              <View
                key={index}
                style={[
                  styles.axisLabel,
                  {
                    position: 'absolute',
                    top: labelY - 12, // 18 → 12로 원래대로
                    left: labelX - 25, // 35 → 25로 원래대로
                  }
                ]}
              >
                <Text style={styles.axisLabelText}>{emotion}</Text>
              </View>
            );
          })}
          
          {/* 감정 데이터 육각형 */}
          <View style={styles.svgOverlay}>
            {/* 감정 점들을 선으로 연결 */}
            {points.map((point, index) => {
              const nextPoint = points[(index + 1) % points.length];
              const distance = Math.sqrt(
                Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
              );
              const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
              
              return (
                <View
                  key={`line-${index}`}
                  style={{
                    position: 'absolute',
                    top: point.y,
                    left: point.x,
                    width: distance,
                    height: 1.5,
                    backgroundColor: '#81C784', // 더 밝은 초록색으로 변경
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0% 50%',
                    zIndex: 1, // 선을 점 아래로 보내기 위해 낮은 zIndex 설정
                  }}
                />
              );
            })}
            
            {/* 감정 점들 */}
            {points.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.circle,
                  {
                    position: 'absolute',
                    top: point.y - 5, // 7 → 5로 변경 (점 크기 조정에 맞춰)
                    left: point.x - 5, // 7 → 5로 변경 (점 크기 조정에 맞춰)
                    backgroundColor: point.color,
                    borderRadius: 5, // 7 → 5로 변경
                    width: 10, // 14 → 10으로 조정
                    height: 10, // 14 → 10으로 조정
                    zIndex: 2, // 점을 선 위로 보내기 위해 높은 zIndex 설정
                  }
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* 범례 */}
        <View style={styles.legend}>
          {/* 총 개수 표시 */}
          <View style={styles.totalCountContainer}>
            <Text style={styles.totalCountText}>총 {total}개의 감정이 기록되었습니다</Text>
          </View>
          
          {points.map((point, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: point.color }]} />
              <Text style={styles.legendText}>
                {point.emotion}: {point.count}개
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>인사이트를 분석하고 있습니다...</Text>
      </View>
    );
  }

  // 데이터가 없거나 content가 null인 경우
  if (!insights) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>메모를 작성하면 주간 감정 분포를 받을 수 있어요!</Text>
      </View>
    );
  }

  const emotionColors = {
    '기쁨': '#FFD700', // 밝은 노란색
    '놀람': '#FF6B6B', // 빨간색
    '분노': '#8B0000', // 진한 적갈색으로 변경 (빨간색과 구분)
    '불안': '#FF8C00', // 주황색
    '상처': '#800080', // 진한 보라색으로 변경 (더 진하고 구분되게)
    '슬픔': '#0066CC'  // 진한 파란색으로 변경 (더 진하고 구분되게)
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* 감정 통계 파이차트 */}
        {insights.emotionCount && (
          <View style={styles.emotionSection}>
            <Text style={styles.sectionTitle}>이번 주 감정 분포</Text>
            <HexagonChart data={insights.emotionCount} />
            
            {/* 감정별 상세 정보 */}
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
        {insights.content ? (
          <View style={styles.insightSection}>
            <Text style={styles.sectionTitle}>주간 인사이트</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>{insights.content}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.insightSection}>
            <Text style={styles.sectionTitle}>주간 인사이트</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>메모를 작성하면 주간 인사이트를 받을 수 있어요!</Text>
            </View>
          </View>
        )}

        {/* 인사이트가 아직 없는 경우 */}
        {!insights.content && insights.status === 'PENDING' && Object.values(insights.emotionCount).some(count => count > 0) && (
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
  emotionSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 35, // 20 → 35로 증가하여 제목과 그래프 사이 공간 확보
    alignSelf: 'flex-start',
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 40, // 25 → 40으로 증가하여 그래프 아래 공간 확보
    alignItems: 'center',
  },
  chart: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 55,
    marginTop: 50,
  },
  gridHexagon: {
    position: 'absolute',
    borderRadius: '50%',
    transformOrigin: 'center',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  axisLabel: {
    position: 'absolute',
    backgroundColor: 'white',
    paddingHorizontal: 10, // 14 → 10으로 원래대로
    paddingVertical: 6, // 10 → 6으로 원래대로
    borderRadius: 15, // 20 → 15로 원래대로
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 40, // 45 → 40으로 원래대로
    alignItems: 'center', // 중앙 정렬
  },
  axisLabelText: {
    fontSize: 11, // 12 → 11로 원래대로
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 14, // 16 → 14로 원래대로
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  emotionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    elevation: 1,
  },
  emotionColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emotionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  emotionCount: {
    fontSize: 18,
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
    fontSize: 14, // 16 → 14로 줄임
    lineHeight: 20, // 24 → 20으로 줄임
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
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  chartCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chartCenterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  totalCountContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  totalCountText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
