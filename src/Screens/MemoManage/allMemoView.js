import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Entypo, AntDesign } from '@expo/vector-icons';

export default function AllMemoView() {
  const navigation = useNavigation();
  const route = useRoute();
  const { memo } = route.params;

  const [isPublic, setIsPublic] = useState(memo.isPublic);

  return (
    <View style={styles.container}>

      {/* 제목 줄 */}
      <View style={styles.inputRow}>
        <Text style={styles.timeBox}>{memo.place} | {memo.time}</Text>
        <Text style={styles.titleText}>{memo.title}</Text>
      </View>

      {/* 내용 */}
      <ScrollView style={styles.contentInput}>
        <Text style={styles.contentText}>{memo.content}</Text>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => setIsPublic(!isPublic)}>
          <View style={styles.footerBtn}>
            {isPublic ? (
              <Entypo name="eye" size={24} color="black" />
            ) : (
              <Entypo name="eye-with-line" size={24} color="black" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.footerBtn}>
            <AntDesign name="link" size={24} color="black" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.footerBtnText}>수정</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.footerBtnText}>저장</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.footerBtnText}>삭제</Text>
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
  titleText: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    height: '75%',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 14,
    color: '#222',
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
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
});

