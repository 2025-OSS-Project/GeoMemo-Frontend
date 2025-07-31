import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ThisMemo() {
    const navigation = useNavigation();

    const memos = [
        { id: 1, time: '10:00', title: '카페에서 메모', content: '라떼 맛있음', isPublic: true },
        { id: 2, time: '12:30', title: '공원', content: '날씨 맑음', isPublic: false },
    ];

    return (

        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddMemo')}>
                <Text style={styles.plus}>＋</Text>
            </TouchableOpacity>
            {memos.map((memo) => (
                <TouchableOpacity
                    key={memo.id}
                    style={styles.memoItem}
                    onPress={() => navigation.navigate('ThisMemoView', { memo })}
                >
                    <Text>{memo.time}</Text>
                    <Text>{memo.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { gap: 10 },
    memoItem: {
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 8,
    },
    addButton: {
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 8,
        marginBottom: 20,
    },
    plus: {
        fontSize: 24,
        color: '#333',
        marginBottom: 5,
    },
});