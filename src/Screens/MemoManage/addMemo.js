import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';
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
  
  // 현재 시간을 포맷팅하는 함수
  const formatCurrentTime = () => {
    const now = new Date();
    return now.toISOString();
  };

  // 현재 위치 가져오기
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('위치 권한', '위치 정보를 사용할 수 없습니다.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
        
        // 위치 정보로 주소 가져오기
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          const locationNameStr = `${address.city || ''} ${address.district || ''} ${address.street || ''}`.trim();
          if (locationNameStr) {
            setLocationName(locationNameStr);
          }
        }
      } catch (error) {
        console.log('위치 정보 가져오기 실패:', error);
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
        title: title.trim() || '제목 없음',
        content: content.trim(),
        is_public: isPublic,
        user_id: 1, // 테스트용 사용자 ID
        location_name: location.trim() || '위치 없음',
        location_latitude: currentLocation?.coords?.latitude || 37.5665,
        location_longitude: currentLocation?.coords?.longitude || 126.9780,
        location_address: locationName || '위치 정보 없음',
        location_category: category.trim() || '기타',
        file_url: [], // 파일 업로드 기능은 추후 구현
        created_at: formatCurrentTime() // 현재 시간 추가
      };

      const result = await createMemo(memoData);
      
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
    <View style={styles.container}>

      <View style={styles.inputRow}>
        <Text style={styles.timeBox}>{formatCurrentTime()}</Text>
        <TextInput
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="위치를 입력하세요"
          value={location}
          onChangeText={setLocation}
          style={styles.locationInput}
        />
        <TextInput
          placeholder="카테고리를 입력하세요"
          value={category}
          onChangeText={setCategory}
          style={styles.categoryInput}
        />
      </View>

      <TextInput
        style={styles.contentInput}
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="메모를 입력하세요"
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => setIsPublic(!isPublic)}>
          <Text style={styles.footerBtn}>{isPublic ? 
          <Entypo name="eye" size={24} color="black" /> : <Entypo name="eye-with-line" size={24} color="black" />}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
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
    height: '70%',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
});