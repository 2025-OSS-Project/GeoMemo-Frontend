// components/RouteBox.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated, Linking, StyleSheet, Dimensions } from 'react-native';
import { Fontisto, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RouteBox({ routeSlideAnim, routePanResponder, destination }) {
  const openGoogleMapsToDestination = () => {
    if (!destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=walking`;
    Linking.openURL(url);
  };

  return (
    <Animated.View 
      style={[styles.routeBox, { left: routeSlideAnim }]} 
      {...routePanResponder.panHandlers}
    > 
      <View style={styles.handleBar} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="place" size={20} color="#666" />
          <Text style={styles.headerText}>오늘의 장소</Text>
        </View>
        
        <TouchableOpacity 
          onPress={openGoogleMapsToDestination} 
          style={[styles.navigateButton, !destination && styles.disabledButton]}
          disabled={!destination}
        >
          <Fontisto name="navigate" size={16} color="white" />
          <Text style={styles.navigateText}>길찾기</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  routeBox: {
    position: 'absolute',
    top: 180,
    width: width * 0.6,
    backgroundColor: 'white',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
  handleBar: {
    position: 'absolute',
    right: -3,
    top: '50%',
    transform: [{ translateY: -15 }],
    width: 6,
    height: 30,
    backgroundColor: '#ddd',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#333',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navigateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
