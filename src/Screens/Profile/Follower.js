import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeButton from '../Main/HomeButton';
import { getFollowersList, acceptFollowRequest, declineFollowRequest, defollowUser } from '../../config/api';

const Follower = forwardRef(({ onDataUpdate }, ref) => {
    const navigation = useNavigation();
    const [followersData, setFollowersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 부모 컴포넌트에 데이터 개수 전달
    useEffect(() => {
        if (onDataUpdate && typeof onDataUpdate === 'function') {
            const count = Array.isArray(followersData) ? followersData.length : 0;
            console.log('팔로워 데이터 길이:', count, '데이터 타입:', typeof followersData);
            onDataUpdate(count);
        }
    }, [followersData, onDataUpdate]);

    // 부모 컴포넌트에서 호출할 수 있는 메서드들
    useImperativeHandle(ref, () => ({
        refresh: fetchFollowersList,
        getData: () => followersData
    }));

    // 팔로워 목록 가져오기
    const fetchFollowersList = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
            }

            const response = await getFollowersList(token);
            console.log('팔로워 API 응답:', response);
            
            if (response && response.data) {
                let users = [];
                
                // 응답 구조에 따라 데이터 추출
                if (response.data.users && Array.isArray(response.data.users)) {
                    users = response.data.users;
                } else if (Array.isArray(response.data)) {
                    users = response.data;
                } else if (response.success && response.data.users) {
                    users = response.data.users;
                }
                
                console.log('추출된 팔로워 데이터:', users);
                
                // 데이터 유효성 검사 및 필터링
                const validUsers = users.filter(user => {
                    if (!user || typeof user !== 'object') {
                        console.log('유효하지 않은 사용자 객체:', user);
                        return false;
                    }
                    
                    // nickname은 필수, id나 user_id가 없으면 email을 식별자로 사용
                    const hasRequiredFields = user.nickname && (user.id || user.user_id || user.email);
                    if (!hasRequiredFields) {
                        console.log('필수 필드가 누락된 사용자:', user);
                        return false;
                    }
                    
                    return true;
                });
                
                console.log('유효한 팔로워 데이터:', validUsers);
                setFollowersData(validUsers);
            } else {
                console.log('팔로워 데이터 없음 또는 실패');
                setFollowersData([]);
            }
        } catch (error) {
            console.error('팔로워 목록 조회 실패:', error);
            Alert.alert('오류', '팔로워 목록을 가져오는데 실패했습니다.');
            setFollowersData([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 팔로우 요청 승인 처리
    const handleAccept = async (userId, nickname) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
            }

            await acceptFollowRequest(userId, token);
            Alert.alert('성공', `${nickname}님의 팔로우 요청을 승인했습니다.`);
            // 목록 새로고침
            fetchFollowersList();
        } catch (error) {
            console.error('팔로우 요청 승인 실패:', error);
            Alert.alert('오류', '팔로우 요청 승인에 실패했습니다.');
        }
    };

    // 팔로우 요청 거절 처리
    const handleDecline = async (userId, nickname) => {
        Alert.alert(
            '팔로우 요청 거절',
            `${nickname}님의 팔로우 요청을 거절하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '거절',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (!token) {
                                Alert.alert('오류', '로그인이 필요합니다.');
                                return;
                            }

                            await declineFollowRequest(userId, token);
                            Alert.alert('성공', '팔로우 요청을 거절했습니다.');
                            // 목록 새로고침
                            fetchFollowersList();
                        } catch (error) {
                            console.error('팔로우 요청 거절 실패:', error);
                            Alert.alert('오류', '팔로우 요청 거절에 실패했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // 팔로우 끊기 처리
    const handleDefollow = async (userId, nickname) => {
        Alert.alert(
            '팔로우 끊기',
            `${nickname}님과의 팔로우를 끊으시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '팔로우 끊기',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (!token) {
                                Alert.alert('오류', '로그인이 필요합니다.');
                                return;
                            }

                            await defollowUser(userId, token);
                            Alert.alert('성공', '팔로우를 끊었습니다.');
                            // 목록 새로고침
                            fetchFollowersList();
                        } catch (error) {
                            console.error('팔로우 끊기 실패:', error);
                            Alert.alert('오류', '팔로우 끊기에 실패했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // 화면 포커스 시 데이터 새로고침
    useFocusEffect(
        React.useCallback(() => {
            fetchFollowersList();
        }, [])
    );

    // 새로고침 처리
    const onRefresh = () => {
        setRefreshing(true);
        fetchFollowersList();
    };

    const renderItem = ({ item }) => {
        // 데이터 유효성 검사 개선
        if (!item || typeof item !== 'object') {
            console.log('유효하지 않은 팔로워 아이템 (타입 오류):', item);
            return null;
        }

        // 필수 필드 확인 - id가 없으면 email을 식별자로 사용
        const userId = item.id || item.user_id || item.email;
        const nickname = item.nickname;
        const email = item.email;
        const status = item.status;
        const profileImageUrl = item.profileImageUrl;

        if (!userId || !nickname) {
            console.log('필수 필드가 누락된 팔로워 아이템:', item);
            return null;
        }
        
        return (
            <View style={styles.followerRow}>
                                 <TouchableOpacity
                     style={styles.profileCircle}
                     onPress={() => navigation.navigate('OtherProfile', { userId: userId })}
                 >
                     {profileImageUrl ? (
                         <Image 
                             source={{ uri: profileImageUrl }} 
                             style={styles.profileImage}
                             resizeMode="cover"
                         />
                     ) : null}
                 </TouchableOpacity>
                
                                 <View style={styles.userInfo}>
                     <Text style={styles.username}>{nickname}</Text>
                     {status && (
                         <Text style={[styles.statusText, 
                             status === 'approved' ? styles.approvedStatus : styles.pendingStatus
                         ]}>
                             {status === 'approved' ? '팔로워' : '승인 대기중'}
                         </Text>
                     )}
                 </View>

                <View style={styles.buttonContainer}>
                    {status === 'approved' ? (
                        // 승인된 팔로워: 팔로우 끊기 버튼
                                                 <TouchableOpacity
                             style={styles.defollowButton}
                             onPress={() => handleDefollow(userId, nickname)}
                         >
                             <Text style={styles.defollowButtonText}>Remove</Text>
                         </TouchableOpacity>
                    ) : (
                        // 승인 대기중: 승인/거절 버튼
                        <>
                                                         <TouchableOpacity
                                 style={styles.acceptButton}
                                 onPress={() => handleAccept(userId, nickname)}
                             >
                                 <Text style={styles.acceptButtonText}>Accept</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                 style={styles.declineButton}
                                 onPress={() => handleDecline(userId, nickname)}
                             >
                                 <Text style={styles.declineButtonText}>Decline</Text>
                             </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#333" />
                    <Text style={styles.loadingText}>팔로워 목록을 불러오는 중...</Text>
                </View>
                <HomeButton />
            </View>
        );
    }

    return (
        <View style={styles.container}>
                    <FlatList
                data={followersData}
                keyExtractor={(item, index) => {
                    const userId = item?.id || item?.user_id || item?.email;
                    return userId ? userId.toString() : `follower-${index}`;
                }}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>팔로워가 없습니다.</Text>
                        <Text style={styles.emptySubText}>새로운 팔로워가 생기면 여기에 표시됩니다.</Text>
                    </View>
                }
            />
        </View>
    );
});

export default Follower;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    listContainer: {
        gap: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
         followerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#fff',
    },
    profileCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    profileInitial: {
        color: '#666',
        fontSize: 18,
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#262626',
        marginBottom: 4,
    },
    email: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    acceptButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#0095F6',
        minWidth: 70,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    declineButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#8E8E93',
        minWidth: 70,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    declineButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    defollowButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#FF3B30',
        minWidth: 60,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    defollowButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    statusText: {
        fontSize: 12,
        marginTop: 4,
    },
    approvedStatus: {
        color: '#0095F6',
    },
    pendingStatus: {
        color: '#FF3B30',
    },
});
