import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePresignedGetUrl } from '../../config/api';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

// ProfileImageWithPresignedUrl 컴포넌트 추가
const ProfileImageWithPresignedUrl = ({ profileUrl, style }) => {
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPresignedUrl = async () => {
    if (!profileUrl) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(false);
      const userToken = await AsyncStorage.getItem('userToken');
      const url = await generatePresignedGetUrl(profileUrl, userToken);
      setPresignedUrl(url);
    } catch (err) {
      console.error('프로필 이미지 presigned URL 로드 실패:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPresignedUrl();
  }, [profileUrl]);

  if (isLoading) {
    return <View style={[style, { backgroundColor: '#ccc' }]} />;
  }

  if (error || !presignedUrl) {
    return (
      <View style={[style, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="account" size={style.width ? style.width * 0.5 : 16} color="#999" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: presignedUrl }}
      style={style}
      onError={(e) => console.log('🖼️ 이미지 로드 실패:', e.nativeEvent)}
      onLoad={() => console.log('🖼️ 이미지 로드 성공')}
    />
  );
};

export default function OtherMemoList({ userId }) {
    const [memos, setMemos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    // 컴포넌트 마운트 시 해당 사용자의 메모 조회
    useEffect(() => {
        console.log('=== OtherMemoList 컴포넌트 마운트 ===');
        console.log('전달받은 userId:', userId);
        console.log('userId 타입:', typeof userId);
        console.log('userId 값 검증:', userId ? '유효함' : '유효하지 않음');
        
        if (userId) {
            loadUserMemos();
        } else {
            console.error('❌ userId가 없어서 메모를 로드할 수 없음');
            setError('사용자 ID가 필요합니다.');
        }
    }, [userId]);

    // 사용자 메모 로드 - 직접 API 호출
    const loadUserMemos = async () => {
        console.log('=== loadUserMemos 함수 시작 ===');
        console.log('함수 내부에서 사용할 userId:', userId);
        console.log('userId 타입:', typeof userId);
        console.log('userId 값 검증:', userId ? '유효함' : '유효하지 않음');
        console.log('userId === null:', userId === null);
        console.log('userId === undefined:', userId === undefined);
        console.log('userId === 0:', userId === 0);
        console.log('userId === "0":', userId === "0");
        
        try {
            setIsLoading(true);
            setError(null);
            
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                throw new Error('로그인이 필요합니다.');
            }

            // 직접 API 호출: /api/memo/user/{user_id}
            const apiUrl = `https://dco69dhctdpt.cloudfront.net/api/memo/user/${userId}`;
            console.log('=== API 호출 시작 ===');
            console.log('API URL:', apiUrl);
            console.log('전달할 userToken:', userToken ? userToken.substring(0, 20) + '...' : '없음');
            console.log('최종 API URL 구성:', {
                baseUrl: 'https://dco69dhctdpt.cloudfront.net/api/memo/',
                userId: userId,
                fullUrl: apiUrl
            });
            
            // API 경로와 파라미터 상세 로깅
            console.log('=== API 경로 및 파라미터 상세 분석 ===');
            console.log('1. 기본 URL:', 'https://dco69dhctdpt.cloudfront.net');
            console.log('2. API 엔드포인트:', '/api/memo/user/');
            console.log('3. 경로 파라미터 user_id:', userId);
            console.log('4. 최종 완성된 URL:', apiUrl);
            console.log('5. URL 구성 방식:', `baseUrl + userId = ${'https://dco69dhctdpt.cloudfront.net/api/memo/user/'} + ${userId}`);
            console.log('6. HTTP 메서드:', 'GET');
            console.log('7. 요청 헤더:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken ? userToken.substring(0, 20) + '...' : '없음'}`
            });
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });
            
            console.log('=== API 응답 분석 ===');
            console.log('HTTP 상태 코드:', response.status);
            console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                
                try {
                    const errorData = await response.json();
                    console.error('서버 에러 응답:', errorData);
                    
                    // 422 Validation Error 처리 (이미지에 표시된 형태)
                    if (response.status === 422 && errorData.detail) {
                        if (Array.isArray(errorData.detail)) {
                            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
                        } else {
                            errorMessage = errorData.detail;
                        }
                    } else {
                        errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
                    }
                } catch (parseError) {
                    // JSON 파싱 실패 시 텍스트로 읽기
                    try {
                        const errorText = await response.text();
                        console.error('서버 텍스트 응답:', errorText);
                        errorMessage = `Server response: ${errorText}`;
                    } catch (textError) {
                        errorMessage = `HTTP error! status: ${response.status}`;
                    }
                }
                
                // "메모를 찾을 수 없습니다" 에러를 적절히 처리
                if (errorMessage.includes('메모를 찾을 수 없습니다')) {
                    console.log('📝 해당 사용자의 메모가 없음');
                    setMemos([]);
                    setIsLoading(false);
                    return;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('=== API 응답 상세 분석 ===');
            console.log('API 응답 전체:', result);
            console.log('응답 타입:', typeof result);
            console.log('응답 구조:', {
                success: result?.success,
                hasData: !!result?.data,
                dataIsArray: result?.data ? Array.isArray(result.data) : 'N/A',
                dataLength: result?.data?.length || 0,
                error: result?.error
            });
            
            // 새로운 API 응답 구조 분석
            if (result.success && Array.isArray(result.data)) {
                console.log('✅ API 응답 성공 - data 배열에서 메모 추출');
                console.log('응답 구조:', {
                    success: result.success,
                    dataLength: result.data.length,
                    hasError: !!result.error
                });
                
                if (result.data.length > 0) {
                    const firstMemo = result.data[0];
                    console.log('첫 번째 메모 객체:', firstMemo);
                    console.log('memoId 필드:', firstMemo.memoId, '타입:', typeof firstMemo.memoId);
                    console.log('title 필드:', firstMemo.title, '타입:', typeof firstMemo.title);
                    console.log('content 필드:', firstMemo.content, '타입:', typeof firstMemo.content);
                    console.log('createdAt 필드:', firstMemo.createdAt, '타입:', typeof firstMemo.createdAt);
                    console.log('updatedAt 필드:', firstMemo.updatedAt, '타입:', typeof firstMemo.updatedAt);
                    console.log('isPublic 필드:', firstMemo.isPublic, '타입:', typeof firstMemo.isPublic);
                    console.log('fileUrl 필드:', firstMemo.fileUrl, '타입:', typeof firstMemo.fileUrl, '배열인가?', Array.isArray(firstMemo.fileUrl));
                    
                    if (firstMemo.location) {
                        console.log('location 객체 분석:');
                        console.log('  - name:', firstMemo.location.name);
                        console.log('  - latitude:', firstMemo.location.latitude);
                        console.log('  - longitude:', firstMemo.location.longitude);
                        console.log('  - address:', firstMemo.location.address);
                        console.log('  - category:', firstMemo.location.category);
                    }
                    
                    if (firstMemo.user) {
                        console.log('user 객체 분석:');
                        console.log('  - userId:', firstMemo.user.userId);
                        console.log('  - username:', firstMemo.user.username);
                        console.log('  - photoUrl:', firstMemo.user.photoUrl);
                    }
                } else {
                    console.log('📝 data 배열이 비어있음 (메모가 없음)');
                }
            } else {
                console.log('❌ 예상치 못한 응답 구조:', result);
                console.log('응답 구조 분석:', {
                    keys: Object.keys(result || {}),
                    success: result?.success,
                    hasData: !!result?.data,
                    dataIsArray: result?.data ? Array.isArray(result.data) : 'N/A',
                    error: result?.error
                });
                
                if (result?.error) {
                    console.log('⚠️ API 에러 응답:', result.error);
                }
            }
            
            let memoData = [];
            
            // 새로운 API 응답 구조에 맞게 처리
            if (result.success && Array.isArray(result.data)) {
                memoData = result.data;
                console.log('✅ API에서 메모 데이터 추출 성공:', memoData.length);
            } else {
                console.error('❌ 예상치 못한 응답 구조:', result);
                setError('메모 목록을 가져올 수 없습니다. 응답 구조가 올바르지 않습니다.');
                return;
            }
            
            // 메모 데이터가 있는 경우에만 필터링
            if (memoData.length > 0) {
                // 필터링 없이 모든 메모를 그대로 표시
                setMemos(memoData);
                console.log('=== 메모 데이터 설정 완료 ===');
                console.log('전체 메모 수:', memoData.length);
                console.log('메모 목록:', memoData.map(m => ({ id: m.memoId, title: m.title, isPublic: m.isPublic })));
            } else {
                setMemos([]);
                console.log('📝 메모 데이터가 없음');
            }
        } catch (error) {
            console.error('사용자 메모 로드 실패:', error);
            setError(`메모를 불러올 수 없습니다: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 메모 날짜 포맷팅
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>메모를 불러오는 중...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadUserMemos}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 메모 목록만 스크롤 */}
            <ScrollView contentContainerStyle={styles.memoList}>
                {memos.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>메모가 없습니다</Text>
                    </View>
                ) : (
                    memos.map((memo) => (
                        <TouchableOpacity
                            key={memo.memoId}
                            style={styles.memoItem}
                            onPress={() => {
                                console.log('메모 클릭됨:', { 
                                    memoId: memo.memoId, 
                                    title: memo.title,
                                    hasMemoData: !!memo 
                                });
                                // memoId를 명시적으로 전달
                                navigation.navigate('MemoView', { 
                                    memo: memo,
                                    memoId: memo.memoId 
                                });
                            }}
                        >
                            {/* 사용자 정보 표시 */}
                            {memo.user && (
                                <View style={styles.userInfoContainer}>
                                    {memo.user.photoUrl ? (
                                        <ProfileImageWithPresignedUrl
                                            profileUrl={memo.user.photoUrl}
                                            style={styles.userPhoto}
                                        />
                                    ) : (
                                        <View style={styles.userPhotoPlaceholder}>
                                            <AntDesign name="user" size={16} color="#999" />
                                        </View>
                                    )}
                                    <Text style={styles.username}>{memo.user.username || '사용자'}</Text>
                                </View>
                            )}
                            
                            <Text style={styles.title}>
                                {memo.title || '제목 없음'}
                            </Text>
                            

                            

                            
                            <View style={styles.bottomInfo}>
                                <Text style={styles.publicStatus}>
                                    {memo.isPublic ? '공개' : '비공개'}
                                </Text>
                                {memo.location && memo.location.category && (
                                    <Text style={styles.categoryText}>
                                        {memo.location.category}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    memoList: {
        gap: 10,
        paddingBottom: 20,
    },
    memoItem: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        marginHorizontal: 10,
        marginVertical: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userPhoto: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 6,
    },
    userPhotoPlaceholder: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    username: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    content: {
        fontSize: 12,
        color: '#555',
        marginBottom: 4,
    },

    bottomInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    publicStatus: {
        fontSize: 8,
        color: '#007AFF',
        fontWeight: '600',
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    categoryText: {
        fontSize: 8,
        color: '#666',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
    },
});
