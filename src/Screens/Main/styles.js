// styles/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  routeBox: {
    position: 'absolute',
    top: 180,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  routeButton: {
    marginRight: 10,
  },
  routeText: {
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
  slideUpPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#aaa',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  meButton: {
    backgroundColor: '#ddd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  memoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memoLabel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
  },
  memoBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  closeBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  filterBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    fontWeight: 'bold',
    fontSize: 13,
  },
  memoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  memoUserName: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
