import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

export default function ProfileScreen() {
  return (
    <View style={commonStyles.simpleContainer}>
      <Text style={commonStyles.simpleTitle}>👤 Профиль</Text>
      <Text>Информация о пользователе</Text>
    </View>
  );
}