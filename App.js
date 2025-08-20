import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Navigator from './src/Navigation/Navigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={true} />
      <NavigationContainer>
        <Navigator/>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
