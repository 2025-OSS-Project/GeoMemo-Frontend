// components/RouteBox.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ActivityIndicator, Linking, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RouteBox = ({ routeSlideAnim, routePanResponder, destination, isLoadingDestination, recommendations, isLoadingRecommendations }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // RouteBox 표시/숨김 상태



  const handleDirections = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // RouteBox가 숨겨져 있으면 null 반환
  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.showButton}
        onPress={toggleVisibility}
      >
        <FontAwesome6 name="map-location-dot" size={20} color="white" />
      </TouchableOpacity>
    );
  }

  if (isLoadingDestination) {
    return (
      <Animated.View 
        style={[styles.routeBox, { left: routeSlideAnim }]} 
        {...routePanResponder.panHandlers}
      >
        <View style={styles.handleBar} />
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>추천 장소 찾는 중...</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[styles.routeBox, { left: routeSlideAnim }]} 
      {...routePanResponder.panHandlers}
    >
      <View style={styles.handleBar} />

      <View style={styles.content}>
        <View style={styles.header}>
          <FontAwesome6 name="map-location-dot" size={20} color="#333" />
          <Text style={styles.headerText}>오늘의 장소</Text>
          <TouchableOpacity onPress={toggleVisibility} style={styles.closeButton}>
            <AntDesign name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* 드롭다운 버튼 */}
        <TouchableOpacity onPress={toggleExpanded} style={styles.dropdownButton}>
          <AntDesign 
            name={isExpanded ? "caretup" : "caretdown"} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>

        {/* 추천 장소 리스트 */}
        {isExpanded && (
          <View style={styles.recommendationsContainer}>
            {isLoadingRecommendations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}>추천 목록 불러오는 중...</Text>
              </View>
            ) : recommendations && recommendations.items && recommendations.items.length > 0 ? (
              recommendations.items.map((place, index) => (
                <View key={place.placeId || index} style={styles.placeItem}>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.placeDirectionsButton}
                    onPress={() => handleDirections(place.latitude, place.longitude)}
                  >
                    <FontAwesome6 name="location-arrow" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noRecommendationsText}>오늘의 장소가 없네요</Text>
            )}
          </View>
        )}
      </View>
      

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  routeBox: {
    position: 'absolute',
    top: 180,
    width: width * 0.5, // 0.6에서 0.5로 줄임
    backgroundColor: 'white',
    borderTopRightRadius: 12, // 15에서 12로 줄임
    borderBottomRightRadius: 12, // 15에서 12로 줄임
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
  handleBar: {
    position: 'absolute',
    right: -12, // 더 바깥쪽으로 이동
    top: '50%',
    transform: [{ translateY: -25 }], // 더 큰 영역으로 확장
    width: 12, // SlidePanel과 비슷한 크기
    height: 50, // 더 길게
    backgroundColor: '#6c757d', // 회색 톤으로 변경 (앱의 전체 색상과 맞춤)
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  content: {
    padding: 10, // 12에서 10으로 줄임
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 아이콘, 제목, 닫기 버튼을 양쪽 끝에 배치
    marginBottom: 6, // 8에서 6으로 줄임
  },
  headerText: {
    fontSize: 16, // 14에서 16으로 키움
    fontWeight: '700', // 600에서 700으로 굵게
    color: '#333',
    letterSpacing: 0.5, // 글자 간격 추가
    flex: 1, // 제목이 중앙에 위치하도록
    textAlign: 'center', // 제목 중앙 정렬
  },
  dropdownButton: {
    alignSelf: 'center',
    marginTop: 6, // 8에서 6으로 줄임
    padding: 3, // 4에서 3으로 줄임
  },
  recommendationsContainer: {
    marginTop: 10, // 12에서 10으로 줄임
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 10, // 12에서 10으로 줄임
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // 12에서 10으로 줄임
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15, // 16에서 15로 줄임
    fontWeight: '600', // 600 유지
    color: '#333',
    letterSpacing: 0.3, // 글자 간격 추가
  },
  placeDirectionsButton: {
    padding: 6, // 8에서 6으로 줄임
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // 10에서 8로 줄임
  },
  loadingText: {
    marginLeft: 4, // 5에서 4로 줄임
    fontSize: 11, // 12에서 11로 줄임
    color: '#666',
    fontWeight: '500', // 폰트 굵기 추가
  },
  noRecommendationsText: {
    textAlign: 'center',
    fontSize: 11, // 12에서 11로 줄임
    color: '#666',
    paddingVertical: 8, // 10에서 8로 줄임
    fontWeight: '500', // 폰트 굵기 추가
  },
  showButton: {
    position: 'absolute',
    top: 180,
    left: 20, // 왼쪽으로 이동
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    padding: 5, // 아이콘 주변 여백
  },
  slideArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // RouteBox 아래에 위치하여 터치 영역을 차단
  },
});

export default RouteBox;


