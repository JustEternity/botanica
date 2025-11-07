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
import { ApiService } from '../services/api';

const { width } = Dimensions.get('window');

export default function HallMapScreen() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTableData, setSelectedTableData] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Функция для округления времени до ближайших 15 минут
  const roundToNearest15Minutes = (date: Date): Date => {
    const minutes = date.getMinutes();
    const remainder = minutes % 15;
    const roundedMinutes = remainder === 0 ? minutes : minutes + (15 - remainder);
    const newDate = new Date(date);
    newDate.setMinutes(roundedMinutes);
    newDate.setSeconds(0, 0);
    return newDate;
  };

  // Функция для принудительной установки минут в 00, 15, 30, 45
  const enforce15MinuteIntervals = (date: Date): Date => {
    const newDate = new Date(date);
    const minutes = newDate.getMinutes();
    const validMinutes = [0, 15, 30, 45];
    
    if (!validMinutes.includes(minutes)) {
      // Округляем до ближайших допустимых минут
      const remainder = minutes % 15;
      const roundedMinutes = remainder < 8 ? minutes - remainder : minutes + (15 - remainder);
      newDate.setMinutes(roundedMinutes);
      newDate.setSeconds(0, 0);
    }
    
    return newDate;
  };

  // Функция для получения ближайшего доступного времени
  const getNearestAvailableTime = (): { startTime: Date; endTime: Date } => {
    const now = new Date();
    const openingTime = getOpeningTime(now);
    
    // Если сейчас до открытия, возвращаем первое доступное время
    if (now < openingTime) {
      const start = new Date(openingTime);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      return { startTime: start, endTime: end };
    }

    // Округляем текущее время до ближайших 15 минут
    let roundedTime = roundToNearest15Minutes(now);
    
    // Если округленное время в прошлом, добавляем 15 минут
    if (roundedTime <= now) {
      roundedTime = new Date(roundedTime);
      roundedTime.setMinutes(roundedTime.getMinutes() + 15);
    }

    // Проверяем, что время в пределах рабочего дня
    const closingTime = getClosingTime(roundedTime);
    if (roundedTime >= closingTime) {
      // Если время после закрытия, возвращаем первое время следующего дня
      const nextDay = new Date(roundedTime);
      nextDay.setDate(nextDay.getDate() + 1);
      const start = getOpeningTime(nextDay);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      return { startTime: start, endTime: end };
    }

    const start = roundedTime;
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    
    // Корректируем конечное время, если оно выходит за пределы рабочего дня
    const adjustedEnd = adjustEndTimeToLimit(end);
    return { startTime: start, endTime: adjustedEnd };
  };

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
    const minTime = now > openingTime ? new Date(now) : new Date(openingTime);
    return enforce15MinuteIntervals(minTime);
  };

  // Функция для получения максимального времени окончания
  const getMaxEndTime = (startTime: Date) => {
    return getClosingTime(startTime);
  };

  // Состояния для времени бронирования
  const [startTime, setStartTime] = useState(() => {
    const { startTime: nearestStart } = getNearestAvailableTime();
    return enforce15MinuteIntervals(nearestStart);
  });

  const [endTime, setEndTime] = useState(() => {
    const { endTime: nearestEnd } = getNearestAvailableTime();
    return enforce15MinuteIntervals(nearestEnd);
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

  // Функция для безопасной валидации данных столов
  const validateTables = (tables: any[]): Table[] => {
    return tables
      .filter(table =>
        table &&
        table.id &&
        table.position &&
        typeof table.position.x === 'number' &&
        typeof table.position.y === 'number'
      )
      .map(table => ({
        ...table,
        position: {
          x: table.position?.x || 0,
          y: table.position?.y || 0
        },
        isAvailable: table.isAvailable !== undefined ? table.isAvailable : true,
        number: table.number || 0
      }));
  };

  // Fallback данные на случай проблем с сервером
  const getFallbackTables = (): Table[] => {
    const fallbackTables = [
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
    return fallbackTables;
  };

  // Загрузка столов с сервера
  const loadTables = async (isBackgroundUpdate: boolean = false) => {
    try {
      if (!isBackgroundUpdate) {
        setIsLoading(true);
      } else {
        setIsUpdating(true);
      }

      const response = await ApiService.getTables(
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (response.success && response.tables) {
        const validatedTables = validateTables(response.tables);
        setTables(validatedTables);
      } else {
        throw new Error('Не удалось загрузить столы');
      }
    } catch (err) {
      // Используем fallback данные
      const fallbackTables = getFallbackTables();
      setTables(fallbackTables);
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  // Загружаем столы при изменении времени
  useEffect(() => {
    loadTables(true);
  }, [startTime, endTime]);

  // Первоначальная загрузка
  useEffect(() => {
    loadTables(false);
  }, []);

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

  // Обработчики для выбора времени
  // Замените обработчики времени:

const handleStartTimeChange = (event: any, selectedDate?: Date) => {
  setShowStartPicker(false);
  if (selectedDate) {
    let newStartTime = selectedDate;
    
    // На Android принудительно корректируем минуты
    if (Platform.OS === 'android') {
      newStartTime = enforce15MinuteIntervals(selectedDate);
      
      // Показываем уведомление, если время было скорректировано
      const originalMinutes = selectedDate.getMinutes();
      if (![0, 15, 30, 45].includes(originalMinutes)) {
        Alert.alert(
          'Время скорректировано',
          `Время автоматически округлено до ${formatTime(newStartTime)}`,
          [{ text: 'OK' }]
        );
      }
    }

    const minStartTime = getMinStartTime();
    
    // Корректируем время, если оно меньше минимального
    if (newStartTime < minStartTime) {
      newStartTime = new Date(minStartTime);
    }

    // Проверяем, что время в рабочих пределах
    if (!isTimeInWorkingHours(newStartTime)) {
      newStartTime = getOpeningTime(newStartTime);
    }

    // Проверяем минимальный интервал перед установкой нового времени начала
    const currentEndTime = new Date(endTime);
    const minAllowedEndTime = new Date(newStartTime);
    minAllowedEndTime.setHours(newStartTime.getHours() + 1);

    if (currentEndTime < minAllowedEndTime) {
      // Если текущее время окончания меньше минимально допустимого, показываем ошибку
      // и не меняем время начала
      Alert.alert(
        'Недопустимый интервал',
        `Время окончания должно быть как минимум на 1 час позже времени начала. Текущее время окончания: ${formatTime(endTime)}`,
        [{ text: 'OK' }]
      );
      return; // Прерываем выполнение, не меняя время начала
    }

    setStartTime(newStartTime);
  }
};

const handleEndTimeChange = (event: any, selectedDate?: Date) => {
  setShowEndPicker(false);
  if (selectedDate) {
    let newEndTime = selectedDate;
    
    // На Android принудительно корректируем минуты
    if (Platform.OS === 'android') {
      newEndTime = enforce15MinuteIntervals(selectedDate);
      
      // Показываем уведомление, если время было скорректировано
      const originalMinutes = selectedDate.getMinutes();
      if (![0, 15, 30, 45].includes(originalMinutes)) {
        Alert.alert(
          'Время скорректировано',
          `Время автоматически округлено до ${formatTime(newEndTime)}`,
          [{ text: 'OK' }]
        );
      }
    }

    const maxEndTime = getMaxEndTime(startTime);

    // Проверяем минимальный интервал в 1 час
    const minEndTime = new Date(startTime);
    minEndTime.setHours(startTime.getHours() + 1);
    
    if (newEndTime <= minEndTime) {
      Alert.alert(
        'Ошибка', 
        'Минимальное время бронирования - 1 час',
        [{ text: 'OK' }]
      );
      // Не устанавливаем новое время, оставляем предыдущее корректное значение
      return;
    }

    // Проверяем максимальное время
    if (newEndTime > maxEndTime) {
      Alert.alert(
        'Ограничение', 
        'Бронирование возможно только до 04:00 следующего дня',
        [{ text: 'OK' }]
      );
      // Не устанавливаем новое время, оставляем предыдущее корректное значение
      return;
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
    // Блокируем нажатия во время обновления
    if (isUpdating) {
      return;
    }

    if (!table?.isAvailable) {
      Alert.alert('Стол занят', `Стол №${table?.number} в настоящее время занят`);
      return;
    }

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
    // Перезагружаем столы для обновления доступности
    loadTables(true);
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
    // Перезагружаем столы для обновления доступности
    loadTables(true);
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

  // Рендер отдельного стола на карте с защитой от undefined
  const renderTable = (table: Table) => {
    // Защита от undefined
    if (!table || !table.position) {
      return null;
    }

    const position = table.position || { x: 0, y: 0 };
    const tableNumber = table.number || '?';
    const isAvailable = table.isAvailable !== undefined ? table.isAvailable : true;

    return (
      <TouchableOpacity
        key={table.id}
        style={[
          hallMapStyles.table,
          !isAvailable && hallMapStyles.tableOccupied,
          selectedTable === table.id && hallMapStyles.tableSelected,
          Platform.OS === 'android' && hallMapStyles.tableAndroid,
          {
            left: position.x,
            top: position.y,
          }
        ]}
        onPress={() => handleTableSelect(table)}
        disabled={isUpdating || !isAvailable} // Блокируем на время обновления И если стол занят
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <Text style={[
          hallMapStyles.tableNumber,
          Platform.OS === 'android' && hallMapStyles.tableNumberAndroid
        ]}>
          {tableNumber}
        </Text>
      </TouchableOpacity>
    );
  };

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
                disabled={isUpdating || isLoading}
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
              {Platform.OS === 'android' && (
                <Text style={hallMapStyles.timeWarning}>
                  Время будет округлено до 15 минут
                </Text>
              )}
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
                disabled={isUpdating || isLoading}
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
              {Platform.OS === 'android' && (
                <Text style={hallMapStyles.timeWarning}>
                  Время будет округлено до 15 минут
                </Text>
              )}
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
                minuteInterval={15} // iOS будет показывать только 00, 15, 30, 45
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
                minuteInterval={15} // iOS будет показывать только 00, 15, 30, 45
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
      {selectedTableData && (
        <TableReservationModal
          visible={modalVisible}
          table={selectedTableData}
          startTime={startTime}
          endTime={endTime}
          onClose={handleCloseModal}
          onAddToOrder={handleAddToOrder}
        />
      )}
    </View>
  );
}