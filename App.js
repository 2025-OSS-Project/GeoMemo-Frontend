import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './src/Navigation/Navigator';

export default function App() {
  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
}
