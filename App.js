import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Navigator from './src/Navigation/Navigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Navigator/>
    </NavigationContainer>
  );
}
