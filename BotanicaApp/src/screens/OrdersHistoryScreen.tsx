import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { orderHistoryStyles } from '../styles/ordersHistoryStyles';

// Mock данные для заказов
const ordersData = [
  {
    id: '1',
    orderNumber: '0001',
    date: '2023-10-01',
    time: '19:30',
    tableNumber: '5',
    items: [
      { name: 'Кальян Apple', quantity: 1, price: 1200 },
      { name: 'Чай зеленый', quantity: 2, price: 300 },
      { name: 'Пирог вишневый', quantity: 1, price: 450 },
    ],
    total: 2250,
    status: 'completed'
  },
  {
    id: '2',
    orderNumber: '0002',
    date: '2023-10-02',
    time: '20:15',
    tableNumber: '3',
    items: [
      { name: 'Кальян Grape', quantity: 1, price: 1300 },
      { name: 'Кофе латте', quantity: 1, price: 350 },
      { name: 'Тирамису', quantity: 1, price: 500 },
    ],
    total: 2150,
    status: 'completed'
  },
  {
    id: '3',
    orderNumber: '0003',
    date: '2023-10-03',
    time: '21:00',
    tableNumber: '7',
    items: [
      { name: 'Кальян Mint', quantity: 1, price: 1100 },
      { name: 'Сок апельсиновый', quantity: 1, price: 250 },
      { name: 'Чизкейк', quantity: 1, price: 480 },
      { name: 'Мороженое', quantity: 2, price: 300 },
    ],
    total: 2430,
    status: 'completed'
  },
  {
    id: '4',
    orderNumber: '0004',
    date: '2023-10-04',
    time: '18:45',
    tableNumber: '12',
    items: [
      { name: 'Кальян Tropical', quantity: 1, price: 1400 },
      { name: 'Мохито', quantity: 3, price: 400 },
      { name: 'Начос', quantity: 1, price: 650 },
    ],
    total: 3250,
    status: 'completed'
  },
];

export default function OrderHistoryScreen({ navigation }: any) {
  const handleOrderPress = (order: any) => {
    Alert.alert(
      `Заказ #${order.orderNumber}`,
      `Столик: ${order.tableNumber}\nДата: ${order.date} ${order.time}\nОбщая сумма: ${order.total} руб.`
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ScrollView style={orderHistoryStyles.container}>
      {/* Заголовок */}
      <View style={orderHistoryStyles.header}>
        <TouchableOpacity
          style={orderHistoryStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={orderHistoryStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={orderHistoryStyles.headerTitle}>История заказов</Text>
      </View>

      <View style={orderHistoryStyles.content}>
        {/* Статистика */}
        <View style={orderHistoryStyles.stats}>
          <View style={orderHistoryStyles.statItem}>
            <Text style={orderHistoryStyles.statNumber}>{ordersData.length}</Text>
            <Text style={orderHistoryStyles.statLabel}>Всего заказов</Text>
          </View>
          <View style={orderHistoryStyles.statItem}>
            <Text style={orderHistoryStyles.statNumber}>
              {ordersData.reduce((sum, order) => sum + order.total, 0)} ₽
            </Text>
            <Text style={orderHistoryStyles.statLabel}>Общая сумма</Text>
          </View>
        </View>

        {/* Список заказов */}
        <View style={orderHistoryStyles.ordersList}>
          {ordersData.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={orderHistoryStyles.orderCard}
              onPress={() => handleOrderPress(order)}
              activeOpacity={0.7}
            >
              {/* Заголовок заказа */}
              <View style={orderHistoryStyles.orderHeader}>
                <View>
                  <Text style={orderHistoryStyles.orderNumber}>
                    Заказ #{order.orderNumber}
                  </Text>
                  <Text style={orderHistoryStyles.orderDateTime}>
                    {formatDate(order.date)} в {order.time}
                  </Text>
                </View>
                <View style={orderHistoryStyles.orderStatus}>
                  <Text style={orderHistoryStyles.statusText}>
                    {order.status === 'completed' ? '✅ Выполнен' : '🔄 В процессе'}
                  </Text>
                </View>
              </View>

              {/* Информация о столике */}
              <View style={orderHistoryStyles.tableInfo}>
                <Text style={orderHistoryStyles.tableText}>
                  Столик: <Text style={orderHistoryStyles.tableNumber}>№{order.tableNumber}</Text>
                </Text>
              </View>

              {/* Список блюд */}
              <View style={orderHistoryStyles.itemsSection}>
                <Text style={orderHistoryStyles.itemsTitle}>Заказанные блюда:</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={orderHistoryStyles.itemRow}>
                    <Text style={orderHistoryStyles.itemName}>
                      • {item.name}
                    </Text>
                    <Text style={orderHistoryStyles.itemDetails}>
                      x{item.quantity} - {item.price * item.quantity} ₽
                    </Text>
                  </View>
                ))}
              </View>

              {/* Итоговая сумма */}
              <View style={orderHistoryStyles.orderFooter}>
                <Text style={orderHistoryStyles.totalText}>
                  Итого: <Text style={orderHistoryStyles.totalAmount}>{order.total} ₽</Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}