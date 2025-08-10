import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMemo } from '../../config/api';
import * as Location from 'expo-location';

export default function AddMemo() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const contentRef = useRef(null);

  // 들여쓰기 처리 함수
  const handleContentChange = (text) => {
    // 탭 키나 특수 문자로 들여쓰기 시뮬레이션
    let processedText = text;
    
    // 줄바꿈 후 자동 들여쓰기 (선택사항)
    if (text.endsWith('\n')) {
      const lines = text.split('\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine.trim() === '') {
        // 빈 줄이면 이전 줄의 들여쓰기 수준 유지
        const previousLine = lines[lines.length - 2] || '';
        const indentLevel = (previousLine.match(/^(\s*)/) || [''])[0].length;
        if (indentLevel > 0) {
          processedText = text + ' '.repeat(indentLevel);
        }
      }
    }
    
    setContent(processedText);
  };
  
  // 현재 시간을 포맷팅하는 함수
  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 화면 전환 시 배경색 즉시 설정
  useEffect(() => {
    // 화면이 마운트되자마자 배경색을 흰색으로 설정
    const timer = setTimeout(() => {
      // 강제로 리렌더링하여 배경색 적용
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 현재 위치 가져오기
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('위치 권한 필요', '위치 정보를 사용하려면 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.');
          setLocationName('위치 권한 없음');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000,
          maximumAge: 10000,
        });
        setCurrentLocation(location);
        
        // 위치 정보로 주소 가져오기
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          // 더 상세한 주소 정보 구성
          const addressParts = [
            address.country,
            address.region,
            address.city,
            address.district,
            address.street,
            address.name
          ].filter(part => part && part.trim() !== '');
          
          const locationNameStr = addressParts.join(' ').trim();
          
          if (locationNameStr) {
            setLocationName(locationNameStr);
          } else {
            // 주소 정보가 없으면 좌표로 대체
            const coordStr = `위도: ${location.coords.latitude.toFixed(6)}, 경도: ${location.coords.longitude.toFixed(6)}`;
            setLocationName(coordStr);
          }
        } else {
          // 주소 변환 실패 시 좌표 정보 사용
          const coordStr = `위도: ${location.coords.latitude.toFixed(6)}, 경도: ${location.coords.longitude.toFixed(6)}`;
          setLocationName(coordStr);
        }
      } catch (error) {
        console.log('위치 정보 가져오기 실패:', error);
        setLocationName('위치 정보 오류');
        Alert.alert('위치 오류', '위치 정보를 가져올 수 없습니다. GPS가 켜져있는지 확인해주세요.');
      }
    };

    getCurrentLocation();
  }, []);

  // 메모 저장 함수
  const handleSaveMemo = async () => {
    if (!content.trim()) {
      Alert.alert('오류', '메모 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      // API 명세서에 맞는 데이터 구조
      const memoData = {
        content: content.trim(),
        title: title.trim() || '제목 없음',
        is_public: isPublic,
        location_name: location.trim() || '위치 없음',
        location_latitude: currentLocation?.coords?.latitude || 37.5665,
        location_longitude: currentLocation?.coords?.longitude || 126.9780,
        location_address: locationName && locationName !== '위치 권한 없음' && locationName !== '위치 정보 오류' ? locationName : (currentLocation ? `위도: ${currentLocation.coords.latitude.toFixed(6)}, 경도: ${currentLocation.coords.longitude.toFixed(6)}` : '위치 정보 없음'),
        location_category: category.trim() || '기타',
        file_url: ""
      };

      console.log('POST /api/memo/');
      console.log('Request Body:', JSON.stringify(memoData, null, 2));

      // 저장된 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      
      const result = await createMemo(memoData, userToken);
      console.log('Response:', JSON.stringify(result, null, 2));
      
      Alert.alert('성공', '메모가 성공적으로 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      Alert.alert('오류', `메모 저장에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.safeContainer}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        // 포커스 해제
        if (contentRef.current) {
          contentRef.current.blur();
        }
      }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="never"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={styles.inputRow}>
            <Text style={styles.timeBox}>{formatCurrentTime()}</Text>
            <TextInput
              placeholder="제목을 입력하세요"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="위치를 입력하세요"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
              style={styles.locationInput}
              returnKeyType="next"
            />
            <TextInput
              placeholder="카테고리를 입력하세요"
              placeholderTextColor="#999"
              value={category}
              onChangeText={setCategory}
              style={styles.categoryInput}
              returnKeyType="next"
            />
          </View>
          
          {/* 현재 위치 상태 표시 */}
          <View style={styles.locationStatus}>
            <Text style={styles.locationStatusText}>
              현재 주소: {currentLocation ? 
                (locationName || '주소 변환 중...') : 
                '위치 정보 가져오는 중...'
              }
            </Text>
          </View>

          <TextInput
            ref={contentRef}
            style={styles.contentInput}
            multiline
            value={content}
            onChangeText={handleContentChange}
            placeholder="메모를 입력하세요"
            placeholderTextColor="#999"
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="top"
            scrollEnabled={true}
            autoCapitalize="sentences"
            autoCorrect={true}
            spellCheck={true}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setIsPublic(!isPublic)}>
              <View style={styles.footerBtn}>
                {isPublic ? 
                  <Entypo name="eye" size={24} color="black" /> : 
                  <Entypo name="eye-with-line" size={24} color="black" />
                }
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSaveMemo}
              disabled={isLoading}
              style={[styles.footerBtn, isLoading && styles.disabledBtn]}
            >
              <Text style={styles.footerBtnText}>
                {isLoading ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 100, // 키보드가 올라올 때 여유 공간 확보
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  timeBox: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    borderRadius: 4,
    marginRight: 8,
  },
  titleInput: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
  },
  contentInput: {
    minHeight: 300,
    maxHeight: 400,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 'auto',
  },
  footerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },
  footerBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: '#999',
  },
  locationStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  locationStatusText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});