// Home.js
import React, { useEffect, useState, useRef } from 'react';
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
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import MapSection from './MapSection';
import SlidePanel from './SlidePanel';
import RouteBox from './RouteBox';
// MemoModal import 제거 - Profile의 memoView 사용

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDE_HEIGHT = 400

export default function Home() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [filter, setFilter] = useState("me");
  const [memos, setMemos] = useState([]);
  const [myUser, setMyUser] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);

  // 스피너 애니메이션을 위한 Animated Value
  const spinValue = useRef(new Animated.Value(0)).current;

  // 스피너 회전 애니메이션 시작
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
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
  const routeSlideAnim = useRef(new Animated.Value(-200)).current;
  const [routeVisible, setRouteVisible] = useState(false);

  // AI 추천 위치(위도, 경도) state
  const [destination, setDestination] = useState(null);

  // 예시: AI 서버에서 추천 위치를 받아온다고 가정
  React.useEffect(() => {
    // 실제로는 fetch 등으로 받아오면 됨
    setDestination({ latitude: 37.5665, longitude: 126.9780 });
  }, []);

  const myUserId = "USER_123";
  const myProfileImage = "https://example.com/me.jpg";

  const fetchCurrentUser = async () => {
    const response = await fetch('https://api.example.com/me');
    return await response.json();
  };

  const fetchFollowingList = async (userId) => {
    const response = await fetch(`https://api.example.com/users/${userId}/followings`);
    return await response.json();
  };

  const fetchAllMemos = async () => {
    const response = await fetch(`https://api.example.com/memos`);
    return await response.json();
  };



  const routePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 더 엄격한 조건: 최소 20px 이상 가로로 움직여야 함
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // 드래그 시작할 때만 반응
      },
      onPanResponderMove: (_, gesture) => {
        // 최소 이동 거리 체크
        if (Math.abs(gesture.dx) > 20) {
          // 현재 패널이 열려있는지 확인
          const currentValue = routeSlideAnim._value;
          let newValue;
          
          if (currentValue > -100) {
            // 패널이 열려있을 때 - 오른쪽에서 왼쪽으로 드래그하면 닫힘
            newValue = Math.max(-200, Math.min(20, 20 + gesture.dx));
          } else {
            // 패널이 닫혀있을 때 - 왼쪽에서 오른쪽으로 드래그하면 열림
            newValue = Math.max(-200, Math.min(20, gesture.dx - 200));
          }
          
          routeSlideAnim.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // 더 엄격한 조건: 최소 80px 이상 드래그하거나 빠른 속도로 드래그해야 함
        const shouldOpen = (gesture.dx > 80 && gesture.vx > -0.5) || gesture.vx > 1.0;
        Animated.timing(routeSlideAnim, {
          toValue: shouldOpen ? 20 : -200,
          duration: shouldOpen ? 300 : 500, // 열릴 때: 300ms, 닫힐 때: 500ms
          useNativeDriver: false,
        }).start(() => setRouteVisible(shouldOpen));
      },
    })
  ).current;

  const openGoogleMapsToDestination = () => {
    const latitude = 37.5665;
    const longitude = 126.9780;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    Linking.openURL(url);
  };

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

  useEffect(() => {
    const fetchData = async () => {
      const userData = await fetchCurrentUser();
      setMyUser(userData);
      const following = await fetchFollowingList(userData.id);
      setFollowingIds(following);
      const allMemoData = await fetchAllMemos();
      setMemos(allMemoData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('위치 권한이 거부되었습니다.');
          return;
        }
        
        // 초기 위치 가져오기
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
          maximumAge: 60000,
        });
        setLocation(loc.coords);

        // 위치 변화 감지 (더 안정적인 업데이트)
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000, // 5초마다 업데이트
            distanceInterval: 10, // 10미터 이동시 업데이트
          },
          (newLocation) => {
            setLocation(newLocation.coords);
          }
        );

        // 컴포넌트 언마운트시 구독 해제
        return () => {
          if (locationSubscription) {
            locationSubscription.remove();
          }
        };
      } catch (error) {
        console.log('위치 정보 가져오기 실패:', error);
      }
    })();

    const subscription = Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const goToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const filteredMemos = memos.filter(memo => {
    if (filter === "me") {
      return memo.userId === myUserId;
    } else if (filter === "following") {
      return followingIds.includes(memo.userId);
    }
    return true;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* MemoModal 제거 - Profile의 memoView 사용 */}

      {/* 기존 UI (맵, 슬라이드 등) */}
      {location ? (
        <>
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

          <RouteBox
            routeSlideAnim={routeSlideAnim}
            routePanResponder={routePanResponder}
            destination={destination}
          />



          <TouchableOpacity style={styles.myMemoManage} onPress={() => navigation.navigate('MemoManager')}>
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
            onPressMemo={memo => { setSelectedMemo(memo); }}
            SLIDE_HEIGHT={SLIDE_HEIGHT}
          />
        </>
      ) : (
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
            <FontAwesome name="spinner" size={24} color="black" />
          </Animated.View>
          <Text style={styles.loadingText}>지도 제작 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 5,
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
