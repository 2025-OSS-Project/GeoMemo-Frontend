import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { getMemoById, scrapMemo, unscrapMemo } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MemoView({ navigation, route }) {
  const [isScrapped, setIsScrapped] = useState(false);
  const [memo, setMemo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  
  // route.params에서 메모 ID 가져오기
  const memoId = route?.params?.memoId || route?.params?.memo?.id;
  
  // 메모 데이터 가져오기
  useEffect(() => {
    const fetchMemoData = async () => {
      if (!memoId) {
        setError('메모 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // 저장된 토큰 가져오기
        const userToken = await AsyncStorage.getItem('userToken');
        
        console.log('메모 상세 조회 시작:', { memoId, hasToken: !!userToken });
        
        // API 호출하여 메모 데이터 가져오기
        const response = await getMemoById(memoId, userToken);
        
        if (response.success && response.data) {
          console.log('메모 데이터 조회 성공:', response.data);
          setMemo(response.data);
          // 메모의 스크랩 상태 설정 (백엔드에서 제공하는 경우)
          if (response.data.isScrapped !== undefined) {
            setIsScrapped(response.data.isScrapped);
          }
        } else {
          console.error('메모 데이터 조회 실패:', response);
          setError('메모를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('메모 조회 중 오류 발생:', error);
        setError('메모를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemoData();
  }, [memoId]);

  const handleScrap = async () => {
    if (isScrapLoading) return; // 이미 처리 중이면 무시
    
    try {
      setIsScrapLoading(true);
      
      // 저장된 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      let response;
      
      if (isScrapped) {
        // 언스크랩
        response = await unscrapMemo(memoId, userToken);
        if (response.success) {
          setIsScrapped(false);
          Alert.alert('성공', '메모가 스크랩에서 제거되었습니다.');
        }
      } else {
        // 스크랩
        response = await scrapMemo(memoId, userToken);
        if (response.success) {
          setIsScrapped(true);
          Alert.alert('성공', '메모가 스크랩되었습니다.');
        }
      }
      
    } catch (error) {
      console.error('스크랩 처리 중 오류:', error);
      Alert.alert('오류', `스크랩 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsScrapLoading(false);
    }
  };

  // 길찾기 함수 추가
  const handleNavigation = () => {
    if (!memo.location || !memo.location.latitude || !memo.location.longitude) {
      Alert.alert('위치 정보 없음', '이 메모에는 위치 정보가 없습니다.');
      return;
    }

    const { latitude, longitude } = memo.location;
    const address = memo.location.address || '목적지';
    
    // 구글맵스 앱으로 길찾기
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        // 구글맵스 앱이 없으면 웹브라우저로 열기
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
        return Linking.openURL(webUrl);
      }
    }).catch(err => {
      console.error('길찾기 앱 열기 실패:', err);
      Alert.alert('오류', '길찾기 앱을 열 수 없습니다.');
    });
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#fff" 
          translucent={false}
          animated={true}
        />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c757d" />
          <Text style={styles.loadingText}>메모를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#fff" 
          translucent={false}
          animated={true}
        />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 메모가 없을 때
  if (!memo) {
    return (
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#fff" 
          translucent={false}
          animated={true}
        />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text" size={48} color="#6c757d" />
          <Text style={styles.errorText}>메모를 찾을 수 없습니다.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
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

                 <TouchableOpacity onPress={handleScrap} disabled={isScrapLoading}>
           {isScrapLoading ? (
             <ActivityIndicator size="small" color="#6c757d" />
           ) : (
             isScrapped ? (
               <FontAwesome name="bookmark" size={24} color="#000000" />
             ) : (
               <FontAwesome name="bookmark-o" size={24} color="#6c757d" />
             )
           )}
         </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        {/* 제목 줄 */}
        <View style={styles.inputRow}>
          {/* 프로필 사진 */}
          <View style={styles.profileCircle}>
            {memo.user?.photoUrl ? (
              <Image source={{ uri: memo.user.photoUrl }} style={styles.profileImage} />
            ) : null}
          </View>
          
          {/* 유저 닉네임만 */}
          <View style={styles.nicknameContainer}>
            <Text style={styles.userNickname}>{memo.user?.username || '사용자'}</Text>
          </View>
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
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.contentTitle}>{memo.title || '제목 없음'}</Text>
          <Text style={styles.contentText}>{memo.content}</Text>
        </ScrollView>

        {/* 메모 정보 */}
        <View style={styles.memoInfoSection}>
          <View style={styles.memoInfoContainer}>
            <Text style={styles.memoInfoItem}>
              생성일: {formatDate(memo.createdAt)}
            </Text>
            {memo.updatedAt && memo.updatedAt !== memo.createdAt && (
              <Text style={styles.memoInfoItem}>
                수정일: {formatDate(memo.updatedAt)}
              </Text>
            )}
            <Text style={styles.memoInfoItem}>
              공개 여부: {memo.isPublic ? '공개' : '비공개'}
            </Text>
          </View>
        </View>

        {/* 하단 버튼들 */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <View style={styles.footerBtn}>
              <AntDesign name="link" size={24} color="black" />
            </View>
          </TouchableOpacity>

          <View style={styles.footerSpacer} />

          {memo.location && (
            <TouchableOpacity onPress={handleNavigation}>
              <View style={styles.footerBtn}>
                <Ionicons name="navigate" size={24} color="black" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainContainer: { 
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
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
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  userNickname: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  titleContainer: {
    marginLeft: 10,
  },
  titleLocationContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    flex: 1,
  },
  contentInput: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
    height: '50%',
  },
  contentText: {
    fontSize: 14,
    color: '#222',
  },
  memoInfoSection: {
    marginBottom: 10,
  },
  memoInfoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
  },
  memoInfoItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
  footerSpacer: {
    width: 10, // 버튼 사이의 간격
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileText: {
    fontSize: 32,
    color: '#333',
  },
  nicknameContainer: {
    marginLeft: 10,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'normal',
    marginBottom: 15,
    color: '#333',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});
