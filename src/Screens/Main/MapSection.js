// components/MapSection.js
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MapSection({
  location,
  heading,
  mapRef,
  memos,
  filter,
  myUser,
  followingIds,
}) {
  if (!location) return null;

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* 내 방향 마커 */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <Animated.View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <MaterialCommunityIcons name="navigation" size={20} color="#6ad86aff" />
        </Animated.View>
      </Marker>

      {/* 메모 마커 */}
      {memos
        .filter(memo => {
          if (filter === 'all') return true;
          if (filter === 'me') return memo.userId === myUser?.id;
          if (filter === 'following') return followingIds.includes(memo.userId);
          if (filter === 'mine') return memo.userId === myUser?.id;
          return true;
        })
        .map(memo => (
          <Marker
            key={memo.id}
            coordinate={{ latitude: memo.lat, longitude: memo.lng }}
            title={memo.title}
            description={memo.text}
          >
            <Text style={{ fontSize: 20 }}>📝</Text>
          </Marker>
        ))}
    </MapView>
  );
}