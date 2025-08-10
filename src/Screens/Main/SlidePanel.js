import React from 'react';
import { View, Text, TouchableOpacity, Animated, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SLIDE_HEIGHT = 400;

export default function SlidePanel({
  slideAnim,
  panResponder,
  myProfileImage,
  filter,
  setFilter,
  memos,
  myUser,
  followingIds,
}) {
  const navigation = useNavigation();

  const exampleMemo = {
    number: 1,
    time: '2025.08.01 12:34',
    title: '테스트 메모',
    content: '내용',
    location: '서울역',
  };

  return (
    <Animated.View style={[styles.slideUpPanel, { top: slideAnim }]} {...panResponder.panHandlers}>
      <View style={styles.handleBar} />

      {/* 🔹 필터 버튼 영역 */}
      <View style={[styles.filterRow, { alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MyProfile')}>
          <Image source={{ uri: myProfileImage }} style={styles.profileCircle} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('all')}>
          <Text style={styles.filterBtn}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('following')}>
          <Text style={styles.filterBtn}>팔로잉</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('me')}>
          <Text style={styles.filterBtn}>나</Text>
        </TouchableOpacity>

        {/* 테스트 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MemoView', { memo: exampleMemo })}
          style={{ marginLeft: 8, backgroundColor: '#eee', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}
        >
          <Text style={{ fontSize: 12, color: '#333' }}>test</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 필터된 메모 리스트 */}
      {(() => {
        const filteredMemos = memos.filter(memo => {
          if (filter === 'all') return true;
          if (filter === 'me') return memo.userId === myUser?.id;
          if (filter === 'following') return followingIds.includes(memo.userId);
          return true;
        });

        if (filteredMemos.length === 0) {
          return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: SLIDE_HEIGHT }}>
              <Text style={{ color: '#aaa', fontSize: 16 }}>표시할 메모가 없습니다.</Text>
            </View>
          );
        }

        return filteredMemos.map(memo => (
          <View key={memo.id} style={styles.memoCard}>
            {/* 프로필 이미지 */}
            <Image source={{ uri: memo.profileImage }} style={styles.profileCircle} />

            {/* 메모 정보 */}
            <View style={styles.memoBox}>
              <TouchableOpacity onPress={() => navigation.navigate('MemoView', { memo })}>
                <Text style={styles.memoTitle}>{memo.title || memo.text}</Text>
              </TouchableOpacity>
              {memo.userName && <Text style={styles.memoUserName}>by {memo.userName}</Text>}
            </View>
          </View>
        ));
               })()}
     </Animated.View>
   );
 }

const styles = StyleSheet.create({
  slideUpPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    zIndex: 10, // 지도 위에 표시되도록 zIndex 추가
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#aaa',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 60,
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
  },
  memoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memoBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    elevation: 2,
  },
  memoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  memoUserName: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
