import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserInfo } from '../../config/api';

export default function SlidePanel({
  slideAnim,
  panResponder,
  myProfileImage,
  filter,
  setFilter,
  memos,
  myUser,
  followingIds,
  onPressMemo,
  SLIDE_HEIGHT = 300,
  isLoadingMemos = false,
  mapBounds, // 지도 경계 추가
  userToken, // 사용자 토큰 추가
  onMemosUpdate, // 메모 업데이트 콜백 추가
}) {
  const navigation = useNavigation();
  const [localMemos, setLocalMemos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedMapBounds, setDebouncedMapBounds] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const debounceTimeoutRef = useRef(null);
  const prevMapBoundsRef = useRef(null);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const loadCurrentUserInfo = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          const currentUser = await getCurrentUserInfo(userToken);
          setCurrentUserInfo(currentUser);
        }
      } catch (error) {
        console.error('현재 사용자 정보 로드 실패:', error);
      }
    };

    loadCurrentUserInfo();
  }, []);

  // mapBounds 변경 시 디바운싱 적용 (실시간 위치 추적 시 API 호출 방지)
  useEffect(() => {
    console.log('=== SlidePanel mapBounds 변경 감지 ===');
    console.log('새로운 mapBounds:', mapBounds);
    console.log('이전 mapBounds:', prevMapBoundsRef.current);
    
    // mapBounds가 유효한지 확인
    if (!mapBounds || !mapBounds.northWest || !mapBounds.southEast) {
      console.log('유효하지 않은 mapBounds - 건너뜀');
      return;
    }
    
    console.log('mapBounds 변경됨 - 디바운싱 시작');
    prevMapBoundsRef.current = mapBounds;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 500ms 후에 API 호출 (사용자가 지도 조작을 멈춘 후)
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('디바운싱 완료 - debouncedMapBounds 업데이트');
      setDebouncedMapBounds(mapBounds);
    }, 500); 

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [mapBounds]);

  // 직접 API 호출로 메모 가져오기 (디바운싱된 지도 경계 포함)
  const fetchMemos = useCallback(async () => {
    if (!debouncedMapBounds || !debouncedMapBounds.northWest || !debouncedMapBounds.southEast) {
      return;
    }
    
    if (!userToken) {
      return;
    }
    
    setIsLoading(true);
    
    // API 호출 시 전달되는 값들 로그 출력
    console.log('=== API 호출 시 전달되는 값들 ===');
    console.log('전체 mapBounds:', debouncedMapBounds);
    console.log('북서(northWest):', debouncedMapBounds.northWest);
    console.log('남동(southEast):', debouncedMapBounds.southEast);
    console.log('필터:', filter);
    
    try {
      const queryParams = new URLSearchParams({
        view_setting: filter === 'all' ? 'all' : filter === 'following' ? 'following' : filter === 'me' ? 'self' : 'all',
        // 지도 경계 좌표 추가 (API 문서에 맞게 lat1, lon1, lat2, lon2 사용)
        lat1: debouncedMapBounds.northWest.latitude.toFixed(6),
        lon1: debouncedMapBounds.northWest.longitude.toFixed(6),
        lat2: debouncedMapBounds.southEast.latitude.toFixed(6),
        lon2: debouncedMapBounds.southEast.longitude.toFixed(6)
      });
      
             // 최종 API URL과 파라미터 로그 출력
       console.log('전달되는 파라미터 (API 문서 형식):');
       console.log('- lat1:', debouncedMapBounds.northWest.latitude.toFixed(7));
       console.log('- lon1:', debouncedMapBounds.northWest.longitude.toFixed(7));
       console.log('- lat2:', debouncedMapBounds.southEast.latitude.toFixed(7));
       console.log('- lon2:', debouncedMapBounds.southEast.longitude.toFixed(7));
       console.log('- view_setting:', filter === 'all' ? 'all' : filter === 'following' ? 'following' : filter === 'me' ? 'self' : 'all');
       console.log('========================');

      const url = `https://dco69dhctdpt.cloudfront.net/api/memo/all?${queryParams}`;
      console.log('최종 API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        
                 if (result.success && result.data) {
           const transformedMemos = result.data.map(memo => ({
             id: memo.memoId,
             title: memo.title,
             content: memo.content,
             lat: memo.location?.latitude || memo.latitude,
             lng: memo.location?.longitude || memo.longitude,
             userId: memo.user?.userId,
             userName: memo.user?.username,
             profileImage: memo.user?.photoUrl,
             createdAt: memo.createdAt,
             isPublic: memo.isPublic,
             fileUrl: memo.fileUrl
           }));
           
           setLocalMemos(transformedMemos);
           
           // 부모 컴포넌트의 memos 상태도 업데이트 (지도 마커 업데이트용)
           if (onMemosUpdate) {
             onMemosUpdate(transformedMemos);
           }
         } else {
           setLocalMemos([]);
           
           // 부모 컴포넌트의 memos 상태도 빈 배열로 업데이트
           if (onMemosUpdate) {
             onMemosUpdate([]);
           }
         }
             } else {
         setLocalMemos([]);
         
         // 부모 컴포넌트의 memos 상태도 빈 배열로 업데이트
         if (onMemosUpdate) {
           onMemosUpdate([]);
         }
       }
     } catch (error) {
       setLocalMemos([]);
       
       // 부모 컴포넌트의 memos 상태도 빈 배열로 업데이트
       if (onMemosUpdate) {
         onMemosUpdate([]);
       }
     } finally {
      setIsLoading(false);
    }
  }, [debouncedMapBounds, userToken, filter]);

  // 필터 변경 시에만 API 호출 (초기 로딩 및 필터 변경 시)
  useEffect(() => {
    if (debouncedMapBounds && debouncedMapBounds.northWest && debouncedMapBounds.southEast && userToken) {
      fetchMemos();
    }
  }, [filter, fetchMemos]);

  // 디바운싱된 mapBounds 변경 시에만 API 호출 (지도 조작 완료 후)
  useEffect(() => {
    if (debouncedMapBounds && debouncedMapBounds.northWest && debouncedMapBounds.southEast && userToken) {
      fetchMemos();
    }
  }, [debouncedMapBounds, fetchMemos]);

  // 표시할 메모 결정 (로컬 메모가 있으면 사용, 없으면 props로 받은 메모 사용)
  const displayMemos = localMemos.length > 0 ? localMemos : memos;
  const isActuallyLoading = isLoading || isLoadingMemos;

  return (
    <Animated.View style={[styles.slideUpPanel, { top: slideAnim, height: SLIDE_HEIGHT }]} {...panResponder.panHandlers}>
      {/* 🔹 슬라이드 핸들 바 */}
      <View style={styles.handleBar}>
        <View style={styles.handleBarIndicator} />
      </View>

      {/* 🔹 필터 버튼 영역 */}
      <View style={[styles.filterRow, { alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MyProfile')}>
          <Image source={{ uri: myProfileImage }} style={styles.profileCircle} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFilter('all')}
          style={[
            styles.filterBtn,
            filter === 'all' && styles.filterBtnActive
          ]}
        >
          <MaterialCommunityIcons name="map-marker-question" size={24} color="black" />
          <Text style={[
            styles.filterBtnText,
            filter === 'all' && styles.filterBtnTextActive
          ]}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFilter('following')}
          style={[
            styles.filterBtn,
            filter === 'following' && styles.filterBtnActive
          ]}
        >
          <MaterialCommunityIcons name="map-marker-account" size={24} color="black" />
          <Text style={[
            styles.filterBtnText,
            filter === 'following' && styles.filterBtnTextActive
          ]}>팔로잉</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFilter('me')}
          style={[
            styles.filterBtn,
            filter === 'me' && styles.filterBtnActive
          ]}
        >
          <MaterialCommunityIcons name="map-marker-check" size={24} color="black" />
          <Text style={[
            styles.filterBtnText,
            filter === 'me' && styles.filterBtnTextActive
          ]}>나</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 필터된 메모 리스트 */}
      <ScrollView 
        style={styles.memoListContainer}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.memoListContent}
      >
                 {(() => {
           // 백엔드에서 이미 필터링된 메모를 제공하므로 클라이언트 사이드 필터링 불필요
           // const displayMemos = memos; // 이 줄은 이제 사용되지 않음

           // 메모가 로딩 중인 경우
           if (isActuallyLoading) {
             return (
               <View style={styles.emptyState}>
                 <Text style={styles.emptyStateText}>리스트를 후딱 가져오는 중...</Text>
               </View>
             );
           }

           // 메모가 없는 경우 (로딩이 완료되었지만 데이터가 없음)
           if (displayMemos.length === 0) {
             return (
               <View style={styles.emptyState}>
                 <Text style={styles.emptyStateText}>
                   {filter === 'all' && '메모 없음'}
                   {filter === 'following' && '팔로잉한 사용자의 메모가 없습니다.'}
                   {filter === 'me' && '메모 없음'}
                 </Text>
               </View>
             );
           }

          return (
            <>
              <View style={styles.filterInfo}>
                <Text style={styles.filterInfoText}>
                  {filter === 'all' && `전체 메모 ${displayMemos.length}개`}
                  {filter === 'following' && `팔로잉 메모 ${displayMemos.length}개`}
                  {filter === 'me' && `내 메모 ${displayMemos.length}개`}
                </Text>
              </View>
              {displayMemos.map(memo => (
                <View key={memo.id} style={styles.memoCard}>
                  {/* 프로필 이미지 */}
                                     <TouchableOpacity 
                     onPress={() => {
                       // 현재 사용자와 메모 작성자 비교
                       if (currentUserInfo && memo.userId) {
                         if (memo.userId === currentUserInfo.user_id) {
                           // 내 메모인 경우
                           navigation.navigate('MyProfile');
                         } else {
                           // 다른 사용자의 메모인 경우
                           navigation.navigate('OtherProfile', { userId: memo.userId });
                         }
                       } else {
                         // currentUserInfo가 없거나 memo.userId가 없는 경우
                         console.warn('사용자 정보 또는 메모 작성자 정보가 없습니다.');
                       }
                     }}
                   >
                    {memo.profileImage ? (
                      <Image 
                        source={{ uri: memo.profileImage }} 
                        style={styles.memoProfileCircle}
                      />
                    ) : (
                      <View style={[styles.memoProfileCircle, styles.defaultProfile]}>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* 메모 정보 */}
                  <View style={styles.memoBox}>
                    <TouchableOpacity 
                      onPress={() => {
                        console.log('=== SlidePanel 메모 클릭 ===');
                        console.log('클릭된 메모:', memo);
                        console.log('onPressMemo 함수 존재 여부:', !!onPressMemo);
                        onPressMemo(memo);
                      }}
                      style={styles.memoTouchable}
                    >
                      <Text style={styles.memoTitle}>{memo.title || memo.content}</Text>
                    </TouchableOpacity>
                    {memo.userName && <Text style={styles.memoUserName}>by {memo.userName}</Text>}
                  </View>
                </View>
              ))}
            </>
          );
        })()}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slideUpPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 248, 248, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 20,
    elevation: 10,
    zIndex: 10, // 지도 위에 표시되도록 zIndex 추가
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  handleBarIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  memoListContainer: {
    flex: 1,
  },
  memoListContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#aaa',
    fontSize: 16,
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  filterBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    fontWeight: 'bold',
    fontSize: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#6c757d',
    color: 'white',
  },
  filterBtnText: {
    color: '#333',
  },
  filterBtnTextActive: {
    color: 'white',
  },
  memoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    elevation: 2,
  },
  memoTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  memoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  memoUserName: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  defaultProfile: {
    backgroundColor: '#E0E0E0', // 무채색 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  memoProfileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  filterInfo: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterInfoText: {
    fontSize: 14,
    color: '#555',
  },
});
