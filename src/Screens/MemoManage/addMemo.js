import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {Entypo} from '@expo/vector-icons';

export default function AddMemo() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <View style={styles.container}>

      <View style={styles.inputRow}>
        <Text style={styles.timeBox}>시간</Text>
        <TextInput
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
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

        <TouchableOpacity>
          <Text style={styles.footerBtn}>저장</Text>
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
  contentInput: {
    height: '80%',
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
});