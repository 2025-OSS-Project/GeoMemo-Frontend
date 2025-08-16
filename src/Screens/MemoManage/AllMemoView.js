import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Entypo, AntDesign } from '@expo/vector-icons';
import { deleteMemo, updateMemo, getMemoById } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  // 응답/파라미터를 항상 "메모 객체"로 정규화
  const normalizeMemo = (obj) => (obj?.data ?? obj ?? null);

  // 메모 데이터 가져오기 (content가 없으면 상세 API로 보강)
  useEffect(() => {
    const fetchMemoData = async () => {
      try {
        // content가 없으면 상세 API 호출로 보강
        if (!initialMemo?.content && initialMemo?.memoId) {
          console.log('content가 없어서 상세 API 호출로 보강');
          const userToken = await AsyncStorage.getItem('userToken');
          const detail = normalizeMemo(await getMemoById(initialMemo.memoId, userToken));
          if (detail) {
            console.log('상세 API로 content 보강 완료:', detail);
            setMemo(detail);
            setEditedContent(detail.content);
            setEditedTitle(detail.title || '');
            setIsPublic(detail.isPublic);
          }
        }
      } catch (error) {
        console.error('메모 상세 조회 중 오류:', error);
      }
    };

    fetchMemoData();
  }, [initialMemo]);

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
              const userToken = await AsyncStorage.getItem('userToken');
              await deleteMemo(memo.memoId, userToken);
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
      const userToken = await AsyncStorage.getItem('userToken');
      
      // 서버 응답에서 업데이트된 메모 데이터 가져오기
      const result = await updateMemo(memo.memoId, {
        is_public: newPublicStatus,
        remain_photo_ids: [], // 기존 사진 모두 유지
        new_photo_urls: [] // 새로운 사진 없음
      }, userToken);
      
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

  // isPublic 상태 직접 변경 함수 (눈 아이콘 클릭 시)
  const handlePublicStatusChange = (newStatus) => {
    setIsPublic(newStatus);
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
      console.log('메모 수정 시작:', memo.memoId);
      console.log('수정할 내용:', editedContent);
      console.log('수정할 제목:', editedTitle);
      
      setIsUpdating(true);
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('사용자 토큰:', userToken ? '토큰 있음' : '토큰 없음');
      
      const updateData = {
        title: editedTitle,
        content: editedContent,
        is_public: isPublic,
        remain_photo_ids: [], // 기존 사진 모두 유지
        new_photo_urls: [] // 새로운 사진 없음
      };
      
      console.log('서버로 전송할 데이터:', JSON.stringify(updateData, null, 2));
      console.log('API 엔드포인트:', `PUT ${memo.memoId}`);
      
      const result = await updateMemo(memo.memoId, updateData, userToken);
      
      console.log('서버 응답:', JSON.stringify(result, null, 2));
      
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
      console.error('메모 수정 오류:', error);
      console.error('오류 상세:', error.message);
      console.error('오류 스택:', error.stack);
      Alert.alert('오류', `메모 수정에 실패했습니다: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        // 포커스 해제
        if (titleRef.current) {
          titleRef.current.blur();
        }
        if (contentRef.current) {
          contentRef.current.blur();
        }
      }}>
        <View style={styles.mainContainer}>
          {/* 제목 줄 */}
          
          <View style={styles.inputRow}>
            {isEditing ? (
              <TextInput
                ref={titleRef}
                style={styles.titleTextInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="제목을 입력하세요"
                returnKeyType="next"
              />
            ) : (
              <Text style={styles.titleText}>{memo.title || '제목 없음'}</Text>
            )}
          </View>
          
          {/* 시간|장소 */}
          <View style={styles.locationTimeRow}>
            <View style={styles.timeLocationContainer}>
              <Text style={styles.timeBox}>
                {formatDate(memo.createdAt)}
              </Text>
              <Text style={styles.locationBox} numberOfLines={1} ellipsizeMode="tail">
                {memo.location?.address || '위치 없음'}
              </Text>
            </View>
          </View>

          {/* 내용 */}
          <ScrollView 
            style={styles.contentInput}
            keyboardShouldPersistTaps="never"
            showsVerticalScrollIndicator={false}
          >
            {isEditing ? (
              <TextInput
                ref={contentRef}
                style={styles.contentTextInput}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
                placeholder="메모 내용을 입력하세요"
                returnKeyType="default"
                blurOnSubmit={false}
                textAlignVertical="top"
                scrollEnabled={true}
                autoCapitalize="sentences"
                autoCorrect={true}
                spellCheck={true}
              />
            ) : (
              <Text style={styles.contentText}>{memo?.content ?? '내용 없음'}</Text>
            )}
          </ScrollView>

          {/* 하단 버튼들 */}
          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={() => handlePublicStatusChange(!isPublic)} 
              disabled={isUpdating || !isEditing}
            >
              <View style={[styles.footerBtn, (isUpdating || !isEditing) && styles.disabledBtn]}>
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
                // 키보드 숨기기
                Keyboard.dismiss();
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: { 
    padding: 16,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationTimeRow: {
    marginBottom: 10,
  },
  timeLocationContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
  },
  timeBox: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  locationBox: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 4,
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
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
    height: 300,
  },
  contentText: {
    fontSize: 14,
    color: '#222',
  },
  contentTextInput: {
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
    minHeight: 250,
    maxHeight: 280,
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

