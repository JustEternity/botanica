import React from 'react';
import { Platform, UIManager } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Включаем анимации для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  return <AppNavigator />;
}