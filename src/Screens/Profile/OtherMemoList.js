import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMemos } from '../../config/api';

export default function OtherMemoList({ userId }) {
    const [memos, setMemos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    // 컴포넌트 마운트 시 해당 사용자의 메모 조회
    useEffect(() => {
        if (userId) {
            loadUserMemos();
        }
    }, [userId]);

    // 사용자 메모 로드
    const loadUserMemos = async () => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
            }

            // API를 통해 해당 사용자의 메모 조회
            const memoData = await getMemos(1, 20, userToken);
            if (memoData && memoData.data) {
                // 해당 사용자의 메모만 필터링 (실제로는 백엔드에서 필터링해야 함)
                const userMemos = memoData.data.filter(memo => memo.user_id === parseInt(userId));
                setMemos(userMemos);
            }
        } catch (error) {
            console.error('사용자 메모 로드 실패:', error);
            Alert.alert('오류', '메모를 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.memoRow}>
            <View style={styles.circle}>
                <Text style={styles.circleText}>{item.memo_id || 'M'}</Text>
            </View>
            <TouchableOpacity
                style={styles.memoBox}
                onPress={() => navigation.navigate('MemoView', { memoId: item.memo_id })}>
                <Text style={styles.memoText}>{item.content || '메모 내용'}</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6EE58F" />
                <Text style={styles.loadingText}>메모를 불러오는 중...</Text>
            </View>
        );
    }

    if (memos.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>표시할 메모가 없습니다.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={memos}
            keyExtractor={(item) => item.memo_id?.toString() || Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    memoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    circleText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    memoBox: {
        flex: 1,
        height: 50,
        backgroundColor: '#eee',
        borderRadius: 10,
    },
    memoText: {
        fontSize: 14,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});
