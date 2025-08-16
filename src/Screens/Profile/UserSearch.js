import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchUsers, generatePresignedGetUrl } from '../../config/api';

// Presigned URL을 사용하여 프로필 이미지를 표시하는 컴포넌트
const ProfileImageWithPresignedUrl = ({ profileUrl }) => {
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPresignedUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!profileUrl) {
        setError('프로필 URL이 없습니다.');
        return;
      }

      // AsyncStorage에서 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('사용자 토큰이 없습니다.');
        return;
      }

      const url = await generatePresignedGetUrl(profileUrl, userToken);
      setPresignedUrl(url);
    } catch (err) {
      console.error('Presigned URL 생성 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadPresignedUrl();
  }, [profileUrl]);

  if (isLoading) {
    return <ActivityIndicator size="small" color="#007AFF" />;
  }

  if (error || !presignedUrl) {
    return null; // 에러 시 기본 프로필 이미지 표시
  }

  return (
    <Image
      source={{ uri: presignedUrl }}
      style={styles.profileImage}
      resizeMode="cover"
      onError={(e) => console.log('🖼️ 이미지 로드 실패:', e.nativeEvent)}
      onLoad={() => console.log('🖼️ 이미지 로드 성공')}
    />
  );
};

export default function UserSearch() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('nickname'); // 'nickname' 또는 'email'
  const searchTimeoutRef = useRef(null);

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // 키보드가 나타날 때 필요한 처리
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // 키보드가 사라질 때 필요한 처리
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // 화면 포커스 관리
  useFocusEffect(
    useCallback(() => {
      // 화면이 포커스될 때 초기화
      setSearchText('');
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      
      return () => {
        // 화면이 언포커스될 때도 정리
        Keyboard.dismiss(); // 키보드 강제로 닫기
        setSearchText('');
        setSearchResults([]);
        setIsLoading(false);
        setError(null);
        // 진행 중인 검색 타이머 정리
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [])
  );

  // API를 통한 실제 검색 함수
  const performSearch = async (text, type = searchType) => {
    if (!text.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // AsyncStorage에서 사용자 토큰 가져오기
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.warn('사용자 토큰이 없습니다. 로그인이 필요합니다.');
        setError('로그인이 필요합니다');
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      
      // 에러 상태 초기화
      setError(null);
      
      const response = await searchUsers(text, type, 10, userToken);
      
      if (response.success && response.data && response.data.users) {
        // API 응답 구조에 맞춰 데이터 매핑
        const mappedUsers = response.data.users.map(user => ({
          id: user.userId,
          username: user.username,
          nickname: user.nickname,
          profileImage: user.profileImageUrl
        }));
        setSearchResults(mappedUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      setError(`검색 오류: ${error.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced 검색 함수
  const handleSearch = (text) => {
    setSearchText(text);
    
    // 기존 타이머 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!text.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // 500ms 후에 검색 실행 (debounce)
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => {
        // 즉시 네비게이션 (상태는 useFocusEffect에서 정리)
        navigation.navigate('OtherProfile', { userId: item.id });
      }}
    >
      <View style={styles.profileImageContainer}>
        {item.profileImage ? (
          <ProfileImageWithPresignedUrl 
            profileUrl={item.profileImage} 
          />
        ) : (
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.profileImage}
          />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.name}>{item.nickname}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
        animated={true}
      />
      
      {/* 상단 검색 바 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'nickname' ? '닉네임 검색' : '이메일 검색'}
            placeholderTextColor="#8e8e93"
            value={searchText}
            onChangeText={handleSearch}
            autoFocus={true}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => {
            // 키보드 닫기
            Keyboard.dismiss();
            // 키보드가 완전히 사라진 후 네비게이션
            setTimeout(() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }, 100);
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 타입 선택 */}
      <View style={styles.searchTypeContainer}>
        <TouchableOpacity 
          style={[
            styles.searchTypeButton, 
            styles.firstButton,
            searchType === 'nickname' && styles.activeSearchType
          ]}
          onPress={() => {
            setSearchType('nickname');
            // 검색어가 있으면 새로운 타입으로 재검색
            if (searchText.trim()) {
              performSearch(searchText, 'nickname');
            }
          }}
        >
          <Text style={[styles.searchTypeText, searchType === 'nickname' && styles.activeSearchTypeText]}>
            닉네임
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.searchTypeButton, 
            styles.lastButton,
            searchType === 'email' && styles.activeSearchType
          ]}
          onPress={() => {
            setSearchType('email');
            // 검색어가 있으면 새로운 타입으로 재검색
            if (searchText.trim()) {
              performSearch(searchText, 'email');
            }
          }}
        >
          <Text style={[styles.searchTypeText, searchType === 'email' && styles.activeSearchTypeText]}>
            이메일
          </Text>
        </TouchableOpacity>
      </View>

      {/* 검색 결과 */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            showsVerticalScrollIndicator={false}
          />
        ) : searchText.trim() ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>사용자를 검색해보세요</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginRight: 12,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    marginBottom: 1,
  },
  name: {
    fontSize: 17,
    color: '#000',
    fontWeight: '400',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsText: {
    fontSize: 17,
    color: '#8e8e93',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 17,
    color: '#8e8e93',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 17,
    color: '#8e8e93',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 17,
    color: '#ff3b30',
    textAlign: 'center',
  },
  searchTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  searchTypeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRightWidth: 0,
    minHeight: 28,
  },
  firstButton: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  lastButton: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderRightWidth: 1,
  },
  activeSearchType: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  searchTypeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  activeSearchTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
