 import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function OtherMemoList() {
  const dummyData = [0, 0, 0, 0]; // 실제 데이터 오기 전까지 placeholder

  const renderItem = ({ item }) => (
    <View style={styles.memoRow}>
      <View style={styles.circle}>
        <Text style={styles.circleText}>{item}</Text>
      </View>
      <View style={styles.memoBox} />
    </View>
  );

  return (
    <FlatList
      data={dummyData}
      keyExtractor={(item, index) => index.toString()}
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
});
