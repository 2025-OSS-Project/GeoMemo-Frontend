import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeButton from '../Main/HomeButton';
import BottomButtons from '../Main/BottomButtons';
import { getFollowersList, defollowUser } from '../../config/api';

const Follower = forwardRef(({ onDataUpdate, otherUserId, onDataChange }, ref) => {
    const navigation = useNavigation();
    const [followersData, setFollowersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    console.log('=== Follower 컴포넌트 ===');
    console.log('otherUserId:', otherUserId);
    console.log('otherUserId 타입:', typeof otherUserId);
    console.log('onDataChange prop:', onDataChange);

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

    // 팔로워 목록 가져오기 (새로운 API 엔드포인트 사용)
    const fetchFollowersList = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
            }

            const response = await getFollowersList(token);
            console.log('팔로워 API 응답:', response);
            
            // 새로운 API 응답 구조에 맞춰 데이터 추출
            if (response && response.success && response.data && response.data.users) {
                const users = response.data.users;
                console.log('추출된 팔로워 데이터:', users);
                
                // API에서 받은 데이터를 그대로 사용
                setFollowersData(users);
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
                            await fetchFollowersList();
                            
                            // 부모 컴포넌트에 데이터 변경 알림
                            if (onDataChange && typeof onDataChange === 'function') {
                                console.log('✅ 팔로워 데이터 변경 알림 전송');
                                onDataChange();
                            }
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
        // API에서 받은 데이터를 그대로 사용
        const userId = item.userId;
        const nickname = item.nickname;
        const status = item.status;
        const profileImageUrl = item.profileImageUrl;
        
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

                <TouchableOpacity
                    style={styles.defollowButton}
                    onPress={() => handleDefollow(userId, nickname)}
                >
                    <Text style={styles.defollowButtonText}>Remove</Text>
                </TouchableOpacity>
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
                    const userId = item?.userId;
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
        gap: 12,
        paddingTop: 12,
        paddingBottom: 100,
    },
    followerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#fff',
    },
    profileCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    username: {
        fontSize: 15,
        fontWeight: '600',
        color: '#262626',
        marginBottom: 2,
    },
    defollowButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        backgroundColor: '#FF3B30',
        minWidth: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    defollowButtonText: {
        color: '#fff',
        fontSize: 11,
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
        fontSize: 11,
        marginTop: 2,
    },
    approvedStatus: {
        color: '#0095F6',
    },
    pendingStatus: {
        color: '#FF3B30',
    },
});
