import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ScrapMemo() {
  const navigation = useNavigation();

  const dummyData = [1, 2, 3, 4];

  const renderItem = ({ item }) => (
    <View style={styles.memoRow}>
      <TouchableOpacity
        style={styles.circle}
        onPress={() => navigation.navigate('OtherProfile')}
      >
        <Text style={styles.circleText}>{item}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
      style={styles.memoBox} 
      onPress={() => navigation.navigate('MemoView')}>
      </TouchableOpacity>
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
