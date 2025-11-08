// рабочее
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTable } from '../contexts/TableContext';
import { useCart } from '../contexts/CartContext';
import FloatingCartButton from '../components/FloatingCartButton';
import CartModal from '../components/CartModal';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  PanResponder,
  Dimensions,
  NativeTouchEvent,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Table } from '../types';
import { hallMapStyles } from '../styles/hallMapStyles';
import TableReservationModal from './TableReservationScreen';
import { ApiService } from '../services/api';

const { width, height } = Dimensions.get('window');

// Размеры вашей картинки
const CONTENT_WIDTH = 800;
const CONTENT_HEIGHT = 600;

export default function HallMapScreen() {
  const { tablesLastUpdate, setIsTablesLoading } = useTable();
  const { setTableReservation } = useCart();
  const [cartModalVisible, setCartModalVisible] = useState(false);
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
    const minStartTime = getMinStartTime(now);
    const maxStartTime = getMaxStartTime(now);

    let startTime = enforce15MinuteIntervals(now);

    // Корректируем время начала, если оно недопустимо
    if (!isValidStartTime(startTime)) {
      // Если сейчас между 04:00 и 12:00, устанавливаем 12:00
      if (now.getHours() >= 4 && now.getHours() < 12) {
        startTime = getOpeningTime(now);
      }
      // Если сейчас после 23:59, устанавливаем 00:00 следующего дня
      else if (now.getHours() >= 24 || now.getHours() < 0) {
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(0, 0, 0, 0);
      }
    }

    if (startTime < minStartTime) {
      startTime = new Date(minStartTime);
    }

    if (startTime > maxStartTime) {
      startTime = new Date(maxStartTime);
    }

    const endTime = getMinEndTime(startTime);
    return { startTime, endTime };
  };

  // Функция для проверки допустимости времени начала
  const isValidStartTime = (time: Date) => {
    const hours = time.getHours();
    // Разрешаем время с 00:00 до 03:00 и с 12:00 до 23:59
    return (hours >= 0 && hours < 4) || (hours >= 12 && hours <= 23);
  };

  // Функция для проверки допустимости времени окончания
  const isValidEndTime = (time: Date) => {
    const hours = time.getHours();
    // Разрешаем время с 00:00 до 04:00 и с 13:00 до 23:59
    return (hours >= 0 && hours < 5) || (hours >= 13 && hours <= 23);
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

  const getMaxStartTime = (selectedDate?: Date) => {
    const date = selectedDate || new Date();
    const maxStart = new Date(date);

    // Если выбран сегодняшний день и сейчас после полуночи, но до 03:00
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday && now.getHours() < 3) {
      // Максимум - 03:00 сегодня
      maxStart.setHours(3, 0, 0, 0);
      return maxStart;
    }

    // Иначе максимум - 03:00 следующего дня
    maxStart.setDate(maxStart.getDate() + 1);
    maxStart.setHours(3, 0, 0, 0);
    return maxStart;
  };

  // Функция для получения минимального времени начала
  const getMinStartTime = (selectedDate?: Date) => {
    const now = new Date();

    if (selectedDate) {
      const isToday = selectedDate.toDateString() === now.toDateString();

      if (isToday) {
        // Если сегодня, то минимальное время - текущее время или 12:00, что больше
        const openingTime = getOpeningTime(now);

        // Если сейчас между 00:00 и 12:00, разрешаем текущее время
        if (now.getHours() < 12) {
          // Но не раньше 00:00 сегодня
          const minTime = new Date(now);
          minTime.setHours(0, 0, 0, 0);
          return now > minTime ? enforce15MinuteIntervals(now) : minTime;
        }

        // Если сейчас после 12:00, используем обычную логику
        const minTime = now > openingTime ? new Date(now) : new Date(openingTime);
        return enforce15MinuteIntervals(minTime);
      } else {
        // Если не сегодня, то минимальное время - 00:00 выбранного дня
        const minTime = new Date(selectedDate);
        minTime.setHours(0, 0, 0, 0);
        return minTime;
      }
    }

    // Если дата не передана, используем логику для текущего дня
    const openingTime = getOpeningTime(now);

    // Если сейчас между 00:00 и 12:00, разрешаем текущее время
    if (now.getHours() < 12) {
      const minTime = new Date(now);
      minTime.setHours(0, 0, 0, 0);
      return now > minTime ? enforce15MinuteIntervals(now) : minTime;
    }

    // Если сейчас после 12:00, используем обычную логику
    const minTime = now > openingTime ? new Date(now) : new Date(openingTime);
    return enforce15MinuteIntervals(minTime);
  };

  // Функция для получения максимального времени окончания
  const getMaxEndTime = (startTime: Date) => {
    return getClosingTime(startTime);
  };

  const getMinEndTime = (startTime: Date) => {
    const minEnd = new Date(startTime);
    minEnd.setHours(startTime.getHours() + 1, 0, 0, 0);
    return minEnd;
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
        setIsTablesLoading(true);
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
      const fallbackTables = getFallbackTables();
      setTables(fallbackTables);
    } finally {
      setIsLoading(false);
      setIsTablesLoading(false);
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

  useEffect(() => {
    loadTables(false);
  }, [startTime, endTime, tablesLastUpdate]);

  // ПРОСТАЯ функция ограничения перемещения
  const applyBounds = useCallback((newTransform: { scale: number; translateX: number; translateY: number}) => {
    const { scale, translateX, translateY } = newTransform;

    // Ограничиваем масштаб
    const clampedScale = Math.max(0.5, Math.min(3, scale));

    // НАСТРАИВАЕМЫЕ ПАРАМЕТРЫ ГРАНИЦ:
    const leftBound = CONTENT_WIDTH * 0.3;    // 5% от ширины карты (слева)
    const rightBound = CONTENT_WIDTH * 0.05;    // 10% от ширины карты (справа)
    const topBound = CONTENT_HEIGHT * 0.05;     // 10% от высоты карты (сверху)
    const bottomBound = CONTENT_HEIGHT * 0.3; // 5% от высоты карты (снизу)

    // Ограничиваем перемещение с разными границами для разных направлений
    const clampedTranslateX = Math.max(-leftBound, Math.min(rightBound, translateX));
    const clampedTranslateY = Math.max(-topBound, Math.min(bottomBound, translateY));

    return {
      scale: clampedScale,
      translateX: clampedTranslateX,
      translateY: clampedTranslateY,
    };
  }, []);

  const gestureStateRef = useRef<{
    isZooming: boolean;
    initialTouches: NativeTouchEvent[];
    initialDistance: number;
    initialScale: number;
  }>({
    isZooming: false,
    initialTouches: [],
    initialDistance: 0,
    initialScale: 1,
  });

  // Обновленный PanResponder с плавным масштабированием
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 2 || Math.abs(dy) > 2;
      },

      onPanResponderGrant: (evt, gs) => {
        const touches = evt.nativeEvent.touches;

        panStartRef.current = {
          translateX: transformRef.current.translateX,
          translateY: transformRef.current.translateY,
          scale: transformRef.current.scale,
        };

        gestureStateRef.current = {
          isZooming: false,
          initialTouches: Array.from(touches),
          initialDistance: 0,
          initialScale: transformRef.current.scale,
        };

        if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          gestureStateRef.current = {
            isZooming: true,
            initialTouches: Array.from(touches),
            initialDistance: distance,
            initialScale: transformRef.current.scale,
          };
        }
      },

      onPanResponderMove: (evt, gs) => {
        const touches = evt.nativeEvent.touches;
        const currentTouchesCount = touches.length;

        if (currentTouchesCount === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const currentDistance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          if (!gestureStateRef.current.isZooming || gestureStateRef.current.initialDistance === 0) {
            gestureStateRef.current = {
              isZooming: true,
              initialTouches: Array.from(touches),
              initialDistance: currentDistance,
              initialScale: transformRef.current.scale,
            };
            return;
          }

          // Более плавное масштабирование
          const scaleChange = Math.pow(currentDistance / gestureStateRef.current.initialDistance, 0.7);
          const newScale = Math.max(0.3, Math.min(3, gestureStateRef.current.initialScale * scaleChange));

          const newTransform = applyBounds({
            scale: newScale,
            translateX: transformRef.current.translateX,
            translateY: transformRef.current.translateY,
          });

          setTransform(newTransform);
        }
        else if (currentTouchesCount === 1 && !gestureStateRef.current.isZooming) {
          const sensitivity = Platform.OS === 'android' ? 1.2 : 0.8;
          const newTranslateX = panStartRef.current.translateX + (gs.dx / panStartRef.current.scale) * sensitivity;
          const newTranslateY = panStartRef.current.translateY + (gs.dy / panStartRef.current.scale) * sensitivity;

          const newTransform = applyBounds({
            scale: transformRef.current.scale,
            translateX: newTranslateX,
            translateY: newTranslateY,
          });

          setTransform(newTransform);
        }
      },

      onPanResponderRelease: (evt, gs) => {
        gestureStateRef.current.isZooming = false;
      },

      onPanResponderTerminate: () => {
        gestureStateRef.current.isZooming = false;
      },

      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  // Обработчики для выбора времени (возвращаем исходную логику)

  const areTimesInSameWorkingDay = (startTime: Date, endTime: Date) => {
    const startClosing = getClosingTime(startTime);
    return endTime <= startClosing;
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      let newStartTime = selectedDate;

      if (Platform.OS === 'android') {
        newStartTime = enforce15MinuteIntervals(selectedDate);

        const originalMinutes = selectedDate.getMinutes();
        if (![0, 15, 30, 45].includes(originalMinutes)) {
          Alert.alert(
            'Время скорректировано',
            `Время автоматически округлено до ${formatTime(newStartTime)}`,
            [{ text: 'OK' }]
          );
        }
      }

      // Проверяем допустимость времени начала
      if (!isValidStartTime(newStartTime)) {
        Alert.alert(
          'Недопустимое время начала',
          'Время начала можно выбрать с 00:00 до 03:00 или с 12:00 до 23:59',
          [{ text: 'OK' }]
        );
        return;
      }

      const minStartTime = getMinStartTime(selectedDate);
      const maxStartTime = getMaxStartTime(selectedDate);

      if (newStartTime < minStartTime) {
        newStartTime = new Date(minStartTime);
      }

      if (newStartTime > maxStartTime) {
        Alert.alert(
          'Ограничение',
          'Время начала бронирования возможно только до 03:00 следующего дня',
          [{ text: 'OK' }]
        );
        return;
      }

      // Автоматически устанавливаем время окончания
      const newEndTime = getMinEndTime(newStartTime);

      // Проверяем, что время окончания не превышает максимальное
      const maxEndTime = getMaxEndTime(newStartTime);
      if (newEndTime > maxEndTime) {
        Alert.alert(
          'Недопустимый интервал',
          'Невозможно установить время окончания в пределах рабочего дня',
          [{ text: 'OK' }]
        );
        return;
      }

      setStartTime(newStartTime);
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      let newEndTime = selectedDate;

      if (Platform.OS === 'android') {
        newEndTime = enforce15MinuteIntervals(selectedDate);

        const originalMinutes = selectedDate.getMinutes();
        if (![0, 15, 30, 45].includes(originalMinutes)) {
          Alert.alert(
            'Время скорректировано',
            `Время автоматически округлено до ${formatTime(newEndTime)}`,
            [{ text: 'OK' }]
          );
        }
      }

      // Проверяем допустимость времени окончания
      if (!isValidEndTime(newEndTime)) {
        Alert.alert(
          'Недопустимое время окончания',
          'Время окончания можно выбрать с 00:00 до 04:00 или с 13:00 до 23:59',
          [{ text: 'OK' }]
        );
        return;
      }

      const minEndTime = getMinEndTime(startTime);
      const maxEndTime = getMaxEndTime(startTime);

      if (newEndTime < minEndTime) {
        Alert.alert(
          'Ошибка',
          `Минимальное время окончания - ${formatTime(minEndTime)} (на 1 час позже времени начала)`,
          [{ text: 'OK' }]
        );
        return;
      }

      if (newEndTime > maxEndTime) {
        Alert.alert(
          'Ограничение',
          'Время окончания не может выходить за пределы рабочего дня (до 04:00 следующего дня)',
          [{ text: 'OK' }]
        );
        return;
      }

      // Проверяем, что оба времени в одном рабочем дне
      if (!areTimesInSameWorkingDay(startTime, newEndTime)) {
        Alert.alert(
          'Ошибка',
          'Время начала и окончания должны находиться в рамках одного рабочего дня',
          [{ text: 'OK' }]
        );
        return;
      }

      setEndTime(newEndTime);
    }
  };

  // Функции для переключения пикеров (возвращаем исходную логику)
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
    loadTables(true);
  };

  // Обработчик добавления в заказ
  const handleAddToOrder = (reservationData: any) => {
    setTableReservation({
      table: reservationData.table,
      startTime: reservationData.startTime,
      endTime: reservationData.endTime,
      guestsCount: reservationData.peopleCount,
    });

    Alert.alert(
      'Добавлено в корзину',
      `Стол №${reservationData.table.number} добавлен в корзину`
    );
    setModalVisible(false);
    setSelectedTable(null);
    loadTables(true);
  };

  // Обработчик масштабирования кнопками с плавным изменением
  const handleZoomIn = () => {
    const newTransform = applyBounds({
      scale: transform.scale * 1.5, // Уменьшенный коэффициент для плавности
      translateX: transform.translateX,
      translateY: transform.translateY,
    });
    setTransform(newTransform);
  };

  const handleZoomOut = () => {
    const newTransform = applyBounds({
      scale: transform.scale / 1.5, // Уменьшенный коэффициент для плавности
      translateX: transform.translateX,
      translateY: transform.translateY,
    });
    setTransform(newTransform);
  };

  // Функция сброса карты
  const handleResetMap = () => {
    setTransform(applyBounds({
      scale: 1,
      translateX: 0,
      translateY: 0,
    }));
  };

  // Рендер отдельного стола на карте
  const renderTable = (table: Table) => {
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
        disabled={isUpdating || !isAvailable}
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

  const handleOpenCart = useCallback(() => {
    setCartModalVisible(true);
  }, []);

  const handleOrderSuccess = useCallback(() => {
    loadTables(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setCartModalVisible(false);
  }, []);

  return (
    <View style={hallMapStyles.container}>
      <View style={hallMapStyles.content}>
        {/* Панель выбора времени */}
        <View style={hallMapStyles.timeSelectionPanel}>
          <Text style={hallMapStyles.timeSelectionTitle}>Время бронирования</Text>
          <Text style={hallMapStyles.timeRestrictionText}>Доступно с 12:00 до 04:00 следующего дня</Text>

          <View style={hallMapStyles.timeSelectionRow}>
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

            <View style={hallMapStyles.timeSeparator}>
              <Text style={hallMapStyles.timeSeparatorText}>→</Text>
            </View>

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

          {showStartPicker && (
            <View style={hallMapStyles.pickerContainer}>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartTimeChange}
                minimumDate={getMinStartTime()}
                maximumDate={getMaxEndTime(startTime)}
                minuteInterval={15}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={hallMapStyles.pickerCloseButton}
                  onPress={() => setShowStartPicker(false)}
                >
                  <Text style={hallMapStyles.pickerCloseButtonText}>Готово</Text>
                </TouchableOpacity>
              )}
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
                minuteInterval={15}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={hallMapStyles.pickerCloseButton}
                  onPress={() => setShowEndPicker(false)}
                >
                  <Text style={hallMapStyles.pickerCloseButtonText}>Готово</Text>
                </TouchableOpacity>
              )}
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
          {/* Общий контейнер для фона и столов с трансформациями */}
          <View
            style={[
              hallMapStyles.transformContainer,
              {
                transform: [
                  { translateX: transform.translateX },
                  { translateY: transform.translateY },
                  { scale: transform.scale }
                ]
              }
            ]}
          >
            {/* Фоновое изображение схемы зала */}
            <ImageBackground
              source={require('../../assets/Map.png')}
              style={hallMapStyles.mapBackground}
              resizeMode="cover"
            >
              {/* Контейнер для столов */}
              <View style={hallMapStyles.tablesContainer}>
                {tables.map(renderTable)}
              </View>
            </ImageBackground>
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

          {/* Информация о масштабе */}
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

      <CartModal
        visible={cartModalVisible}
        onClose={handleCloseCart}
        onOrderSuccess={handleOrderSuccess}
      />

      <FloatingCartButton onPress={handleOpenCart} />

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