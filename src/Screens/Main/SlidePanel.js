// components/SlidePanel.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { styles } from './styles';

const SLIDE_HEIGHT = 400

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
}) {
  // 테스트용 예시 메모
  const exampleMemo = {
    number: 1,
    time: '12:34',
    title: '테스트 메모',
    content: '이것은 MemoModal 디자인 테스트용 예시입니다.',
  };

  return (
    <Animated.View style={[styles.slideUpPanel, { top: slideAnim }]} {...panResponder.panHandlers}>
      <View style={styles.handleBar} />

      {/* 🔹 필터 버튼 영역 + 모달 테스트 버튼 */}
      <View style={[styles.filterRow, { alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => setFilter('me')}>
          <Image source={{ uri: myProfileImage }} style={styles.profileCircle} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('all')}>
          <Text style={styles.filterBtn}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('following')}>
          <Text style={styles.filterBtn}>팔로잉</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('mine')}>
          <Text style={styles.filterBtn}>나</Text>
        </TouchableOpacity>
        {/* 모달 테스트용 작은 버튼 */}
        <TouchableOpacity
          onPress={() => onPressMemo && onPressMemo(exampleMemo)}
          style={{ marginLeft: 8, backgroundColor: '#eee', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}
        >
          <Text style={{ fontSize: 12, color: '#333' }}>test</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 필터된 메모 리스트 */}
      {(() => {
        const filteredMemos = memos
          .filter(memo => {
            if (filter === 'all') return true;
            if (filter === 'me') return memo.userId === myUser?.id;
            if (filter === 'following') return followingIds.includes(memo.userId);
            if (filter === 'mine') return memo.userId === myUser?.id;
            return true;
          });
        if (filteredMemos.length === 0) {
          return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: SLIDE_HEIGHT}}>
              <Text style={{ color: '#aaa', fontSize: 16 }}>표시할 메모가 없습니다.</Text>

            </View>
          );
        }
        return filteredMemos.map(memo => (
          <View key={memo.id} style={styles.memoCard}>
            {/* 작성자 프로필 사진 */}
            <Image source={{ uri: memo.profileImage }} style={styles.profileCircle} />

            {/* 메모 정보 */}
            <View style={styles.memoBox}>
              <TouchableOpacity onPress={() => onPressMemo && onPressMemo(memo)}>
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