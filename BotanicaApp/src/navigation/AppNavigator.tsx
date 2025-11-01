import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MenuScreen from '../screens/MenuScreen';
import HallMapScreen from '../screens/HallMapScreen';
import ProfileStack from './ProfileStack';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Menu"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarStyle: {
            paddingVertical: 5,
          },
        }}
      >
        <Tab.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            title: '🍽️ Меню Botanica',
            tabBarLabel: 'Меню',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🍽️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="HallMap"
          component={HallMapScreen}
          options={{
            title: 'Схема зала',
            tabBarLabel: 'Схема зала',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🗺️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            title: 'Профиль',
            tabBarLabel: 'Профиль',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>👤</Text>
            ),
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'О нас',
            tabBarLabel: 'О нас',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>ℹ️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}