import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Экран меню
function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Меню Botanica</Text>
      <Text>Список позиций меню будет здесь</Text>
    </View>
  );
}

// Экран профиля
function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Профиль</Text>
      <Text>Информация о пользователе</Text>
    </View>
  );
}

// Экран схемы зала
function HallMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Схема зала</Text>
      <Text>Схема столов для бронирования</Text>
    </View>
  );
}

// Экран "О нас"
function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ℹ️ О нас</Text>
      <Text>Информация о кафе Botanica</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Menu" // ← ДОЛЖНО СОВПАДАТЬ С name ниже
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#2E7D32',
        }}
      >
        {/* Убедись что name="Menu" совпадает с initialRouteName */}
        <Tab.Screen 
          name="Menu"  // ← ЭТО ИМЯ ДОЛЖНО СОВПАДАТЬ
          component={MenuScreen}
          options={{
            title: 'Меню', // Это отображаемый заголовок
            tabBarIcon: ({ color, size }) => (
              <Text>🍽️</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="HallMap" 
          component={HallMapScreen}
          options={{
            title: 'Схема зала',
            tabBarIcon: ({ color, size }) => (
              <Text>🗺️</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color, size }) => (
              <Text>👤</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="About" 
          component={AboutScreen}
          options={{
            title: 'О нас',
            tabBarIcon: ({ color, size }) => (
              <Text>ℹ️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },
});