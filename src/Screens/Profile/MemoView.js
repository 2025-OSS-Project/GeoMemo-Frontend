import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';

export default function MemoView({ navigation, route }) {
  const [isScrapped, setIsScrapped] = useState(false);
  
  // route.params에서 메모 데이터 가져오기
  const memo = route?.params?.memo || {
    number: 1,
    time: '2025.08.01 12:34',
    title: '테스트 메모',
    content: '메모 내용이 여기에 표시됩니다.',
    location: '서울역'
  };

  const handleScrap = () => {
    setIsScrapped(!isScrapped);
    // 여기에 스크랩 API 호출 추가 가능
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
        animated={true}
      />
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleScrap}>
          {isScrapped ? (
            <FontAwesome name="bookmark" size={24} color="black" />
          ) : (
            <FontAwesome name="bookmark-o" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {/* 메모 헤더 */}
      <View style={styles.header}>
        <View style={styles.circle}>
          <Text style={styles.circleText}>{memo.number}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.locationTime}>
            <Text style={styles.locationText}>{memo.location}/{memo.time}</Text>
            <Text style={styles.titleText}>{memo.title}</Text>
          </View>
        </View>
      </View>

      {/* 메모 본문 */}
      <View style={styles.memoBox}>
        <Text style={styles.memoContent}>{memo.content}</Text>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity>
          <AntDesign name="link" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.guideButton}>
          <Ionicons name="navigate" size={24} color="black" />
          <Text style={styles.guideText}>길안내</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  locationTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    backgroundColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    fontSize: 12,
  },
  titleText: {
    fontSize: 14,
    color: '#555',
  },
  memoBox: {
    height: '70%',
    backgroundColor: '#f5f5f5',
    marginTop: 20,
    borderRadius: 8,
    padding: 16,
  },
  memoContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideText: {
    marginLeft: 4,
    fontSize: 12,
  },
});
