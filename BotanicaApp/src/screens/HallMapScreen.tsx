import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  PanResponder,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Table } from '../types';
import { hallMapStyles } from '../styles/hallMapStyles';
import TableReservationModal from './TableReservationScreen';

const { width } = Dimensions.get('window');

export default function HallMapScreen() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTableData, setSelectedTableData] = useState<Table | null>(null);

  // Функция для получения времени открытия (12:00 текущего дня)
  const getOpeningTime = (date: Date) => {
    const opening = new Date(date);
    opening.setHours(12, 0, 0, 0);
    return opening;
  };

  // Функция для получения времени закрытия (04:00 следующего дня)
  const getClosingTime = (date: Date) => {
    const closing = new Date(date);
    closing.setDate(closing.getDate() + 1);
    closing.setHours(4, 0, 0, 0);
    return closing;
  };

  // Функция для корректировки времени окончания в пределах рабочего дня
  const adjustEndTimeToLimit = (time: Date) => {
    const closingTime = getClosingTime(time);
    return time > closingTime ? new Date(closingTime) : new Date(time);
  };

  // Функция для проверки, находится ли время в рабочих пределах
  const isTimeInWorkingHours = (time: Date) => {
    const openingTime = getOpeningTime(time);
    const closingTime = getClosingTime(time);
    return time >= openingTime && time <= closingTime;
  };

  // Функция для получения минимального времени начала
  const getMinStartTime = () => {
    const now = new Date();
    const openingTime = getOpeningTime(now);
    return now > openingTime ? new Date(now) : new Date(openingTime);
  };

  // Функция для получения максимального времени окончания
  const getMaxEndTime = (startTime: Date) => {
    return getClosingTime(startTime);
  };

  // Состояния для времени бронирования
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    // Устанавливаем минимальное время начала - 12:00 текущего дня
    const minStart = new Date(now);
    if (now.getHours() < 12) {
      minStart.setHours(12, 0, 0, 0);
    } else {
      // Если уже после 12:00, начинаем с текущего времени
      minStart.setMinutes(now.getMinutes() + 5); // +5 минут для удобства
    }
    return minStart;
  });

  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    const defaultEnd = new Date(now);
    // Устанавливаем время окончания по умолчанию на 2 часа вперед, но не позже 04:00 следующего дня
    defaultEnd.setHours(now.getHours() + 2, 0, 0, 0);
    return adjustEndTimeToLimit(defaultEnd);
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Рефы для хранения состояния жестов
  const transformRef = useRef(transform);
  const panStartRef = useRef({
    translateX: 0,
    translateY: 0,
    scale: 1,
  });
  const zoomStartRef = useRef({
    distance: 0,
    scale: 1,
  });

  // Обновляем transformRef при изменении transform
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Создаем PanResponder для обработки жестов
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 5 || Math.abs(dy) > 5;
      },

      onPanResponderGrant: (evt, gs) => {
        const touches = evt.nativeEvent.touches;

        panStartRef.current = {
          translateX: transformRef.current.translateX,
          translateY: transformRef.current.translateY,
          scale: transformRef.current.scale,
        };

        if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          zoomStartRef.current = {
            distance: distance,
            scale: transformRef.current.scale,
          };
        }
      },

      onPanResponderMove: (evt, gs) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 1) {
          const sensitivity = Platform.OS === 'android' ? 1.2 : 0.8;
          const newTranslateX = panStartRef.current.translateX + (gs.dx / panStartRef.current.scale) * sensitivity;
          const newTranslateY = panStartRef.current.translateY + (gs.dy / panStartRef.current.scale) * sensitivity;

          setTransform(prev => ({
            ...prev,
            translateX: newTranslateX,
            translateY: newTranslateY
          }));
        }
        else if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const currentDistance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          if (zoomStartRef.current.distance > 0) {
            const scaleChange = currentDistance / zoomStartRef.current.distance;
            const newScale = Math.max(0.3, Math.min(3, zoomStartRef.current.scale * scaleChange));

            setTransform(prev => ({
              ...prev,
              scale: newScale
            }));
          }
        }
      },

      onPanResponderRelease: () => {
        zoomStartRef.current.distance = 0;
      },

      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // Данные столов с описаниями
  const tables: Table[] = [
    {
      id: '1', number: 1, isAvailable: true, position: { x: 50, y: 50 },
      description: 'Уютный угловой столик у окна с видом на сад. Идеален для романтического вечера.',
      maxPeople: 4,
    },
    {
      id: '2', number: 2, isAvailable: true, position: { x: 150, y: 50 },
      description: 'Центральный столик в главном зале. Подходит для деловых встреч.',
      maxPeople: 6,
    },
    {
      id: '3', number: 3, isAvailable: false, position: { x: 250, y: 50 },
      description: 'VIP столик с отдельной зоной для кальяна.',
      maxPeople: 8,
    },
    { id: '4', number: 4, isAvailable: true, position: { x: 350, y: 50 }, description: 'Компактный столик для двоих.', maxPeople: 2 },
    { id: '5', number: 5, isAvailable: true, position: { x: 450, y: 50 }, description: 'Просторный столик с мягкими диванами.', maxPeople: 6 },
    { id: '6', number: 6, isAvailable: true, position: { x: 50, y: 150 }, description: 'Стандартный столик', maxPeople: 4 },
    { id: '7', number: 7, isAvailable: false, position: { x: 150, y: 150 }, description: 'VIP зона', maxPeople: 8 },
    { id: '8', number: 8, isAvailable: true, position: { x: 250, y: 150 }, description: 'Угловой столик', maxPeople: 4 },
    { id: '9', number: 9, isAvailable: true, position: { x: 350, y: 150 }, description: 'Центральный столик', maxPeople: 6 },
    { id: '10', number: 10, isAvailable: true, position: { x: 450, y: 150 }, description: 'Барная стойка', maxPeople: 2 },
  ];

  // Обработчики для выбора времени
  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const minStartTime = getMinStartTime();
      let newStartTime = selectedDate < minStartTime ? new Date(minStartTime) : new Date(selectedDate);

      // Проверяем, что время начала в рабочих пределах
      if (!isTimeInWorkingHours(newStartTime)) {
        newStartTime = getOpeningTime(newStartTime);
      }

      setStartTime(newStartTime);

      // Автоматически обновляем время окончания
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newStartTime.getHours() + 2);
      setEndTime(adjustEndTimeToLimit(newEndTime));
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const maxEndTime = getMaxEndTime(startTime);
      let newEndTime = selectedDate;

      if (newEndTime <= startTime) {
        Alert.alert('Ошибка', 'Время окончания должно быть позже времени начала');
        return;
      }

      if (newEndTime > maxEndTime) {
        Alert.alert('Ограничение', 'Бронирование возможно только до 04:00 следующего дня');
        newEndTime = new Date(maxEndTime);
      }

      setEndTime(newEndTime);
    }
  };

  // Функции для переключения (toggle) пикеров
  const openStartTimePicker = () => {
    if (showStartPicker) {
      setShowStartPicker(false);
    } else {
      setShowEndPicker(false);
      setShowStartPicker(true);
    }
  };

  const openEndTimePicker = () => {
    if (showEndPicker) {
      setShowEndPicker(false);
    } else {
      setShowStartPicker(false);
      setShowEndPicker(true);
    }
  };

  // Форматирование времени для отображения
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateCompact = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return 'сегодня';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isTomorrow) {
      return 'завтра';
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'numeric',
    }).replace('/', '.');
  };

  // Обработчик выбора стола
  const handleTableSelect = (table: Table) => {
    if (!table.isAvailable) {
      Alert.alert('Стол занят', `Стол №${table.number} в настоящее время занят`);
      return;
    }

    // Закрываем все открытые пикеры при выборе стола
    setShowStartPicker(false);
    setShowEndPicker(false);

    if (Platform.OS === 'android') {
      setTimeout(() => {
        setSelectedTable(table.id);
        setSelectedTableData(table);
        setModalVisible(true);
      }, 50);
    } else {
      setSelectedTable(table.id);
      setSelectedTableData(table);
      setModalVisible(true);
    }
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTable(null);
  };

  // Обработчик добавления в заказ
  const handleAddToOrder = (reservationData: any) => {
    const formatDateTime = (date: Date) => {
      return `${formatDateCompact(date)} ${formatTime(date)}`;
    };

    Alert.alert(
      'Добавлено в заказ',
      `Стол №${reservationData.table.number} забронирован\nС ${formatDateTime(reservationData.startTime)} по ${formatDateTime(reservationData.endTime)}\nДля ${reservationData.peopleCount} человек(а)`
    );
    setModalVisible(false);
    setSelectedTable(null);
  };

  // Обработчик масштабирования кнопками
  const handleZoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale + 0.2, 3)
    }));
  };

  const handleZoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale - 0.2, 0.3)
    }));
  };

  // Функция сброса карты
  const handleResetMap = () => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  };

  // Рендер отдельного стола на карте
  const renderTable = (table: Table) => (
    <TouchableOpacity
      key={table.id}
      style={[
        hallMapStyles.table,
        !table.isAvailable && hallMapStyles.tableOccupied,
        selectedTable === table.id && hallMapStyles.tableSelected,
        Platform.OS === 'android' && hallMapStyles.tableAndroid,
        {
          left: table.position.x,
          top: table.position.y,
        }
      ]}
      onPress={() => handleTableSelect(table)}
      disabled={!table.isAvailable}
      activeOpacity={0.7}
      delayPressIn={0}
    >
      <Text style={[
        hallMapStyles.tableNumber,
        Platform.OS === 'android' && hallMapStyles.tableNumberAndroid
      ]}>
        {table.number}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={hallMapStyles.container}>
      <View style={hallMapStyles.content}>
        {/* Панель выбора времени */}
        <View style={hallMapStyles.timeSelectionPanel}>
          <Text style={hallMapStyles.timeSelectionTitle}>Время бронирования</Text>
          <Text style={hallMapStyles.timeRestrictionText}>Доступно с 12:00 до 04:00 следующего дня</Text>

          {/* Компактный горизонтальный layout */}
          <View style={hallMapStyles.timeSelectionRow}>
            {/* Время начала */}
            <View style={hallMapStyles.timePickerCompact}>
              <Text style={hallMapStyles.timePickerLabel}>Начало</Text>
              <TouchableOpacity
                style={[
                  hallMapStyles.timePickerButtonCompact,
                  showStartPicker && hallMapStyles.timePickerButtonActive
                ]}
                onPress={openStartTimePicker}
              >
                <Text style={[
                  hallMapStyles.timePickerTextCompact,
                  showStartPicker && hallMapStyles.timePickerTextActive
                ]}>
                  {formatTime(startTime)}
                </Text>
                <Text style={hallMapStyles.dateTextCompact}>
                  {formatDateCompact(startTime)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Разделитель */}
            <View style={hallMapStyles.timeSeparator}>
              <Text style={hallMapStyles.timeSeparatorText}>→</Text>
            </View>

            {/* Время окончания */}
            <View style={hallMapStyles.timePickerCompact}>
              <Text style={hallMapStyles.timePickerLabel}>Окончание</Text>
              <TouchableOpacity
                style={[
                  hallMapStyles.timePickerButtonCompact,
                  showEndPicker && hallMapStyles.timePickerButtonActive
                ]}
                onPress={openEndTimePicker}
              >
                <Text style={[
                  hallMapStyles.timePickerTextCompact,
                  showEndPicker && hallMapStyles.timePickerTextActive
                ]}>
                  {formatTime(endTime)}
                </Text>
                <Text style={hallMapStyles.dateTextCompact}>
                  {formatDateCompact(endTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Пикеры с ограничениями */}
          {showStartPicker && (
            <View style={hallMapStyles.pickerContainer}>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartTimeChange}
                minimumDate={getMinStartTime()}
                maximumDate={getMaxEndTime(startTime)}
              />
            </View>
          )}

          {showEndPicker && (
            <View style={hallMapStyles.pickerContainer}>
              <DateTimePicker
                value={endTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndTimeChange}
                minimumDate={startTime}
                maximumDate={getMaxEndTime(startTime)}
              />
            </View>
          )}
        </View>

        {/* Контейнер карты с жестами */}
        <View
          style={[
            hallMapStyles.mapContainer,
            Platform.OS === 'android' && hallMapStyles.mapContainerAndroid
          ]}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              hallMapStyles.simpleMap,
              {
                transform: [
                  { translateX: transform.translateX },
                  { translateY: transform.translateY },
                  { scale: transform.scale }
                ]
              }
            ]}
          >
            {/* Отрисовка столов */}
            {tables.map(renderTable)}
          </View>

          {/* Элементы управления поверх карты */}
          <View style={hallMapStyles.controlsOverlay}>
            <View style={hallMapStyles.zoomControlsOverlay}>
              <TouchableOpacity
                style={hallMapStyles.zoomButtonOverlay}
                onPress={handleZoomIn}
                activeOpacity={0.7}
              >
                <Text style={hallMapStyles.zoomButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={hallMapStyles.zoomButtonOverlay}
                onPress={handleZoomOut}
                activeOpacity={0.7}
              >
                <Text style={hallMapStyles.zoomButtonText}>-</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={hallMapStyles.resetButtonOverlay}
              onPress={handleResetMap}
              activeOpacity={0.7}
            >
              <Text style={hallMapStyles.resetButtonText}>⟲ Сброс</Text>
            </TouchableOpacity>
          </View>

          {/* Информация о масштабе поверх карты */}
          <View style={hallMapStyles.scaleInfoOverlay}>
            <Text style={hallMapStyles.scaleText}>Масштаб: {Math.round(transform.scale * 100)}%</Text>
          </View>
        </View>

        {/* Легенда под картой */}
        <View style={hallMapStyles.legend}>
          <View style={hallMapStyles.legendItem}>
            <View style={[hallMapStyles.legendColor, hallMapStyles.available]} />
            <Text style={hallMapStyles.legendText}>Свободен</Text>
          </View>
          <View style={hallMapStyles.legendItem}>
            <View style={[hallMapStyles.legendColor, hallMapStyles.occupied]} />
            <Text style={hallMapStyles.legendText}>Занят</Text>
          </View>
          <View style={hallMapStyles.legendItem}>
            <View style={[hallMapStyles.legendColor, hallMapStyles.selected]} />
            <Text style={hallMapStyles.legendText}>Выбран</Text>
          </View>
        </View>
      </View>

      {/* Модальное окно бронирования стола */}
      <TableReservationModal
        visible={modalVisible}
        table={selectedTableData}
        startTime={startTime}
        endTime={endTime}
        onClose={handleCloseModal}
        onAddToOrder={handleAddToOrder}
      />
    </View>
  );
}