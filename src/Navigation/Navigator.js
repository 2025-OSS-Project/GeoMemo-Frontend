import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';
import EmailVerification from '../Screens/Auth/EmailVerification';
import UserInfoInput from '../Screens/Auth/UserInfoInput'
import MemoMap from '../Screens/Main/Home';

const Stack = createNativeStackNavigator();

export default function Navigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="EmailVerification" component={EmailVerification} />
      <Stack.Screen name="UserInfoInput" component={UserInfoInput} />
      <Stack.Screen name="MemoMap" component={MemoMap} />
    </Stack.Navigator>
  );
}
