import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';

const Stack = createNativeStackNavigator();

export default function Navigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
}
