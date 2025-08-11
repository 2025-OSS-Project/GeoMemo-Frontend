import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';
import EmailVerification from '../Screens/Auth/EmailVerification';
import UserInfoInput from '../Screens/Auth/UserInfoInput'
import MemoMap from '../Screens/Main/Home';
import MemoManager from '../Screens/MemoManage/MemoManager'
import AddMemo from '../Screens/MemoManage/AddMemo'
import ThisMemoView from '../Screens/MemoManage/ThisMemoView'
import AllMemoView from '../Screens/MemoManage/AllMemoView'
import MyProfile from '../Screens/Profile/MyProfile'
import OtherProfile from '../Screens/Profile/OtherProfile'
import MemoView from '../Screens/Profile/MemoView'
import SettingsHome from '../Screens/Setting/SettingsHome';
import EditProfile from '../Screens/Setting/EditProfile'
import ChangeNickname from '../Screens/Setting/ChangeNickname'
import ChangePassword from '../Screens/Setting/ChangePassword'
import Follower from '../Screens/Profile/Follower'
import Following from '../Screens/Profile/Following'
import UserSearch from '../Screens/Profile/UserSearch'
import PrivacySetting from '../Screens/Setting/PrivacySetting'

const Stack = createNativeStackNavigator();

export default function Navigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 100, // 더 빠른 전환
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // 메모리 최적화
        unmountOnBlur: false,
        // 화면 전환 최적화
        presentation: 'card',
        // 전환 최적화
        gestureResponseDistance: 20, // 더 민감한 제스처
        gestureVelocityImpact: 0.8, // 더 빠른 제스처 반응
      }}
    >
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="EmailVerification" component={EmailVerification} />
      <Stack.Screen name="UserInfoInput" component={UserInfoInput} />
      <Stack.Screen
        name="MemoMap"
        component={MemoMap}
        options={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 50, // 극도로 빠른 페이드 전환
          // 홈으로 돌아갈 때 더 부드러운 전환
          gestureResponseDistance: 20,
          gestureVelocityImpact: 0.8,
          // 홈 화면은 메모리에 유지
          unmountOnBlur: false,
        }}
      />
      <Stack.Screen name="MemoManager" component={MemoManager} options={{ headerShown: false }} />
      <Stack.Screen name="AddMemo" component={AddMemo}/>
      <Stack.Screen name="ThisMemoView" component={ThisMemoView} />
      <Stack.Screen name="AllMemoView" component={AllMemoView} />
      <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
      <Stack.Screen name="OtherProfile" component={OtherProfile} options={{ headerShown: false }} />
      <Stack.Screen name="MemoView" component={MemoView} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsHome" component={SettingsHome} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangeNickname" component={ChangeNickname} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Follower" component={Follower} />
      <Stack.Screen name="Following" component={Following} />
      <Stack.Screen name="UserSearch" component={UserSearch} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacySetting" component={PrivacySetting} />
    </Stack.Navigator>

  );
}
