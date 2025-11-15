import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { WebHeader } from './WebHomeScreen';

export default function WebMenuScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="Menu" />
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: 'white', fontSize: 24, textAlign: 'center' }}>
          МЕНЮ BOTANICA
        </Text>
        {/* Твой контент меню */}
      </ScrollView>
    </View>
  );
}