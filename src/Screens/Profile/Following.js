import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeButton from '../Main/HomeButton';

export default function Following() {
  const navigation = useNavigation();
  const followingData = [
    { id: '1', nickname: 'following_1' },
    { id: '2', nickname: 'following_2' },
    { id: '3', nickname: 'following_3' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.followRow}>
      <TouchableOpacity
        style={styles.profileCircle}
        onPress={() => navigation.navigate('OtherProfile')}
      >
        <Text style={styles.profileInitial}>0</Text>
      </TouchableOpacity>
      <Text style={styles.nickname}>{item.nickname}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={followingData}
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
  followRow: {
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
