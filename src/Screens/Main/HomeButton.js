import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function HomeButton() {
  const navigation = useNavigation();
  const route = useRoute();

  const handleHomePress = useCallback(() => {
    // 현재 MemoMap 화면에 있다면 아무것도 하지 않음
    if (route.name === 'MemoMap') {
      return;
    }

    // 홈 화면으로 전환 시 애니메이션 최적화 및 즉시 위치 표시
    navigation.navigate('MemoMap', {
      screen: 'Home',
      params: {
        refreshLocation: true, // 위치 새로고침 플래그
        timestamp: Date.now(), // 캐시 방지
      }
    });
  }, [navigation, route.name]);

  return (
    <TouchableOpacity 
      style={[
        styles.homeButton, 
        route.name === 'MemoMap' && styles.homeButtonActive
      ]} 
      onPress={handleHomePress}
      activeOpacity={0.7}
      disabled={route.name === 'MemoMap'}
    >
      <Entypo 
        name="home" 
        size={24} 
        color={route.name === 'MemoMap' ? '#666' : '#000'} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
  homeButtonActive: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    elevation: 1,
  },
}); 