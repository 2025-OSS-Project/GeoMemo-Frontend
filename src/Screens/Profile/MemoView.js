import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { getMemoById, scrapMemo, unscrapMemo, getCurrentUserInfo, checkIsScraped, generatePresignedGetUrl } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeScreen from '../../utils/SafeScreen';

// Presigned URL을 사용하여 프로필 이미지를 표시하는 컴포넌트
const ProfileImageWithPresignedUrl = ({ profileUrl }) => {
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPresignedUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!profileUrl) {
        setError('프로필 URL이 없습니다.');
        return;
      }

      // AsyncStorage에서 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('사용자 토큰이 없습니다.');
        return;
      }

      const url = await generatePresignedGetUrl(profileUrl, userToken);
      setPresignedUrl(url);
    } catch (err) {
      console.error('Presigned URL 생성 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadPresignedUrl();
  }, [profileUrl]);

  if (isLoading) {
    return <ActivityIndicator size="small" color="#007AFF" />;
  }

  if (error || !presignedUrl) {
    return null; // 에러 시 기본 프로필 이미지 표시
  }

  return (
    <Image
      source={{ uri: presignedUrl }}
      style={styles.profileImage}
      resizeMode="cover"
      onError={(e) => console.log('이미지 로드 실패:', e.nativeEvent)}
      onLoad={() => console.log('이미지 로드 성공')}
    />
  );
};

export default function MemoView({ navigation, route }) {
  const [isScrapped, setIsScrapped] = useState(false);
  const [memo, setMemo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  
  // route.params에서 메모 데이터 가져오기
  const memoFromParams = route?.params?.memo;
  const memoId = route?.params?.memoId || memoFromParams?.memoId || memoFromParams?.id;
  
  // 응답/파라미터를 항상 "메모 객체"로 정규화
  const normalizeMemo = (obj) => (obj?.data ?? obj ?? null);
  
  console.log('=== MemoView memoId 추출 ===');
  console.log('route.params.memoId:', route?.params?.memoId);
  console.log('memoFromParams?.memoId:', memoFromParams?.memoId);
  console.log('memoFromParams?.id:', memoFromParams?.id);
  console.log('최종 memoId:', memoId);
  
  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const getMyUserId = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          // /api/auth/me API를 통해 현재 사용자 정보 가져오기
          const currentUserInfo = await getCurrentUserInfo(userToken);
          setMyUserId(currentUserInfo.user_id.toString());
        }
      } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
      }
    };
    
    getMyUserId();
  }, []);

  // 스크랩 상태 변화 추적
  useEffect(() => {
    console.log('🔄 isScrapped 상태 변경됨:', isScrapped);
  }, [isScrapped]);

  // 메모 데이터 가져오기
  useEffect(() => {
    const fetchMemoData = async () => {
      try {
        console.log('=== fetchMemoData 함수 시작 ===');
        console.log('memoId:', memoId);
        console.log('memoFromParams:', memoFromParams);
        
        setIsLoading(true);
        setError(null);
        
        // route.params에서 전달받은 메모 데이터가 있으면 먼저 사용
        if (memoFromParams) {
          console.log('✅ 전달받은 메모 데이터 사용:', memoFromParams);
          console.log('메모 데이터 키들:', Object.keys(memoFromParams));
          console.log('메모 데이터 상세:', {
            id: memoFromParams.id,
            memoId: memoFromParams.memoId,
            title: memoFromParams.title,
            content: memoFromParams.content,
            userId: memoFromParams.userId,
            userName: memoFromParams.userName,
            profileImage: memoFromParams.profileImage,
            createdAt: memoFromParams.createdAt,
            isPublic: memoFromParams.isPublic,
            // 위치 정보 추가
            lat: memoFromParams.lat,
            lng: memoFromParams.lng,
            address: memoFromParams.address,
            location: memoFromParams.location
          });
          
          // 1) 우선 화면에 바로 보여주기 (스켈레톤)
          const base = normalizeMemo(memoFromParams);
          setMemo(base);
          
          // 2) content 없으면 상세 호출로 보강
          const idForFetch = memoId || base?.memoId || base?.id;
          if (!base?.content && idForFetch) {
            console.log('content가 없어서 상세 API 호출로 보강');
            const userToken = await AsyncStorage.getItem('userToken');
            const detail = normalizeMemo(await getMemoById(idForFetch, userToken));
            if (detail) {
              console.log('상세 API로 content 보강 완료:', detail);
              setMemo(detail);
              // 스크랩 상태도 상세 기준으로 확인
              await checkScrapStatus(detail?.memoId || idForFetch);
            }
          } else {
            console.log('이미 content가 있어서 스크랩만 확인');
            // 이미 content가 있으면 스크랩만 확인
            await checkScrapStatus(base?.memoId || base?.id);
          }
          
          setIsLoading(false);
          return;
        }
        
        // 전달받은 메모 데이터가 없고 memoId가 있는 경우 API 호출
        if (!memoId) {
          console.error('❌ memoId가 없음');
          setError('메모 ID가 없습니다.');
          setIsLoading(false);
          return;
        }

        // 저장된 토큰 가져오기
        const userToken = await AsyncStorage.getItem('userToken');
        console.log('사용자 토큰 상태:', userToken ? '있음' : '없음');
        
        console.log('메모 상세 조회 시작:', { memoId, hasToken: !!userToken });
        
        // API 호출하여 메모 데이터 가져오기
        const response = await getMemoById(memoId, userToken);
        
        console.log('메모 상세 조회 API 응답:', response);
        
        // 여러 형태 분기 처리 → 정규화로 단순화
        const memoData = normalizeMemo(response);

        if (memoData) {
          console.log('✅ 메모 데이터 추출 성공:', memoData);
          console.log('메모 데이터 키들:', Object.keys(memoData));
          setMemo(memoData);
          // 스크랩 상태는 항상 API로 최신 상태 확인
          console.log('스크랩 상태 API로 확인 시작');
          const scrapMemoId = memoData.memoId || memoData.id;
          console.log('스크랩 상태 확인에 사용할 memoId:', scrapMemoId);
          await checkScrapStatus(scrapMemoId);
        } else {
          console.error('메모 데이터를 추출할 수 없음');
          setError('메모 데이터를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('메모 조회 중 오류 발생:', error);
        setError('메모를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemoData();
  }, [memoId, memoFromParams]);

  // 스크랩 상태 확인 함수
  const checkScrapStatus = async (memoId) => {
    try {
      console.log('=== 스크랩 상태 확인 시작 ===');
      console.log('확인할 메모 ID:', memoId);
      
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('토큰이 없어 스크랩 상태를 확인할 수 없습니다.');
        return;
      }

      console.log('API 호출 시작...');
      console.log('최종 API URL:', `https://dco69dhctdpt.cloudfront.net/api/memo/check-is-scraped/${memoId}`);
      const response = await checkIsScraped(memoId, userToken);
      console.log('스크랩 상태 확인 API 응답:', response);
      console.log('응답 타입:', typeof response);
      
             // API 응답에 따라 스크랩 상태 설정
       if (response && response.is_scraped !== undefined) {
         // { "is_scraped": true/false } 형태인 경우
         console.log('is_scraped 응답 처리:', response.is_scraped);
         console.log('is_scraped 타입:', typeof response.is_scraped);
         console.log('is_scraped 값:', response.is_scraped);
         
         // boolean 값으로 변환하여 설정
         const scrapStatus = Boolean(response.is_scraped);
         console.log('변환된 스크랩 상태:', scrapStatus);
         setIsScrapped(scrapStatus);
       } else if (response && typeof response === 'string') {
         // 문자열 응답인 경우 (예: "true", "false")
         console.log('문자열 응답 처리:', response);
         const newStatus = response.toLowerCase().trim() === 'true';
         console.log('새로운 스크랩 상태:', newStatus);
         setIsScrapped(newStatus);
       } else if (response && typeof response === 'boolean') {
         // 불린 응답인 경우
         console.log('불린 응답 처리:', response);
         setIsScrapped(response);
       } else if (response && response.data !== undefined) {
         // { data: boolean } 형태인 경우
         console.log('객체 응답 처리:', response.data);
         setIsScrapped(response.data);
       } else if (response && response.success !== undefined) {
         // { success: boolean } 형태인 경우
         console.log('success 응답 처리:', response.success);
         setIsScrapped(response.success);
       } else {
         console.log('예상치 못한 스크랩 상태 응답:', response);
         console.log('기본값 false로 설정');
         setIsScrapped(false);
       }
      
      console.log('=== 스크랩 상태 확인 완료 ===');
    } catch (error) {
      console.error('스크랩 상태 확인 실패:', error);
      // 에러가 발생해도 기본값으로 설정
      setIsScrapped(false);
    }
  };

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

      console.log('=== 스크랩 처리 시작 ===');
      console.log('현재 스크랩 상태:', isScrapped);
      console.log('처리할 메모 ID:', memoId);

      let response;
      
      if (isScrapped) {
        // 언스크랩
        console.log('언스크랩 처리 중...');
        response = await unscrapMemo(memoId, userToken);
        console.log('언스크랩 API 응답:', response);
        
        // API 응답 확인 (문자열 또는 객체)
        if (response && (response.success === true || response === 'true' || response === true)) {
          console.log('언스크랩 성공, 상태를 false로 변경');
          setIsScrapped(false);
          Alert.alert('성공', '메모가 스크랩에서 제거되었습니다.');
        } else {
          console.log('언스크랩 실패 또는 예상치 못한 응답:', response);
          Alert.alert('오류', '언스크랩 처리에 실패했습니다.');
        }
             } else {
         // 스크랩
         console.log('스크랩 처리 중...');
         response = await scrapMemo(memoId, userToken);
         console.log('스크랩 API 응답:', response);
         
         // API 응답 확인 (문자열 또는 객체)
         if (response && (response.success === true || response === 'true' || response === true)) {
           console.log('스크랩 성공, 상태를 true로 변경');
           setIsScrapped(true);
           Alert.alert('성공', '메모가 스크랩되었습니다.');
         } else {
           console.log('스크랩 실패 또는 예상치 못한 응답:', response);
           Alert.alert('오류', '스크랩 처리에 실패했습니다.');
         }
       }
       
       // 스크랩/언스크랩 처리 후 최신 상태 확인
       console.log('스크랩 처리 완료, 최신 상태 확인 시작');
       await checkScrapStatus(memoId);
      
    } catch (error) {
      console.error('스크랩 처리 중 오류:', error);
      Alert.alert('오류', `스크랩 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsScrapLoading(false);
    }
  };

  // 길찾기 함수 추가
  const handleNavigation = () => {
    // SlidePanel 데이터의 lat, lng 또는 기존 location 객체 사용
    const latitude = memo.location?.latitude || memo.lat;
    const longitude = memo.location?.longitude || memo.lng;
    
    if (!latitude || !longitude) {
      Alert.alert('위치 정보 없음', '이 메모에는 위치 정보가 없습니다.');
      return;
    }

    const address = memo.location?.address || '목적지';
    
    console.log('길찾기 시작:', { latitude, longitude, address });
    
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
      <SafeScreen>
        <StatusBar style="dark" translucent={true} />
        <View style={styles.container}>
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
      </SafeScreen>
    );
  }

  // 메모가 없을 때
  if (!memo) {
    return (
      <SafeScreen>
        <StatusBar style="dark" translucent={true} />
        <View style={styles.container}>
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
      </SafeScreen>
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
    <SafeScreen>
      <StatusBar style="dark" translucent={true} />
      <View style={styles.container}>
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
            <TouchableOpacity 
              onPress={() => {
                // 메모 작성자의 사용자 ID 추출 (여러 형태 지원)
                const memoUserId = memo.userId || memo.user?.userId || memo.userId;
                
                // 현재 사용자 ID와 비교
                if (memoUserId && myUserId) {
                  if (memoUserId.toString() === myUserId.toString()) {
                    // 내 메모인 경우 MyProfile로 이동
                    console.log('내 메모입니다. MyProfile로 이동');
                    navigation.navigate('MyProfile');
                  } else {
                    // 다른 사용자의 메모인 경우 OtherProfile로 이동
                    console.log('다른 사용자의 메모입니다. OtherProfile로 이동:', memoUserId);
                    navigation.navigate('OtherProfile', { userId: memoUserId });
                  }
                } else {
                  // 사용자 ID 정보가 부족한 경우
                  console.warn('사용자 ID 정보가 부족합니다. memoUserId:', memoUserId, 'myUserId:', myUserId);
                  Alert.alert('오류', '사용자 정보를 확인할 수 없습니다.');
                }
              }}
            >
              <View style={styles.profileCircle}>
                {memo.profileImage ? (
                  <ProfileImageWithPresignedUrl 
                    profileUrl={memo.profileImage} 
                  />
                ) : memo.user?.photoUrl ? (
                  <ProfileImageWithPresignedUrl 
                    profileUrl={memo.user.photoUrl} 
                  />
                ) : null}
              </View>
            </TouchableOpacity>
            
            {/* 유저 닉네임만 */}
            <View style={styles.nicknameContainer}>
              <Text style={styles.userNickname}>
                {memo.user?.username || memo.userName || memo.userNickname || '사용자'}
              </Text>
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
            <Text style={styles.contentText}>{memo?.content ?? '내용 없음'}</Text>
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
            <View style={styles.footerSpacer} />

            {memo.location?.address ? (
              <TouchableOpacity onPress={handleNavigation}>
                <View style={styles.footerBtn}>
                  <Ionicons name="navigate" size={24} color="black" />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </SafeScreen>
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});
