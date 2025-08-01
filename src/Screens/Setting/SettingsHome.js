import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SettingsHome() {
  const navigation = useNavigation();
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  return (
    <View style={styles.container}>
      {/* 회원정보 수정 */}
      <TouchableOpacity
        style={styles.boxButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.boxText}>회원정보 수정</Text>
      </TouchableOpacity>

      {/* 알림기능 */}
      <View style={styles.toggleBox}>
        <View style={styles.toggleRow}>
          <Text style={styles.boxText}>알림기능</Text>
          <Switch
            value={isNotificationEnabled}
            onValueChange={() =>
              setIsNotificationEnabled(!isNotificationEnabled)
            }
            trackColor={{ false: '#ccc', true: '#4cd137' }}
          />
        </View>
        <Text style={styles.subText}>
          주간 인사이트 및 장소추천을 알림으로 받을 수 있어요.
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 회원탈퇴 */}
      <TouchableOpacity style={styles.withdrawButton}>
        <Text style={styles.withdrawText}>회원탈퇴</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  boxButton: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  toggleBox: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boxText: {
    fontSize: 15,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 8,
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  withdrawButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 999, // 완전 둥글게
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 80,
  },
  withdrawText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
