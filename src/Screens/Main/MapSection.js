// components/MapSection.js
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Text } from 'react-native';

export default function MapSection({
  location,
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
      provider="google"
      mapType="standard"
      showsUserLocation={true}
      showsMyLocationButton={false}
      showsCompass={false}
      showsBuildings={true}
      showsTraffic={false}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* 메모 마커 */}
      {memos
        .filter(memo => {
          if (filter === 'all') return true;
          if (filter === 'me') return memo.userId === myUser?.id;
          if (filter === 'following') return followingIds.includes(memo.userId);
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