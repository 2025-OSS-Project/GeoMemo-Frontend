// components/MapSection.js
import React, { useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Text, StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MapSection({
  location,
  mapRef,
  memos,
  filter,
  myUser,
  followingIds,
  onMapRegionChange,
  onMapRegionChangeComplete, // 새로운 prop 추가
  onPressMemo,
  isLoadingMemos = false,
}) {
  const [selectedMarker, setSelectedMarker] = useState(null);

  if (!location) return null;

  // 백엔드에서 이미 필터링된 메모를 제공하므로 필터에 따른 색상만 적용
  const getMarkerColor = (memo) => {
    if (filter === 'me') return '#28a745'; // 초록색 (내 메모)
    if (filter === 'following') return '#007bff'; // 파란색 (팔로잉)
    if (filter === 'all') return '#ffc107'; // 노란색 (전체)
    return '#6c757d'; // 회색 (기본)
  };

  return (
    <>
      {/* 로딩 상태 표시 */}
      {isLoadingMemos && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>리스트를 후딱 가져오는 중...</Text>
        </View>
      )}
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        mapType="standard"
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        liteMode={false}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        maxZoomLevel={18}
        minZoomLevel={10}
        loadingEnabled={false}
        loadingBackgroundColor="transparent"
        loadingIndicatorColor="transparent"
        moveOnMarkerPress={false}
        rotateEnabled={false}
        pitchEnabled={false}
        userLocationUpdateInterval={8000}
        userLocationFastestInterval={3000}
        userLocationPriority="balanced"
        toolbarEnabled={false}
        zoomTapEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        onRegionChange={onMapRegionChange} // 실시간 위치 추적
        onRegionChangeComplete={onMapRegionChangeComplete} // 손을 뗐을 때 최종 위치
      >
      {/* 메모 마커 - 로딩 중이 아닐 때만 표시 */}
      {!isLoadingMemos && memos.map(memo => (
          <Marker
            key={memo.id}
            coordinate={{ latitude: memo.lat, longitude: memo.lng }}
            title={memo.title || memo.content}
            description={memo.userName ? `by ${memo.userName}` : ''}
            onPress={() => setSelectedMarker(memo.id)}
          >
                         <MaterialCommunityIcons 
               name={
                 filter === 'all' ? 'map-marker-question' :
                 filter === 'following' ? 'map-marker-account' :
                 filter === 'me' ? 'map-marker-check' : 'map-marker'
               }
               size={24} 
               color={getMarkerColor(memo)}
             />
            
            {/* 마커 클릭 시 상세 정보 표시 */}
            {selectedMarker === memo.id && (
              <Callout
                style={styles.callout}
                onPress={() => onPressMemo(memo)}
              >
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle} numberOfLines={2}>
                    {memo.title || memo.content}
                  </Text>
                  {memo.userName && (
                    <Text style={styles.calloutUserName}>
                      by {memo.userName}
                    </Text>
                  )}
                  <Text style={styles.calloutFilter}>
                    {filter === 'all' && '전체'}
                    {filter === 'following' && '팔로잉'}
                    {filter === 'me' && '내 메모'}
                  </Text>
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>
    </>
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
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutContent: {
    alignItems: 'center',
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  calloutUserName: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
  },
  calloutFilter: {
    fontSize: 12,
    color: '#6c757d',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});