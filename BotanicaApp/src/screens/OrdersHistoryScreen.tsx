import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTable } from '../contexts/TableContext';
import { ApiService } from '../services/api';
import { Order, Table } from '../types';
import { orderHistoryStyles } from '../styles/ordersHistoryStyles';
import OrderContextMenu from '../components/OrderContextMenu';


export default function OrderHistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const { refreshTables } = useTable();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tablesScrollRef = useRef<ScrollView>(null);
  const tablePositions = useRef<{ [key: string]: number }>({});


  // Загрузка всех данных
  const loadAllData = async () => {
    try {
      setError(null);
      let ordersData: Order[] = [];
      let tablesData: Table[] = [];

      if (user?.role === 'admin') {
        // Для администратора - все заказы и все столики
        const [ordersResponse, tablesResponse] = await Promise.all([
          ApiService.getAllOrders(),
          ApiService.getTables(
            new Date().toISOString(),
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          )
        ]);
        ordersData = ordersResponse.orders || [];
        tablesData = tablesResponse.tables || [];

        console.log('🛠️ Admin: loaded tables from API');
      } else {
        // Для обычного пользователя
        if (!user?.id) {
          Alert.alert('Ошибка', 'Пользователь не авторизован');
          return;
        }

        console.log('📊 Final tables data:', tablesData);
        console.log('📦 Final orders data:', ordersData.map(o => ({
          id: o.id,
          table_id: o.table_id,
          table_name: o.table_name
        })));


        const ordersResponse = await ApiService.getUserOrders(user.id);
        ordersData = ordersResponse.orders || [];

        // Собираем уникальные столики из заказов пользователя
        const uniqueTables: Table[] = [];
        const tableIds = new Set();

        ordersData.forEach(order => {
          // Используем table_id для идентификации столика
          if (order.table_id && !tableIds.has(order.table_id)) {
            tableIds.add(order.table_id);

            // Создаем объект столика на основе данных из заказа
            uniqueTables.push({
              id: order.table_id,
              number: order.table_name ? parseInt(order.table_name.replace('Стол ', '')) || 0 : 0,
              isAvailable: true,
              position: { x: 0, y: 0 },
              description: order.table_description || `Стол ${order.table_name || order.table_id}`,
              maxPeople: order.table_capacity || 4
            });
          }
        });

        tablesData = uniqueTables;

        console.log('📊 Пользователь: загружено заказов:', ordersData.length);
        console.log('📊 Пользователь: уникальных столиков:', tablesData.length);
        console.log('📊 ID столиков:', Array.from(tableIds));
      }

      setAllOrders(ordersData);
      setTables(tablesData);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Не удалось загрузить историю заказов');
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      await loadAllData();
      setInitialLoading(false);
    };

    initializeData();
  }, [user]);

  // Обновление при pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [user]);

  // Обработчик выбора столика с автоскроллом
  const handleTableSelect = useCallback((tableId: string | null) => {
    console.log('🔄 Table selected:', tableId);
    console.log('📊 All tables:', tables.map(t => ({ id: t.id, number: t.number })));
    console.log('📦 All orders:', allOrders.map(o => ({ id: o.id, table_id: o.table_id, table_name: o.table_name })));

    setSelectedTable(tableId);

    // Автоскролл к выбранному столику
    if (tableId && tablePositions.current[tableId] !== undefined) {
      setTimeout(() => {
        tablesScrollRef.current?.scrollTo({
          x: tablePositions.current[tableId] - 100,
          animated: true
        });
      }, 100);
    }
  }, [tables, allOrders]);

  // В useMemo для filteredOrders добавьте логи
  const filteredOrders = useMemo(() => {
  console.log('🎯 Filtering orders - selectedTable:', selectedTable);
  console.log('📋 Total orders:', allOrders.length);
  
  if (!selectedTable) {
    console.log('✅ Showing ALL orders');
    return allOrders;
  }
  
  const filtered = allOrders.filter(order => {
    // Приводим оба значения к строке для сравнения
    const orderTableId = order.table_id?.toString();
    const selectedTableId = selectedTable.toString();
    const matches = orderTableId === selectedTableId;
    
    console.log(`📝 Order ${order.id} - table_id: ${orderTableId}, selected: ${selectedTableId}, matches: ${matches}`);
    return matches;
  });
  
  console.log('🔍 Filtered orders count:', filtered.length);
  return filtered;
}, [allOrders, selectedTable]);

  // Сохранение позиций столиков для скролла
  const saveTablePosition = useCallback((tableId: string, x: number) => {
    tablePositions.current[tableId] = x;
  }, []);

  // Обработчик действий контекстного меню
  const handleContextMenuAction = useCallback(async (action: string, order: Order) => {
    try {
      let success = false;

      switch (action) {
        case 'cancel':
          if (order.status !== 'в работе') {
            Alert.alert('Ошибка', 'Можно отменять только заказы в работе');
            return;
          }

          await ApiService.cancelOrder(order.id);
          // Обновляем статус заказа локально
          setAllOrders(prev => prev.map(o =>
            o.id === order.id ? { ...o, status: 'отменен' } : o
          ));
          Alert.alert('Успех', 'Заказ успешно отменен');
          success = true;
          break;

        case 'complete':
          if (order.status !== 'в работе') {
            Alert.alert('Ошибка', 'Можно выполнять только заказы в работе');
            return;
          }

          await ApiService.completeOrder(order.id);
          // Обновляем статус заказа локально
          setAllOrders(prev => prev.map(o =>
            o.id === order.id ? { ...o, status: 'выполнен' } : o
          ));
          Alert.alert('Успех', 'Заказ выполнен');
          success = true;
          break;

        case 'delete':
          Alert.alert(
            'Удаление заказа',
            'Вы уверены, что хотите удалить этот заказ?',
            [
              { text: 'Отмена', style: 'cancel' },
              {
                text: 'Удалить',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await ApiService.deleteOrder(order.id);
                    // Удаляем заказ из списка
                    setAllOrders(prev => prev.filter(o => o.id !== order.id));
                    refreshTables();
                    Alert.alert('Успех', 'Заказ успешно удален');
                    success = true;
                  } catch (error) {
                    Alert.alert('Ошибка', 'Не удалось удалить заказ');
                  }
                }
              }
            ]
          );
          // Для delete не закрываем меню сразу - ждем подтверждения
          return;

        default:
          break;
      }

      // После успешного выполнения действия (кроме delete) обновляем столики
      if (success) {
        refreshTables();
      }

    } catch (error) {
      console.error('Ошибка выполнения действия:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить действие');
    } finally {
      setContextMenuVisible(false);
      setSelectedOrder(null);
    }
  }, [refreshTables]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение статуса заказа с цветом
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'в работе':
        return { text: '🔄 В работе', color: '#FFA000' };
      case 'выполнен':
        return { text: '✅ Выполнен', color: '#2E7D32' };
      case 'отменен':
        return { text: '❌ Отменен', color: '#D32F2F' };
      case 'не выполнен':
        return { text: '⏰ Не выполнен', color: '#757575' };
      default:
        return { text: status, color: '#666' };
    }
  };

  // Рендер элемента заказа
  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getStatusInfo(item.status);
    const totalAmount = typeof item.total_amount === 'number'
      ? item.total_amount
      : parseFloat(item.total_amount || '0');

    return (
      <TouchableOpacity
        style={orderHistoryStyles.orderCard}
        onPress={() => {
          Alert.alert(
            `Заказ #${item.id}`,
            `Столик: ${item.table_name || 'Не указан'}\n` +
            `Дата: ${formatDate(item.created_at)}\n` +
            `Статус: ${statusInfo.text}\n` +
            `Гости: ${item.guests_count || 'Не указано'}\n` +
            `Общая сумма: ${totalAmount.toFixed(0)} руб.`
          );
        }}
        onLongPress={() => {
          setSelectedOrder(item);
          setContextMenuVisible(true);
        }}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={orderHistoryStyles.orderHeader}>
          <View>
            <Text style={orderHistoryStyles.orderNumber}>
              Заказ #{item.id}
            </Text>
            <Text style={orderHistoryStyles.orderDateTime}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          <View style={[orderHistoryStyles.orderStatus, { backgroundColor: `${statusInfo.color}20` }]}>
            <Text style={[orderHistoryStyles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        <View style={orderHistoryStyles.tableInfo}>
          <Text style={orderHistoryStyles.tableText}>
            Столик: <Text style={orderHistoryStyles.tableNumber}>
              {item.table_name || 'Не указан'}
            </Text>
          </Text>
          {item.guests_count && (
            <Text style={orderHistoryStyles.guestsText}>
              Гости: {item.guests_count}
            </Text>
          )}
        </View>

        <View style={orderHistoryStyles.itemsSection}>
          <Text style={orderHistoryStyles.itemsTitle}>Заказанные блюда:</Text>
          {item.items && item.items.map((orderItem, index) => (
            <View key={index} style={orderHistoryStyles.itemRow}>
              <Text style={orderHistoryStyles.itemName}>
                • {orderItem.name}
              </Text>
              <Text style={orderHistoryStyles.itemDetails}>
                x{orderItem.quantity} - {orderItem.total_price} ₽
              </Text>
            </View>
          ))}
        </View>

        {item.notes && (
          <View style={orderHistoryStyles.notesSection}>
            <Text style={orderHistoryStyles.notesLabel}>Примечания:</Text>
            <Text style={orderHistoryStyles.notesText}>{item.notes}</Text>
          </View>
        )}

        <View style={orderHistoryStyles.orderFooter}>
          <Text style={orderHistoryStyles.totalText}>
            Итого: <Text style={orderHistoryStyles.totalAmount}>
              {totalAmount.toFixed(0)} ₽
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Рендер фильтра столиков
  const renderTableFilter = () => {
    if (tables.length === 0) return null;

    return (
      <View style={orderHistoryStyles.filterSection}>
        <Text style={orderHistoryStyles.filterTitle}>
          {user?.role === 'admin' ? 'Фильтр по столикам' : 'Мои столики'}
        </Text>
        <ScrollView
          ref={tablesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={orderHistoryStyles.tablesScroll}
          contentContainerStyle={orderHistoryStyles.tablesContainer}
        >
          {/* Кнопка "Все" */}
          <TouchableOpacity
            style={[
              orderHistoryStyles.tableFilterButton,
              selectedTable === null && orderHistoryStyles.tableFilterButtonActive
            ]}
            onPress={() => handleTableSelect(null)}
            onLayout={(event) => saveTablePosition('all', event.nativeEvent.layout.x)}
          >
            <Text style={[
              orderHistoryStyles.tableFilterText,
              selectedTable === null && orderHistoryStyles.tableFilterTextActive
            ]}>
              Все
            </Text>
          </TouchableOpacity>

          {/* Кнопки столиков */}
          {tables.map((table) => (
            <TouchableOpacity
              key={table.id}
              style={[
                orderHistoryStyles.tableFilterButton,
                selectedTable === table.id && orderHistoryStyles.tableFilterButtonActive
              ]}
              onPress={() => handleTableSelect(table.id)}
              onLayout={(event) => saveTablePosition(table.id, event.nativeEvent.layout.x)}
            >
              <Text style={[
                orderHistoryStyles.tableFilterText,
                selectedTable === table.id && orderHistoryStyles.tableFilterTextActive
              ]}>
                Стол {table.number}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Вычисление статистики
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalAmount = filteredOrders.reduce((sum, order) => {
      const amount = typeof order.total_amount === 'number'
        ? order.total_amount
        : parseFloat(order.total_amount || '0');
      return sum + amount;
    }, 0);
    const activeOrders = filteredOrders.filter(o => o.status === 'в работе').length;

    return { totalOrders, totalAmount, activeOrders };
  }, [filteredOrders]);

  if (initialLoading) {
    return (
      <View style={[orderHistoryStyles.container, orderHistoryStyles.centered]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={orderHistoryStyles.loadingText}>Загрузка заказов...</Text>
      </View>
    );
  }

  return (
    <View style={orderHistoryStyles.container}>
      {/* Заголовок */}
      <View style={orderHistoryStyles.header}>
        <TouchableOpacity
          style={orderHistoryStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={orderHistoryStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={orderHistoryStyles.headerTitle}>
          {user?.role === 'admin' ? 'Все заказы' : 'Мои заказы'}
        </Text>
      </View>

      {/* Статистика */}
      <View style={orderHistoryStyles.stats}>
        <View style={orderHistoryStyles.statItem}>
          <Text style={orderHistoryStyles.statNumber}>{stats.totalOrders}</Text>
          <Text style={orderHistoryStyles.statLabel}>Всего заказов</Text>
        </View>
        <View style={orderHistoryStyles.statItem}>
          <Text style={orderHistoryStyles.statNumber}>
            {stats.totalAmount.toFixed(0)} ₽
          </Text>
          <Text style={orderHistoryStyles.statLabel}>Общая сумма</Text>
        </View>
        {user?.role === 'admin' && (
          <View style={orderHistoryStyles.statItem}>
            <Text style={orderHistoryStyles.statNumber}>
              {stats.activeOrders}
            </Text>
            <Text style={orderHistoryStyles.statLabel}>В работе</Text>
          </View>
        )}
      </View>

      {/* Фильтр по столикам */}
      {renderTableFilter()}

      {/* Список заказов */}
      <View style={orderHistoryStyles.ordersContainer}>
        {error ? (
          <View style={orderHistoryStyles.errorContainer}>
            <Text style={orderHistoryStyles.errorText}>{error}</Text>
            <TouchableOpacity
              style={orderHistoryStyles.retryButton}
              onPress={loadAllData}
            >
              <Text style={orderHistoryStyles.retryButtonText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={orderHistoryStyles.emptyContainer}>
            <Text style={orderHistoryStyles.emptyIcon}>📦</Text>
            <Text style={orderHistoryStyles.emptyText}>
              {selectedTable
                ? `Нет заказов для выбранного столика`
                : 'Заказов пока нет'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2E7D32']}
                tintColor="#2E7D32"
              />
            }
            contentContainerStyle={orderHistoryStyles.ordersList}
            // Сохраняем позицию скролла при обновлениях
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
        )}
      </View>

      {/* Контекстное меню для заказов */}
      <OrderContextMenu
        visible={contextMenuVisible}
        order={selectedOrder}
        onClose={() => {
          setContextMenuVisible(false);
          setSelectedOrder(null);
        }}
        onAction={handleContextMenuAction}
      />
    </View>
  );
}