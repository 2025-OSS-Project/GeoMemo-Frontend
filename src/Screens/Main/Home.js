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
import MemoModal from './MemoModal';

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

  // MemoModal 테스트용 state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const exampleMemo = {
    number: 1,
    time: '12:34',
    title: '테스트 메모',
    content: '이것은 MemoModal 디자인 테스트용 예시입니다.',
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

  const toggleRouteBox = () => {
    Animated.timing(routeSlideAnim, {
      toValue: routeVisible ? -200 : 20,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setRouteVisible(!routeVisible));
  };

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
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
      {/* MemoModal: 슬라이드 패널에서 제목 클릭 시 노출 */}
      <MemoModal
        visible={modalVisible}
        memo={selectedMemo || exampleMemo}
        onClose={() => { setModalVisible(false); setSelectedMemo(null); }}
        onBookmark={() => {}}
        onNavigate={() => {}}
      />

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
            destination={destination}
          />

          <TouchableOpacity
            style={styles.routeToggleBtn}
            onPress={toggleRouteBox}
          >
            <Ionicons name={routeVisible ? "chevron-back" : "chevron-forward"} size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.myMemoManage}>
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
            onPressMemo={memo => { setSelectedMemo(memo); setModalVisible(true); }}
            SLIDE_HEIGHT={SLIDE_HEIGHT}
          />
        </>
      ) : (
        <Text style={{ padding: 20 }}>화면 구성 중...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 40,
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
  routeToggleBtn: {
    position: 'absolute',
    top: 120,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    zIndex: 15,
  },
  myMemoManage: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    zIndex: 10,
  },
  compassBtn: {
    position: 'absolute',
    top: 180,
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
});
