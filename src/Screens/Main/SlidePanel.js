import React from 'react';
import { View, Text, TouchableOpacity, Animated, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
}) {
  const navigation = useNavigation();

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
           const displayMemos = memos;

           // 메모가 로딩 중인 경우
           if (isLoadingMemos) {
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
                  {memo.profileImage ? (
                    <Image 
                      source={{ uri: memo.profileImage }} 
                      style={styles.memoProfileCircle}
                    />
                  ) : (
                    <View style={[styles.memoProfileCircle, styles.defaultProfile]}>
                    </View>
                  )}

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
