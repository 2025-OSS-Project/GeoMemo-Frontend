import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.homeButton} 
      onPress={() => navigation.navigate('MemoMap')}
      activeOpacity={0.8}
    >
      <Entypo name="home" size={24} color="black" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
}); 