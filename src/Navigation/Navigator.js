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

const Stack = createNativeStackNavigator();

export default function Navigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="EmailVerification" component={EmailVerification} />
      <Stack.Screen name="UserInfoInput" component={UserInfoInput} />
      <Stack.Screen name="MemoMap" component={MemoMap} options={{ headerShown: false }}/>
      <Stack.Screen name="MemoManager" component={MemoManager} />
      <Stack.Screen name="AddMemo" component={AddMemo} />
      <Stack.Screen name="ThisMemoView" component={ThisMemoView} />
      <Stack.Screen name="AllMemoView" component={AllMemoView} />
      <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }}/>
      <Stack.Screen name="OtherProfile" component={OtherProfile} options={{ headerShown: false }}/>
      <Stack.Screen name="MemoView" component={MemoView} options={{ headerShown: false }}/>
      <Stack.Screen name="SettingsHome" component={SettingsHome}/>
      <Stack.Screen name="EditProfile" component={EditProfile}/>
      <Stack.Screen name="ChangeNickname" component={ChangeNickname}/>
      <Stack.Screen name="ChangePassword" component={ChangePassword}/>
      <Stack.Screen name="Follower" component={Follower}/>
      <Stack.Screen name="Following" component={Following}/>
    </Stack.Navigator>
    
  );
}
