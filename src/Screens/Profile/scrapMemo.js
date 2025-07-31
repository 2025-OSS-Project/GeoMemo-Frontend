import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function ScrapMemo() {
  const dummyData = [1, 2, 3, 4];

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
      keyExtractor={(item) => item.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  memoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circleText: {
    color: '#fff',
    fontSize: 14,
  },
  memoBox: {
    flex: 1,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
});
