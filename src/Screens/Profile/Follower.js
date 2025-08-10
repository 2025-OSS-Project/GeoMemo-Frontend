import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeButton from '../Main/HomeButton';

export default function Follower() {
    const navigation = useNavigation();
    const followerData = []; // API에서 받아온 데이터로 교체 예정

    const renderItem = ({ item }) => (
        <View style={styles.followerRow}>
            <TouchableOpacity style={styles.profileCircle} onPress={() => navigation.navigate('OtherProfile')}>
                <Text style={styles.profileInitial}>0</Text>
            </TouchableOpacity>
            <Text style={styles.nickname}>{item.nickname}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={followerData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
            <HomeButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    listContainer: {
        gap: 16,
    },
    followerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    profileCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        color: '#fff',
        fontSize: 14,
    },
    nickname: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
});
