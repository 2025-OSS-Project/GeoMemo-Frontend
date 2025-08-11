import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMemos } from '../../config/api';
import { AntDesign } from '@expo/vector-icons';

export default function ThisMemo() {
    const navigation = useNavigation();
    const [memos, setMemos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 메모 목록 가져오기 (me 필터 적용)
    const fetchMemos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // 저장된 토큰 가져오기
            const userToken = await AsyncStorage.getItem('userToken');
            const result = await getAllMemos(userToken, 'me'); // me 필터 적용
            
            if (result.success && result.data) {
                setMemos(result.data);
            } else {
                setError('내 메모 목록을 가져올 수 없습니다.');
            }
        } catch (error) {
            setError(`내 메모 목록 조회 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 메모 목록 가져오기
    useEffect(() => {
        fetchMemos();
    }, []);

    // 화면이 포커스될 때마다 메모 목록 새로고침
    useFocusEffect(
        React.useCallback(() => {
            fetchMemos();
        }, [])
    );

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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>내 메모 목록을 불러오는 중...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchMemos}>
                    <AntDesign name="reload1" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* AddMemo 버튼을 위에 고정 */}
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddMemo')}>
                <Text style={styles.plus}>＋</Text>
            </TouchableOpacity>
            
            {/* 메모 목록만 스크롤 */}
            <ScrollView contentContainerStyle={styles.memoList}>
                {memos.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>내 메모가 없습니다</Text>
                    </View>
                ) : (
                    memos.map((memo) => (
                        <TouchableOpacity
                            key={memo.memoId}
                            style={styles.memoItem}
                            onPress={() => navigation.navigate('ThisMemoView', { memo })}
                        >
                            <Text style={styles.title}>
                                {memo.title || '제목 없음'}
                            </Text>
                            <View style={styles.timeLocationContainer}>
                                <Text style={styles.timeText}>
                                    {formatDate(memo.createdAt)}
                                </Text>
                                <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                                    {memo.location?.address || '위치 없음'}
                                </Text>
                            </View>
                            <Text style={styles.content} numberOfLines={2}>
                                {memo.content}
                            </Text>
                            <Text style={styles.publicStatus}>
                                {memo.isPublic ? '공개' : '비공개'}
                            </Text>
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
        backgroundColor: '#eee',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    timeLocationContainer: {
        marginBottom: 4,
    },
    timeText: {
        fontSize: 11,
        color: '#999',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    location: {
        fontSize: 12,
        color: '#888',
    },
    content: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    publicStatus: {
        fontSize: 10,
        color: '#007AFF',
        fontWeight: 'bold',
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
        padding: 10,
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
    addButton: {
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 12,
        marginBottom: 15,
        marginHorizontal: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    plus: {
        fontSize: 18,
        color: '#888',
        fontWeight: '500',
    },
});