// components/MemoModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';

export default function MemoModal({ visible, memo, onClose, onBookmark, onNavigate }) {
  // 스크랩 상태 관리 (예시: memo.isScrapped가 있으면 초기값으로 사용)
  const [isScrapped, setIsScrapped] = useState(memo?.isScrapped || false);

  const handleScrap = () => {
    setIsScrapped(prev => !prev);
    if (onBookmark) onBookmark(!isScrapped);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* 상단 바 */}
          <View style={modalStyles.topBar}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleScrap}>
              {isScrapped ? (
                <FontAwesome name="bookmark" size={24} color="black" />
              ) : (
                <FontAwesome name="bookmark-o" size={24} color="#222" />
              )}
            </TouchableOpacity>
          </View>

          {/* 프로필/번호, 시간, 제목 */}
          <View style={modalStyles.headerRow}>
            <View style={modalStyles.circle}>
              <Text style={modalStyles.circleText}>{memo?.number || 1}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Text style={modalStyles.timeTag}>{memo?.time || '시간'}</Text>
              <Text style={modalStyles.titleTag}>{memo?.title || '제목'}</Text>
            </View>
          </View>

          {/* 메모 내용 */}
          <View style={modalStyles.memoBox}>
            <ScrollView>
              <Text style={modalStyles.memoText}>{memo?.content}</Text>
            </ScrollView>
          </View>

          {/* 하단 버튼 */}
          <View style={modalStyles.bottomRow}>
            <TouchableOpacity style={modalStyles.iconBtn}>
              <AntDesign name="link" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.guideBtn} onPress={onNavigate}>
              <Ionicons name="navigate" size={24} color="#222" />
              <Text style={modalStyles.guideText}>길안내</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
  },
  container: {
    width: '90%', backgroundColor: '#fff', borderRadius: 18, padding: 20
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12
  },
  circle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center'
  },
  circleText: {
    color: '#fff', fontWeight: 'bold', fontSize: 18
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 12
  },
  timeTag: {
    backgroundColor: '#bbb', color: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, fontSize: 13
  },
  titleTag: {
    backgroundColor: '#eee', color: '#888', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 13
  },
  memoBox: {
    backgroundColor: '#e5e5e5', borderRadius: 10, minHeight: 120, marginBottom: 20, padding: 16, justifyContent: 'center'
  },
  memoText: {
    color: '#333', fontSize: 16
  },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10
  },
  iconBtn: {
    backgroundColor: '#f5f5f5', borderRadius: 20, padding: 10
  },
  guideBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8
  },
  guideText: {
    marginLeft: 6, fontSize: 15, color: '#222'
  }
});
