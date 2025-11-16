import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import WebHomeScreen, { WebHeader } from '../screens/WebHomeScreen';
import MenuScreen from '../screens/MenuScreen'; 
import WebProfileScreen from '../screens/WebProfileScreen';
import HallMapScreen from '../screens/HallMapScreen';
import TableReservationModal from '../screens/TableReservationScreen';
import OrderHistoryScreen from '../screens/OrdersHistoryScreen';
import WebAboutScreen from '../screens/WebAboutScreen'; // Добавлен импорт WebAboutScreen

const Stack = createNativeStackNavigator();

function MenuScreenWrapper({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="Menu" />
      <MenuScreen />
    </View>
  );
}

function HallMapScreenWrapper({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="HallMap" />
      <HallMapScreen />
    </View>
  );
}

function ProfileScreenWrapper({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="Profile" />
      <WebProfileScreen navigation={navigation} />
    </View>
  );
}

function AboutScreenWrapper({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="About" />
      <WebAboutScreen navigation={navigation} /> {/* Изменено на WebAboutScreen */}
    </View>
  );
}

function OrderHistoryScreenWrapper({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="OrderHistory" />
      <OrderHistoryScreen navigation={navigation} />
    </View>
  );
}

function TableReservationWrapper({ route, navigation }: any) {
  const { table } = route.params || {};
  if (!table) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
        <WebHeader navigation={navigation} currentScreen="HallMap" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Стол не выбран</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#4CAF50' }}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1f0a' }}>
      <WebHeader navigation={navigation} currentScreen="HallMap" />
      <TableReservationModal
        visible={true}
        table={table}
        startTime={new Date()}
        endTime={new Date(Date.now() + 2 * 60 * 60 * 1000)}
        onClose={() => navigation.goBack()}
        onAddToOrder={(data) => {
          console.log('Бронь добавлена:', data);
          navigation.goBack();
        }}
      />
    </View>
  );
}

export default function WebNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a1f0a' }
        }}
      >
        <Stack.Screen name="Home" component={WebHomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreenWrapper} />
        <Stack.Screen name="HallMap" component={HallMapScreenWrapper} />
        <Stack.Screen name="Profile" component={ProfileScreenWrapper} />
        <Stack.Screen name="About" component={AboutScreenWrapper} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreenWrapper} />
        <Stack.Screen name="TableReservation" component={TableReservationWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}