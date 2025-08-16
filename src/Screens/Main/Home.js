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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Ionicons, FontAwesome, FontAwesome5, Entypo } from '@expo/vector-icons';
import MapSection from './MapSection';
import SlidePanel from './SlidePanel';
import RouteBox from './RouteBox';
import { getAllMemos, updateViewSettings, getCurrentUserInfo } from '../../config/api';
// MemoModal import 제거 - Profile의 memoView 사용

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDE_HEIGHT = Math.floor(Dimensions.get('window').height * 0.4); // 화면 높이의 40%

function Home() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [filter, setFilter] = useState("all");
  const [memos, setMemos] = useState([]);
  const [myUser, setMyUser] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoadingMemos, setIsLoadingMemos] = useState(false);
  
  // 스피너 애니메이션을 위한 Animated Value
  const spinValue = useRef(new Animated.Value(0)).current;

  // 토큰 가져오기
  const fetchUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);
      }
    } catch (error) {
      // 토큰 로드 실패 시 무시
    }
  };

  // 사용자 토큰 가져오기
  useEffect(() => {
    fetchUserToken();
  }, []);

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

  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT - SLIDE_HEIGHT)).current;
  const routeSlideAnim = useRef(new Animated.Value(0)).current;
  const routeSlideAnimValue = useRef(0); // 현재 값을 추적하기 위한 ref
  const [routeVisible, setRouteVisible] = useState(true);

  // AI 추천 위치(위도, 경도) state
  const [destination, setDestination] = useState(null);

  // AI 추천 위치 설정 (즉시 설정)
  React.useEffect(() => {
    setDestination({ latitude: 37.5665, longitude: 126.9780 });
  }, []);

  // API 함수들 (현재는 사용하지 않음 - 즉시 반환)
  const fetchCurrentUser = useCallback(() => {
    return Promise.resolve({ id: 'USER_123', name: '사용자' });
  }, []);

  const fetchFollowingList = useCallback(() => {
    return Promise.resolve([]);
  }, []);

  const fetchAllMemos = useCallback(async () => {
    try {
      if (!userToken) {
        return;
      }
      
      // 로딩 상태 시작
      setIsLoadingMemos(true);
      
      // 현재 필터에 맞는 view_setting 값 매핑
      let viewSetting;
      switch (filter) {
        case 'all':
          viewSetting = 'all';
          break;
        case 'following':
          viewSetting = 'follows';
          break;
        case 'me':
          viewSetting = 'self';
          break;
        default:
          viewSetting = 'all';
      }
      
      const response = await getAllMemos(userToken, viewSetting);
      
      if (response.success && response.data) {
        // API 응답 구조에 맞춰 메모 데이터 변환
        let transformedMemos = response.data.map(memo => ({
          id: memo.memoId,
          title: memo.title,
          content: memo.content,
          lat: memo.location?.latitude,
          lng: memo.location?.longitude,
          // location 객체를 그대로 유지 (API 응답 구조 그대로)
          location: memo.location,
          userId: memo.user?.userId,
          userName: memo.user?.username,
          profileImage: memo.user?.photoUrl,
          createdAt: memo.createdAt,
          isPublic: memo.isPublic,
          fileUrl: memo.fileUrl
        }));
        
        // 지도 경계가 설정된 경우 해당 영역 내의 메모만 필터링
        if (mapBounds && mapBounds.northWest && mapBounds.southEast) {
          transformedMemos = transformedMemos.filter(memo => {
            if (!memo.lat || !memo.lng) return false;
            
            return memo.lat >= mapBounds.southEast.latitude && 
                   memo.lat <= mapBounds.northWest.latitude &&
                   memo.lng >= mapBounds.northWest.longitude && 
                   memo.lng <= mapBounds.southEast.longitude;
          });
        }
        
        setMemos(transformedMemos);
      } else {
        setMemos([]);
      }
    } catch (error) {
      setMemos([]);
    } finally {
      // 로딩 상태 해제
      setIsLoadingMemos(false);
    }
  }, [userToken, filter, mapBounds]);

  // 슬라이드 패널을 위한 panResponder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        // 슬라이드 제한 (안전 영역은 위치 계산에만 사용)
        const minTop = SCREEN_HEIGHT - SLIDE_HEIGHT; // 최소 상단 위치 (패널이 완전히 보이는 상태)
        const maxTop = SCREEN_HEIGHT - 120; // 최대 상단 위치 (패널이 거의 숨겨진 상태)
        
        const newTop = Math.max(minTop, Math.min(maxTop, gesture.moveY));
        slideAnim.setValue(newTop);
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
    setMemos([]);
    setFollowingIds([]);
    
    // 토큰 가져오기
    fetchUserToken();
    
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
              // 현재 위치 가져오기 실패 시 기본 위치 유지
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
              // 권한 요청 실패 시 무시
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
            // 위치 감지 설정 실패 시 무시
          });
        }
      } catch (error) {
        // 오류 발생 시 기본 위치 사용
        const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
        setLocation(defaultLocation);
      }
      
      // Promise 완료를 위한 resolve
      return Promise.resolve();
    };
    
    // 위치 초기화 실행 (비동기로 처리)
    initializeLocationImmediately().then(() => {
      // 위치 초기화가 완료된 후 로딩 상태 해제 (500ms로 단축)
      setTimeout(() => {
        setIsInitializing(false);
        
        // 초기 지도 경계 설정 및 메모 조회
        if (location) {
          const initialBounds = {
            lat1: location.latitude + 0.005,
            lon1: location.longitude - 0.005,
            lat2: location.latitude - 0.005,
            lon2: location.longitude + 0.005,
            };
          setMapBounds(initialBounds);
          
          // 현재 필터에 맞는 메모 조회
          fetchAllMemos();
        }
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
      // 사용자 정보 가져오기
      const loadUserInfo = async () => {
        if (userToken && !myUser) {
          try {
            const userInfo = await getCurrentUserInfo(userToken);
            setMyUser(userInfo);
          } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
          }
        }
      };

      loadUserInfo();

      // 홈 화면으로 돌아왔을 때 메모 데이터 새로 불러오기 (필터 변경이 아닌 경우에만)
      if (userToken && !route.params?.filterChanged) {
        fetchAllMemos();
      }
      
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
      } else if (location && !mapBounds) {
        // 일반적인 포커스 복귀 시 위치 확인 (지도 경계가 설정되지 않은 경우에만)
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 300);
        }
      } else if (!location) {
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
            // 위치 업데이트 실패 시 무시
          }
        };
        
        quickLocationUpdate();
      }
      
      // 필터 변경 플래그 초기화
      if (route.params?.filterChanged) {
        navigation.setParams({ filterChanged: false });
      }
    }, [location, route.params?.refreshLocation, route.params?.filterChanged, navigation, userToken, fetchAllMemos, mapBounds, myUser])
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

  // 지도 경계 변경 시 메모 조회 (실시간 추적)
  const onMapRegionChange = useCallback((region) => {
    console.log('=== onMapRegionChange 호출됨 ===');
    console.log('region:', {
      latitude: parseFloat(region.latitude.toFixed(7)),
      longitude: parseFloat(region.longitude.toFixed(7)),
      latitudeDelta: parseFloat(region.latitudeDelta.toFixed(7)),
      longitudeDelta: parseFloat(region.longitudeDelta.toFixed(7))
    });
    
    // 지도 경계 계산 (북서쪽과 남동쪽 좌표)
    const bounds = {
      northWest: {
        latitude: region.latitude + region.latitudeDelta / 2, // 북쪽 위도
        longitude: region.longitude - region.longitudeDelta / 2, // 서쪽 경도
      },
      southEast: {
        latitude: region.latitude - region.latitudeDelta / 2, // 남쪽 위도
        longitude: region.longitude + region.longitudeDelta / 2, // 동쪽 경도
      }
    };
    
    console.log('계산된 bounds:', bounds);
    
    // 실시간으로 화면에 보이는 위치값 업데이트 (API 호출은 하지 않음)
    setMapBounds(bounds);
  }, []);

  // 지도 조작 완료 시 메모 조회 (손을 뗐을 때)
  const onMapRegionChangeComplete = useCallback((region) => {
    console.log('=== onMapRegionChangeComplete 호출됨 ===');
    console.log('region:', {
      latitude: parseFloat(region.latitude.toFixed(7)),
      longitude: parseFloat(region.longitude.toFixed(7)),
      latitudeDelta: parseFloat(region.latitudeDelta.toFixed(7)),
      longitudeDelta: parseFloat(region.longitudeDelta.toFixed(7))
    });
    
    // 지도 경계 계산 (북서쪽과 남동쪽 좌표)
    const bounds = {
      northWest: {
        latitude: region.latitude + region.latitudeDelta / 2, // 북쪽 위도
        longitude: region.longitude - region.longitudeDelta / 2, // 서쪽 경도
      },
      southEast: {
        latitude: region.latitude - region.latitudeDelta / 2, // 남쪽 위도
        longitude: region.longitude + region.longitudeDelta / 2, // 동쪽 경도
      }
    };
    
    console.log('최종 bounds:', bounds);
    
    // 지도 경계 업데이트 (SlidePanel에서 API 호출)
    setMapBounds(bounds);
    
    // 기존의 fetchAllMemos 호출 제거 - SlidePanel에서 처리
  }, []);

  // 백엔드에서 이미 필터링된 메모를 제공하므로 클라이언트 사이드 필터링 불필요
  


  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleMemoManagerPress = useCallback(() => {
    navigation.navigate('MemoManager');
  }, [navigation]);



  const handleMemoPress = useCallback((memo) => {
    console.log('=== handleMemoPress 함수 시작 ===');
    console.log('전달받은 메모:', memo);
    console.log('메모 ID 필드들:', {
      id: memo?.id,
      memoId: memo?.memoId,
      hasId: !!memo?.id,
      hasMemoId: !!memo?.memoId
    });
    
    if (!memo?.id && !memo?.memoId) {
      console.error('❌ 메모 ID가 없음');
      return;
    }
    
    try {
      // MemoView로 네비게이션하면서 메모 ID 전달
      const memoIdToPass = memo.memoId || memo.id;
      console.log('MemoView로 전달할 memoId:', memoIdToPass);
      
      navigation.navigate('MemoView', { 
        memoId: memoIdToPass,
        memo: memo // 기존 메모 데이터도 함께 전달 (필요시 사용)
      });
    } catch (error) {
      console.error('네비게이션 실패:', error);
    }
  }, [navigation]);

  // 필터 변경 시 서버에 뷰 설정 업데이트
  const handleFilterChange = useCallback(async (newFilter) => {
    try {
      // 로딩 상태 표시
      setMemos([]);
      setIsLoadingMemos(true);
      
      // API 명세서에 맞춰 view_setting 값 매핑
      let viewSetting;
      switch (newFilter) {
        case 'all':
          viewSetting = 'all';
          break;
        case 'following':
          viewSetting = 'follows';
          break;
        case 'me':
          viewSetting = 'self';
          break;
        default:
          viewSetting = 'all';
      }

      // 필터 변경 시 즉시 메모 조회
      if (userToken) {
        const response = await getAllMemos(userToken, viewSetting);
        
        if (response.success && response.data) {
          // API 응답 구조에 맞춰 메모 데이터 변환
          let transformedMemos = response.data.map(memo => ({
            id: memo.memoId,
            title: memo.title,
            content: memo.content,
            lat: memo.location?.latitude,
            lng: memo.location?.longitude,
            // location 객체를 그대로 유지 (API 응답 구조 그대로)
            location: memo.location,
            userId: memo.user?.userId,
            userName: memo.user?.username,
            profileImage: memo.user?.photoUrl,
            createdAt: memo.createdAt,
            isPublic: memo.isPublic,
            fileUrl: memo.fileUrl
          }));
          
          // 지도 경계가 설정된 경우 해당 영역 내의 메모만 필터링
          if (mapBounds && mapBounds.northWest && mapBounds.southEast) {
            transformedMemos = transformedMemos.filter(memo => {
              if (!memo.lat || !memo.lng) return false;
              
              return memo.lat >= mapBounds.southEast.latitude && 
                     memo.lat <= mapBounds.northWest.latitude &&
                     memo.lng >= mapBounds.northWest.longitude && 
                     memo.lng <= mapBounds.southEast.longitude;
            });
          }
          
          setMemos(transformedMemos);
        } else {
          setMemos([]);
        }
      } else {
        setMemos([]);
      }

      // 뷰 설정 업데이트
      if (userToken) {
        try {
          const response = await updateViewSettings(viewSetting, userToken);
          if (!response.success) {
            // 뷰 설정 업데이트 실패 시 무시
          }
        } catch (error) {
          // 뷰 설정 업데이트 중 오류 시 무시
        }
      }

      // 로컬 필터 상태 업데이트
      setFilter(newFilter);
      
      // 필터 변경 플래그 설정 (useFocusEffect에서 자동 위치 이동 방지)
      navigation.setParams({ filterChanged: true });
      
    } catch (error) {
      // 오류 발생 시에도 로컬에서 필터 변경
      setFilter(newFilter);
      setMemos([]);
    } finally {
      // 로딩 상태 해제
      setIsLoadingMemos(false);
    }
  }, [userToken, filter, navigation, mapBounds]);

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
        onMapRegionChange={onMapRegionChange}
        onMapRegionChangeComplete={onMapRegionChangeComplete}
        onPressMemo={handleMemoPress}
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
      <Entypo name="location" size={24} color="black" />
      </TouchableOpacity>

      <SlidePanel
        slideAnim={slideAnim}
        panResponder={panResponder}
        memos={memos}
        filter={filter}
        setFilter={handleFilterChange}
        myUserId={myUser?.id}
        myProfileImage={myUser?.user_profile}
        followingIds={followingIds}
        myUser={myUser}
        onPressMemo={handleMemoPress}
        SLIDE_HEIGHT={SLIDE_HEIGHT}
        isLoadingMemos={isLoadingMemos}
        mapBounds={mapBounds} // 지도 경계 추가
        userToken={userToken} // 사용자 토큰 추가
        onMemosUpdate={setMemos} // 메모 업데이트 콜백 추가
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
    top: 170,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 0,
    padding: 12,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBtn: {
    position: 'absolute',
    top: 220,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 15,
    padding: 12,
    zIndex: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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