import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SearchButton({ style }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={[styles.searchButton, style]} 
      onPress={() => navigation.navigate('UserSearch')}
      activeOpacity={0.8}
    >
      <Fontisto name="search" size={24} color="black" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
