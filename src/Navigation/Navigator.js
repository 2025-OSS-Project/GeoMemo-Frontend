import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';
import EmailVerification from '../Screens/Auth/EmailVerification';
import UserInfoInput from '../Screens/Auth/UserInfoInput'
import MemoMap from '../Screens/Main/Home';
import MemoManager from '../Screens/MemoManage/MemoManager'
import AddMemo from '../Screens/MemoManage/addMemo'
import ThisMemoView from '../Screens/MemoManage/thisMemoView' 
import AllMemoView from '../Screens/MemoManage/allMemoView' 
import MyProfile from '../Screens/Profile/myProfile'
import OtherProfile from '../Screens/Profile/otherProfile'
import MemoView from '../Screens/Profile/memoView'

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
    </Stack.Navigator>
    
  );
}
