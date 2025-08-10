// Home.js
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  PanResponder,
  Linking,
  FlatList,
  Image,
  StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import MapSection from './MapSection';
import SlidePanel from './SlidePanel';
import RouteBox from './RouteBox';
// MemoModal import 제거 - Profile의 memoView 사용

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDE_HEIGHT = 400

function Home() {
  const navigation = useNavigation();
  const route = useRoute();
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [filter, setFilter] = useState("me");
  const [memos, setMemos] = useState([]);
  const [myUser, setMyUser] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // 스피너 애니메이션을 위한 Animated Value
  const spinValue = useRef(new Animated.Value(0)).current;

  // 스피너 회전 애니메이션 시작 (더 빠른 회전)
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 600, // 더 빠른 회전
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  // memoView 사용을 위한 state
  const [selectedMemo, setSelectedMemo] = useState(null);
  const exampleMemo = {
    number: 1,
    time: '12:34',
    title: '테스트 메모',
    content: '이것은 memoView 디자인 테스트용 예시입니다.',
  };

  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT - 120)).current;
  const routeSlideAnim = useRef(new Animated.Value(0)).current;
  const routeSlideAnimValue = useRef(0); // 현재 값을 추적하기 위한 ref
  const [routeVisible, setRouteVisible] = useState(true);

  // AI 추천 위치(위도, 경도) state
  const [destination, setDestination] = useState(null);

  // AI 추천 위치 설정 (즉시 설정)
  React.useEffect(() => {
    setDestination({ latitude: 37.5665, longitude: 126.9780 });
  }, []);

  const myUserId = "USER_123";
  const myProfileImage = "https://example.com/me.jpg";

  // API 함수들 (현재는 사용하지 않음 - 즉시 반환)
  const fetchCurrentUser = useCallback(() => {
    return Promise.resolve({ id: 'USER_123', name: '사용자' });
  }, []);

  const fetchFollowingList = useCallback(() => {
    return Promise.resolve([]);
  }, []);

  const fetchAllMemos = useCallback(() => {
    return Promise.resolve([]);
  }, []);

  // 슬라이드 패널을 위한 panResponder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        slideAnim.setValue(Math.max(120, Math.min(SCREEN_HEIGHT, gesture.moveY)));
      },
      onPanResponderRelease: (_, gesture) => {
        Animated.spring(slideAnim, {
          toValue: gesture.dy > 50 ? SCREEN_HEIGHT - 120 : SCREEN_HEIGHT - SLIDE_HEIGHT,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const routePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        routeSlideAnim.setValue(routeSlideAnimValue.current);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(-200, Math.min(0, routeSlideAnimValue.current + gestureState.dx));
        routeSlideAnim.setValue(newValue);
        routeSlideAnimValue.current = newValue;
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vx;
        const distance = gestureState.dx;
        
        if (velocity > 0.5 || distance > 50) {
          Animated.timing(routeSlideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            routeSlideAnimValue.current = 0;
          });
        } else {
          Animated.timing(routeSlideAnim, {
            toValue: -200,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            routeSlideAnimValue.current = -200;
          });
        }
      },
    })
  ).current;

  // 초기화 로직을 극도로 최적화하여 즉시 화면 표시
  useEffect(() => {
    const startTime = performance.now();
    
    // 1단계: 즉시 기본 데이터 설정 (UI 블로킹 없음)
    setMyUser({ id: 'USER_123', name: '사용자' });
    setMemos([]);
    setFollowingIds([]);
    
    // 2단계: 위치 정보 즉시 초기화 (권한 체크와 동시에)
    const initializeLocationImmediately = async () => {
      try {
        // 위치 권한 상태 확인 (이미 허용된 경우 빠른 응답)
        const { status } = await Location.getForegroundPermissionsAsync();
        
        // 처음에는 기본 위치로 시작 (서울)
        const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
        setLocation(defaultLocation);
        
        if (status === 'granted') {
          // 권한이 있으면 백그라운드에서 현재 위치 가져오기 (UI 블로킹 없음)
          setTimeout(async () => {
            try {
              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 2000,
                maximumAge: 300000,
              });
              setLocation(loc.coords);
              
              // 지도가 준비되면 해당 위치로 이동
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 300);
              }
            } catch (locationError) {
              console.log('현재 위치 가져오기 실패, 기본 위치 유지:', locationError);
            }
          }, 1000); // 1초 후 백그라운드에서 실행
        } else {
          // 권한이 없으면 백그라운드에서 권한 요청
          setTimeout(async () => {
            try {
              const permission = await Location.requestForegroundPermissionsAsync();
              if (permission.status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                  timeout: 2000,
                  maximumAge: 300000,
                });
                setLocation(loc.coords);
                
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 300);
                }
              }
            } catch (error) {
              console.log('권한 요청 실패:', error);
            }
          }, 1000); // 1초 후 백그라운드에서 실행
        }
        
        // 위치 변화 감지 설정 (백그라운드, 낮은 우선순위)
        if (status === 'granted') {
          Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced, // Balanced 정확도로 정확도 향상
              timeInterval: 60000, // 30초 → 60초로 증가하여 배터리 절약
              distanceInterval: 100,
            },
            (newLocation) => {
              setLocation(newLocation.coords);
            }
          ).catch(error => {
            console.log('위치 감지 설정 실패:', error);
          });
        }
      } catch (error) {
        console.log('위치 초기화 오류:', error);
        // 오류 발생 시 기본 위치 사용
        const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
        setLocation(defaultLocation);
      }
      
      // Promise 완료를 위한 resolve
      return Promise.resolve();
    };
    
    // 위치 초기화 실행 (비동기로 처리)
    initializeLocationImmediately().then(() => {
      const locationEndTime = performance.now();
      console.log(`위치 초기화 완료: ${(locationEndTime - startTime).toFixed(2)}ms`);
      
      // 위치 초기화가 완료된 후 로딩 상태 해제 (500ms로 단축)
      setTimeout(() => {
        setIsInitializing(false);
        const endTime = performance.now();
        console.log(`전체 로딩 화면 표시: ${(endTime - startTime).toFixed(2)}ms (실제 초기화: ${(locationEndTime - startTime).toFixed(2)}ms)`);
      }, 500); // 1초 → 500ms로 단축
    });
    
  }, []);

  // Magnetometer 센서 초기화를 백그라운드로 연기
  useEffect(() => {
    const timer = setTimeout(() => {
      const subscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        setHeading(angle);
      });

      return () => {
        subscription.remove();
      };
    }, 200); // 500ms → 200ms로 단축

    return () => clearTimeout(timer);
  }, []);

  // 화면에 포커스가 돌아왔을 때 최적화 (필요한 경우에만 실행)
  useFocusEffect(
    useCallback(() => {
      // 홈 화면으로 돌아왔을 때 위치 정보 빠르게 업데이트
      const refreshLocation = route.params?.refreshLocation;
      
      if (refreshLocation && location) {
        // 홈버튼으로 돌아왔을 때 즉시 현재 위치로 이동
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 200);
        }
        
        // 파라미터 초기화
        navigation.setParams({ refreshLocation: false });
      } else if (location) {
        // 일반적인 포커스 복귀 시 위치 확인
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 300);
        }
      } else {
        // 위치가 없으면 빠르게 위치 가져오기
        const quickLocationUpdate = async () => {
          try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                          const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced, // Balanced 정확도로 정확도 향상
              timeout: 1500, // 2초 → 1.5초로 단축
              maximumAge: 300000, // 30초 → 5분으로 증가하여 캐시 활용
            });
              setLocation(loc.coords);
              
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 200); // 300ms → 200ms로 단축
              }
            }
          } catch (error) {
            console.log('빠른 위치 업데이트 실패:', error);
          }
        };
        
        quickLocationUpdate();
      }
    }, [location, route.params?.refreshLocation, navigation])
  );

  const goToCurrentLocation = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 200); // 500ms → 200ms로 단축
    }
  }, [location]);

  // 메모 필터링을 useMemo로 최적화
  const filteredMemos = useMemo(() => {
    return memos.filter(memo => {
      if (filter === "me") {
        return memo.userId === myUserId;
      } else if (filter === "following") {
        return followingIds.includes(memo.userId);
      }
      return true;
    });
  }, [memos, filter, myUserId, followingIds]);

  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleMemoManagerPress = useCallback(() => {
    navigation.navigate('MemoManager');
  }, [navigation]);

  const handleMemoPress = useCallback((memo) => {
    setSelectedMemo(memo);
  }, []);

  // 초기화 중일 때 스켈레톤 UI 표시
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={{
            transform: [{
              rotate: spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            }],
          }}
        >
          <FontAwesome name="spinner" size={32} color="#111" />
        </Animated.View>
        <Text style={styles.loadingText}>지도 제작 중...</Text>
      </View>
    );
  }

  // 위치 정보가 없을 때 기본 로딩 표시
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>위치 정보 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* StatusBar 설정 - 어두운 텍스트 */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* MemoModal 제거 - Profile의 memoView 사용 */}

      {/* 기존 UI (맵, 슬라이드 등) */}
      <MapSection
        mapRef={mapRef}
        location={location}
        heading={heading}
        memos={memos}
        filter={filter}
        myUser={myUser}
        followingIds={followingIds}
      />

      <View style={styles.topBar}>
        <Text style={styles.moodText}>주간 인사이트</Text>
      </View>

      {routeVisible && (
        <RouteBox
          routeSlideAnim={routeSlideAnim}
          routePanResponder={routePanResponder}
          destination={destination}
        />
      )}

      <TouchableOpacity style={styles.myMemoManage} onPress={handleMemoManagerPress}>
        <FontAwesome name="navicon" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.compassBtn} onPress={goToCurrentLocation}>
        <Ionicons name="navigate-circle-outline" size={24} color="black" />
      </TouchableOpacity>

      <SlidePanel
        slideAnim={slideAnim}
        panResponder={panResponder}
        memos={filteredMemos}
        filter={filter}
        setFilter={setFilter}
        myUserId={myUserId}
        myProfileImage={myProfileImage}
        followingIds={followingIds}
        myUser={myUser}
        onPressMemo={handleMemoPress}
        SLIDE_HEIGHT={SLIDE_HEIGHT}
      />
    </View>
  );
}

// React.memo로 컴포넌트 래핑하여 불필요한 리렌더링 방지
export default React.memo(Home);

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 65, // 70 → 100으로 조정하여 상태바 아래에 위치
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10, // 지도 위에 표시되도록 zIndex 추가
  },
  moodText: {
    fontSize: 14,
    fontWeight: '500',
  },

  myMemoManage: {
    position: 'absolute',
    top: 150,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    zIndex: 10,
  },
  compassBtn: {
    position: 'absolute',
    top: 200,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    zIndex: 10,
  },
  memoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memoBox: {
    flex: 1,
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  memoUserName: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
  },
});
