import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePrivacySetting, getUserPrivacySetting } from '../../config/api';

export default function PrivacySetting() {
  const navigation = useNavigation();
  const [currentSetting, setCurrentSetting] = useState('open'); // 'open', 'semi', 'closed'
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 공개설정 옵션들
  const privacyOptions = [
    {
      value: 'open',
      title: '전체 공개',
      subtitle: '검색 대상이 되며, 자유롭게 팔로우를 받음 (자동 승인)',
      icon: 'globe-outline'
    },
    {
      value: 'semi',
      title: '일부 공개',
      subtitle: '검색 대상이 되지만, 팔로우는 승인을 거쳐야 함',
      icon: 'people-outline'
    },
    {
      value: 'closed',
      title: '비공개',
      subtitle: '검색 대상이 되지 않고, 팔로우 요청도 받지 않음',
      icon: 'lock-closed-outline'
    }
  ];

  // 초기 설정 불러오기
  useEffect(() => {
    loadCurrentPrivacySetting();
  }, []);

  const loadCurrentPrivacySetting = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.goBack();
        return;
      }

      // TODO: API 구현 후 현재 설정 조회
      // const result = await getUserPrivacySetting(userToken);
      
      // 임시로 기본값 설정 (API 구현 전까지)
      setCurrentSetting('open');
    } catch (error) {
      console.error('공개설정 조회 오류:', error);
      setCurrentSetting('open');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handlePrivacyChange = async (newSetting) => {
    if (newSetting === currentSetting) return;

    setIsLoading(true);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const result = await updatePrivacySetting(newSetting, userToken);
      
      if (result.success) {
        setCurrentSetting(newSetting);
        Alert.alert('성공', '공개설정이 변경되었습니다.');
      } else {
        Alert.alert('오류', '설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('공개설정 변경 오류:', error);
      Alert.alert('오류', `설정 변경 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPrivacyOption = (option) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionContainer,
        currentSetting === option.value && styles.selectedOption
      ]}
      onPress={() => handlePrivacyChange(option.value)}
      disabled={isLoading}
    >
      <View style={styles.optionLeft}>
        <Ionicons 
          name={option.icon} 
          size={24} 
          color={currentSetting === option.value ? '#007AFF' : '#666'} 
        />
        <View style={styles.optionText}>
          <Text style={[
            styles.optionTitle,
            currentSetting === option.value && styles.selectedTitle
          ]}>
            {option.title}
          </Text>
          <Text style={styles.optionSubtitle}>
            {option.subtitle}
          </Text>
        </View>
      </View>
      
      {currentSetting === option.value && (
        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <Text style={styles.title}>공개설정 변경</Text>
      </View>

      {/* 설명 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          계정의 공개 범위를 설정할 수 있습니다. 설정에 따라 검색 노출 여부와 팔로우 승인 방식이 달라집니다.
        </Text>
      </View>

      {/* 옵션들 */}
      <View style={styles.optionsContainer}>
        {privacyOptions.map(renderPrivacyOption)}
      </View>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>설정을 변경하는 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  selectedTitle: {
    color: '#007AFF',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
