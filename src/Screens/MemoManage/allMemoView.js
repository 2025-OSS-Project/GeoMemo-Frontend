import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Entypo, AntDesign } from '@expo/vector-icons';
import { deleteMemo, updateMemo } from '../../config/api';

export default function AllMemoView() {
  const navigation = useNavigation();
  const route = useRoute();
  const { memo: initialMemo } = route.params;

  const [memo, setMemo] = useState(initialMemo);
  const [isPublic, setIsPublic] = useState(initialMemo.isPublic);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(initialMemo.content);
  const [editedTitle, setEditedTitle] = useState(initialMemo.title || '');

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

  // 메모 삭제 함수
  const handleDeleteMemo = async () => {
    Alert.alert(
      '메모 삭제',
      '정말로 이 메모를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
                         try {
               setIsDeleting(true);
               await deleteMemo(memo.memoId);
               Alert.alert('성공', '메모가 삭제되었습니다.', [
                 { text: '확인', onPress: () => {
                   // 삭제 후 이전 화면으로 돌아가면서 리스트 새로고침 트리거
                   navigation.goBack();
                 }}
               ]);
            } catch (error) {
              Alert.alert('오류', `메모 삭제에 실패했습니다: ${error.message}`);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // Public 상태 변경 함수
  const handleTogglePublic = async () => {
    try {
      setIsUpdating(true);
      const newPublicStatus = !isPublic;
      
      await updateMemo(memo.memoId, {
        is_public: newPublicStatus,
        remain_photo_ids: [], // 기존 사진 모두 유지
        new_photo_urls: [] // 새로운 사진 없음
      });
      
      // 서버 응답에서 업데이트된 메모 데이터 가져오기
      const result = await updateMemo(memo.memoId, {
        is_public: newPublicStatus,
        remain_photo_ids: [],
        new_photo_urls: []
      });
      
      if (result.success && result.data) {
        setMemo(result.data);
        setIsPublic(result.data.isPublic);
      }
      
      Alert.alert('성공', `메모가 ${newPublicStatus ? '공개' : '비공개'}로 변경되었습니다.`);
    } catch (error) {
      Alert.alert('오류', `상태 변경에 실패했습니다: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 수정 모드 토글 함수
  const handleEditToggle = () => {
    if (isEditing) {
      // 수정 완료
      handleSaveEdit();
    } else {
      // 수정 모드 시작
      setIsEditing(true);
    }
  };

  // 수정 저장 함수
  const handleSaveEdit = async () => {
    try {
      console.log('🔧 메모 수정 시작:', memo.memoId);
      console.log('📝 수정할 내용:', editedContent);
      
      setIsUpdating(true);
      
      const updateData = {
        title: editedTitle,
        content: editedContent,
        is_public: isPublic,
        remain_photo_ids: [], // 기존 사진 모두 유지
        new_photo_urls: [] // 새로운 사진 없음
      };
      
      console.log('📡 서버로 전송할 데이터:', updateData);
      
      const result = await updateMemo(memo.memoId, updateData);
      
      console.log('✅ 서버 응답:', result);
      
      // 업데이트된 메모 데이터로 상태 업데이트
      if (result.success && result.data) {
        setMemo(result.data);
        setEditedContent(result.data.content);
        setEditedTitle(result.data.title || '');
        setIsPublic(result.data.isPublic);
      }
      
      setIsEditing(false);
      Alert.alert('성공', '메모가 수정되었습니다.');
    } catch (error) {
      console.error('❌ 메모 수정 오류:', error);
      Alert.alert('오류', `메모 수정에 실패했습니다: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* 제목 줄 */}
      <View style={styles.inputRow}>
        {isEditing ? (
          <TextInput
            style={styles.titleTextInput}
            value={editedTitle}
            onChangeText={setEditedTitle}
            placeholder="제목을 입력하세요"
          />
        ) : (
          <Text style={styles.titleText}>{memo.title || '제목 없음'}</Text>
        )}
      </View>
      
      {/* 장소|시간 */}
      <View style={styles.inputRow}>
        <Text style={styles.timeBox}>{memo.location?.address || '위치 없음'} | {formatDate(memo.createdAt)}</Text>
      </View>

      {/* 내용 */}
      <ScrollView style={styles.contentInput}>
        {isEditing ? (
          <TextInput
            style={styles.contentTextInput}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            placeholder="메모 내용을 입력하세요"
          />
        ) : (
          <Text style={styles.contentText}>{memo.content}</Text>
        )}
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleTogglePublic} disabled={isUpdating}>
          <View style={[styles.footerBtn, isUpdating && styles.disabledBtn]}>
            {isPublic ? (
              <Entypo name="eye" size={24} color="black" />
            ) : (
              <Entypo name="eye-with-line" size={24} color="black" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.footerBtn}>
            <AntDesign name="link" size={24} color="black" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleEditToggle} disabled={isUpdating}>
          <Text style={[styles.footerBtnText, isUpdating && styles.disabledBtn]}>
            {isEditing ? '저장' : '수정'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            setIsEditing(false);
            // 수정 취소 시 원래 데이터로 복원
            setEditedContent(memo.content);
            setEditedTitle(memo.title || '');
          }} 
          disabled={isUpdating || !isEditing}
        >
          <Text style={[styles.footerBtnText, (isUpdating || !isEditing) && styles.disabledBtn]}>
            취소
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleDeleteMemo}
          disabled={isDeleting}
          style={[styles.footerBtnText, isDeleting && styles.disabledBtn]}
        >
          <Text>
            {isDeleting ? '삭제 중...' : '삭제'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timeBox: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    borderRadius: 4,
    marginRight: 8,
  },
  titleText: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
    color: '#333',
  },
  titleTextInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationText: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
    color: '#666',
  },
  titleRow: {
    marginBottom: 10,
  },
  contentInput: {
    height: '70%',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 14,
    color: '#222',
  },
  contentTextInput: {
    fontSize: 14,
    color: '#222',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },
  footerBtnText: {
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  disabledBtn: {
    backgroundColor: '#999',
  },
});

