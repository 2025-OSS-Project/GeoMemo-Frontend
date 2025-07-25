// components/RouteBox.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated, Linking } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { styles } from './styles';

export default function RouteBox({ routeSlideAnim, destination }) {
  const openGoogleMapsToDestination = () => {
    if (!destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=walking`;
    Linking.openURL(url);
  };

  return (
    <Animated.View style={[styles.routeBox, { left: routeSlideAnim }]}> 
      <TouchableOpacity onPress={openGoogleMapsToDestination} style={styles.routeButton}>
        <Fontisto name="navigate" size={20} color="black" />
      </TouchableOpacity>
      <Text style={styles.routeText}>오늘의 장소 추천</Text>
    </Animated.View>
  );
}
