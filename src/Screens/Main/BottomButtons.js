import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeButton from './HomeButton';
import SearchButton from '../Profile/SearchButton';
import FollowRequestButton from '../Profile/FollowRequestButton';

export default function BottomButtons() {
  return (
    <View style={styles.container}>
      <SearchButton />
      <HomeButton />
      <FollowRequestButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
