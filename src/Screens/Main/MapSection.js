// components/MapSection.js
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
      style={styles.map}
      provider="google"
      mapType="standard"
      showsUserLocation={true}
      showsMyLocationButton={false}
      showsCompass={false}
      showsBuildings={true} // 건물 표시 활성화
      showsTraffic={false}
      showsIndoors={false} // true → false로 변경하여 렌더링 부하 감소
      showsPointsOfInterest={false} // true → false로 변경하여 렌더링 부하 감소
      liteMode={false}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      // 지도 성능 극대화
      maxZoomLevel={18} // 20 → 18로 감소하여 렌더링 부하 감소
      minZoomLevel={10}
      // 지도 로딩 최적화
      loadingEnabled={false}
      loadingBackgroundColor="transparent"
      loadingIndicatorColor="transparent"
      // 지도 렌더링 최적화
      moveOnMarkerPress={false}
      rotateEnabled={false}
      pitchEnabled={false}
      // 사용자 위치 최적화 (정확도와 성능 균형)
      userLocationUpdateInterval={8000} // 5초 → 8초로 조정하여 정확도 향상
      userLocationFastestInterval={3000} // 2초 → 3초로 조정하여 정확도 향상
      userLocationPriority="balanced" // high → balanced로 변경하여 정확도와 성능 균형
      // 추가 성능 최적화
      toolbarEnabled={false}
      zoomTapEnabled={false}
      scrollEnabled={true}
      zoomEnabled={true}
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

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
});