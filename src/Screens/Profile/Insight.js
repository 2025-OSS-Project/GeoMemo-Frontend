import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HomeButton from '../Main/HomeButton';

export default function Insight() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>인사이트 분석 결과가 여기에 표시됩니다.</Text>
      <HomeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#888',
  },
});
