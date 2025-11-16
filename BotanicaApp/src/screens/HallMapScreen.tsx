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
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Table } from '../types';
import { hallMapStyles } from '../styles/hallMapStyles';
import TableReservationModal from './TableReservationScreen';
import { ApiService } from '../services/api';

// Импорты для react-datepicker (веб-версия)
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ru } from 'date-fns/locale/ru';
registerLocale('ru', ru);

const { width, height } = Dimensions.get('window');

// Размеры вашей картинки
const CONTENT_WIDTH = 800;
const CONTENT_HEIGHT = 600;
const isWeb = Platform.OS === 'web';

// Стили для веб-пикера
const webDatePickerStyles = `
  .web-date-picker-wrapper {
    width: 100% !important;
  }
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 16px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
    background: white;
    cursor: pointer;
    min-height: 60px;
    font-weight: 600;
    box-sizing: border-box;
  }
  .react-datepicker__input-container input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  .react-datepicker {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  }
  .react-datepicker__header {
    background-color: #3b82f6;
    color: white;
  }
  .react-datepicker__current-month {
    color: white;
  }
  .react-datepicker__day-name {
    color: white;
  }
  .react-datepicker__day--selected {
    background-color: #3b82f6;
  }
  .react-datepicker__time-container {
    border-left: 1px solid #e2e8f0;
  }
  .react-datepicker__time-box {
    width: 100% !important;
  }
    .map-container-web {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
`;

// Тип для события DateTimePicker
type DateTimePickerEvent = {
  type: string;
  nativeEvent: {
    timestamp: number;
  };
};

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВЫНЕСЕНЫ ВНЕ КОМПОНЕНТА
const enforce15MinuteIntervals = (date: Date): Date => {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  const validMinutes = [0, 15, 30, 45];

  if (!validMinutes.includes(minutes)) {
    const remainder = minutes % 15;
    const roundedMinutes = remainder < 8 ? minutes - remainder : minutes + (15 - remainder);
    newDate.setMinutes(roundedMinutes);
    newDate.setSeconds(0, 0);
  }

  return newDate;
};

const setEndTimeOneHourLater = (start: Date) => {
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return enforce15MinuteIntervals(end);
};

const hasMinimumInterval = (start: Date, end: Date) => {
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 1;
};

const getOpeningTime = (date: Date) => {
  const opening = new Date(date);
  opening.setHours(12, 0, 0, 0);
  return opening;
};

const getClosingTime = (date: Date) => {
  const closing = new Date(date);
  closing.setDate(closing.getDate() + 1);
  closing.setHours(4, 0, 0, 0);
  return closing;
};

const isValidStartTime = (time: Date) => {
  const hours = time.getHours();
  return (hours >= 0 && hours < 4) || (hours >= 12);
};

const isValidEndTime = (time: Date) => {
  const hours = time.getHours();
  return (hours >= 0 && hours < 5) || (hours >= 13);
};

const getMinStartTime = () => {
  const now = new Date();
  return enforce15MinuteIntervals(now);
};

const getMaxStartTime = () => {
  const maxStart = new Date();
  maxStart.setDate(maxStart.getDate() + 30);
  return maxStart;
};

const getMaxEndTime = (startTime: Date) => {
  return getClosingTime(startTime);
};

const getMinEndTime = (startTime: Date) => {
  return setEndTimeOneHourLater(startTime);
};

const getNearestAvailableTime = (): { startTime: Date; endTime: Date } => {
  const now = new Date();
  let startTime = enforce15MinuteIntervals(now);

  if (!isValidStartTime(startTime)) {
    if (now.getHours() < 12) {
      startTime = getOpeningTime(now);
    } else {
      startTime = new Date(now);
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(0, 0, 0, 0);
    }
  }

  const endTime = setEndTimeOneHourLater(startTime);
  return { startTime, endTime };
};

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

  // Состояния для времени - ТЕПЕРЬ ФУНКЦИИ ОПРЕДЕЛЕНЫ ДО ИХ ИСПОЛЬЗОВАНИЯ
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

  // Добавляем стили для веб-пикера
  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleElement = document.createElement('style');
      styleElement.textContent = webDatePickerStyles;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  // Обработчики для веб-версии (react-datepicker)
  const handleWebStartTimeChange = (date: Date | null) => {
    if (date) {
      let newStartTime = enforce15MinuteIntervals(date);

      // Проверяем, что выбранное время не в прошлом
      const now = new Date();
      const minTime = new Date(now.getTime() + 15 * 60000);
      if (newStartTime < minTime) {
        Alert.alert('Ошибка', 'Нельзя выбрать прошедшее время');
        return;
      }

      if (!isValidStartTime(newStartTime)) {
        Alert.alert('Ошибка', 'Выбранное время недоступно для бронирования');
        return;
      }

      setStartTime(newStartTime);
      const newEndTime = setEndTimeOneHourLater(newStartTime);
      setEndTime(newEndTime);
    }
  };

  const handleWebEndTimeChange = (date: Date | null) => {
    if (date) {
      let newEndTime = enforce15MinuteIntervals(date);

      // Проверяем минимальный интервал
      const minEndTime = new Date(startTime.getTime() + 60 * 60000);
      if (newEndTime < minEndTime) {
        Alert.alert('Ошибка', 'Время окончания должно быть хотя бы на 1 час позже времени начала');
        return;
      }

      if (!isValidEndTime(newEndTime)) {
        Alert.alert('Ошибка', 'Выбранное время недоступно для бронирования');
        return;
      }

      if (!hasMinimumInterval(startTime, newEndTime)) {
        Alert.alert('Ошибка', 'Минимальное время бронирования - 1 час');
        return;
      }

      const maxEndTime = getMaxEndTime(startTime);
      if (newEndTime > maxEndTime) {
        Alert.alert('Ограничение', 'Время окончания не может выходить за пределы рабочего дня');
        return;
      }

      setEndTime(newEndTime);
    }
  };

  // Обработчики для Android - РАЗДЕЛЕНЫ НА DATE И TIME
  const openStartPickerAndroid = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Сначала открываем выбор даты
    DateTimePickerAndroid.open({
      value: startTime,
      mode: 'date',
      display: 'default',
      minimumDate: today,
      onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) {
          // Определяем минимальное время для выбранной даты
          let minTime = new Date(selectedDate);
          const isToday = selectedDate.toDateString() === today.toDateString();

          if (isToday) {
            // Если выбрана сегодняшняя дата, минимальное время - текущее время + 15 минут
            minTime = new Date(now.getTime() + 15 * 60000);
          } else {
            // Если выбрана будущая дата, минимальное время - 12:00
            minTime.setHours(12, 0, 0, 0);
          }

          // После выбора даты открываем выбор времени
          DateTimePickerAndroid.open({
            value: isToday ? (minTime > startTime ? minTime : startTime) : startTime,
            mode: 'time',
            display: 'default',
            onChange: (timeEvent: DateTimePickerEvent, selectedTime?: Date) => {
              if (selectedTime) {
                // Объединяем выбранную дату и время
                const newDateTime = new Date(selectedDate);
                const time = new Date(selectedTime);
                newDateTime.setHours(time.getHours(), time.getMinutes());

                let newStartTime = enforce15MinuteIntervals(newDateTime);

                // Проверяем, что выбранное время не в прошлом
                if (newStartTime < minTime) {
                  Alert.alert('Ошибка', 'Нельзя выбрать прошедшее время');
                  return;
                }

                if (!isValidStartTime(newStartTime)) {
                  Alert.alert('Ошибка', 'Выбранное время недоступно для бронирования');
                  return;
                }

                setStartTime(newStartTime);
                const newEndTime = setEndTimeOneHourLater(newStartTime);
                setEndTime(newEndTime);
              }
            }
          });
        }
      }
    });
  };

  const openEndPickerAndroid = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Минимальная дата для окончания - дата начала
    const minDate = new Date(startTime);
    minDate.setHours(0, 0, 0, 0);

    // Сначала открываем выбор даты
    DateTimePickerAndroid.open({
      value: endTime,
      mode: 'date',
      display: 'default',
      minimumDate: minDate,
      onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) {
          // Определяем минимальное время для выбранной даты
          let minTime = new Date(selectedDate);
          const isStartDate = selectedDate.toDateString() === minDate.toDateString();

          if (isStartDate) {
            // Если выбрана та же дата, что и начало, минимальное время - startTime + 1 час
            minTime = new Date(startTime.getTime() + 60 * 60000);
          } else {
            // Если выбрана следующая дата, минимальное время - 00:00
            minTime.setHours(0, 0, 0, 0);
          }

          // После выбора даты открываем выбор времени
          DateTimePickerAndroid.open({
            value: isStartDate ? (minTime > endTime ? minTime : endTime) : endTime,
            mode: 'time',
            display: 'default',
            onChange: (timeEvent: DateTimePickerEvent, selectedTime?: Date) => {
              if (selectedTime) {
                // Объединяем выбранную дату и время
                const newDateTime = new Date(selectedDate);
                const time = new Date(selectedTime);
                newDateTime.setHours(time.getHours(), time.getMinutes());

                let newEndTime = enforce15MinuteIntervals(newDateTime);

                // Проверяем, что выбранное время не в прошлом относительно начала
                if (newEndTime < minTime) {
                  Alert.alert('Ошибка', 'Время окончания должно быть хотя бы на 1 час позже времени начала');
                  return;
                }

                if (!isValidEndTime(newEndTime)) {
                  Alert.alert('Ошибка', 'Выбранное время недоступно для бронирования');
                  return;
                }

                if (!hasMinimumInterval(startTime, newEndTime)) {
                  Alert.alert('Ошибка', 'Минимальное время бронирования - 1 час');
                  return;
                }

                const maxEndTime = getMaxEndTime(startTime);
                if (newEndTime > maxEndTime) {
                  Alert.alert('Ограничение', 'Время окончания не может выходить за пределы рабочего дня');
                  return;
                }

                setEndTime(newEndTime);
              }
            }
          });
        }
      }
    });
  };

  // Универсальные функции открытия пикеров
  const openStartTimePicker = () => {
    if (Platform.OS === 'web') {
      // Для веба ничего не делаем - DatePicker открывается автоматически
      return;
    } else if (Platform.OS === 'ios') {
      setShowEndPicker(false);
      setShowStartPicker(true);
    } else {
      openStartPickerAndroid();
    }
  };

  const openEndTimePicker = () => {
    if (Platform.OS === 'web') {
      // Для веба ничего не делаем - DatePicker открывается автоматически
      return;
    } else if (Platform.OS === 'ios') {
      setShowStartPicker(false);
      setShowEndPicker(true);
    } else {
      openEndPickerAndroid();
    }
  };

  // Обработчики для iOS
  const handleStartTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      // Для iOS оставляем пикер открытым
    } else {
      setShowStartPicker(false);
    }

    if (selectedDate) {
      let newStartTime = selectedDate;

      if (!isValidStartTime(newStartTime)) {
        return;
      }

      setStartTime(newStartTime);
      const newEndTime = setEndTimeOneHourLater(newStartTime);
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      // Для iOS оставляем пикер открытым
    } else {
      setShowEndPicker(false);
    }

    if (selectedDate) {
      let newEndTime = selectedDate;

      if (!isValidEndTime(newEndTime)) {
        return;
      }

      if (!hasMinimumInterval(startTime, newEndTime)) {
        Alert.alert('Ошибка', 'Минимальное время бронирования - 1 час');
        return;
      }

      const maxEndTime = getMaxEndTime(startTime);
      if (newEndTime > maxEndTime) {
        Alert.alert('Ограничение', 'Время окончания не может выходить за пределы рабочего дня');
        return;
      }

      setEndTime(newEndTime);
    }
  };

  // Форматирование времени
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

  // Компонент для веб-пикера
  const WebDatePicker = ({ selected, onChange, minDate, maxDate, label }: any) => (
    <View style={hallMapStyles.webDatePickerContainer}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd.MM.yyyy HH:mm"
        timeCaption="Время"
        minDate={minDate}
        maxDate={maxDate}
        locale="ru"
        className="react-datepicker__input-container"
        wrapperClassName="web-date-picker-wrapper"
        customInput={
          <TouchableOpacity style={hallMapStyles.webDatePickerButton}>
            <Text style={hallMapStyles.webDatePickerText}>
              {formatTime(selected)}
            </Text>
            <Text style={hallMapStyles.webDatePickerDateText}>
              {formatDateCompact(selected)}
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );

  // Остальной код остается без изменений...
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const transformRef = useRef(transform);
  const panStartRef = useRef({
    translateX: 0,
    translateY: 0,
    scale: 1,
  });

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const applyBounds = useCallback((newTransform: { scale: number; translateX: number; translateY: number}) => {
    const { scale, translateX, translateY } = newTransform;
    const clampedScale = Math.max(0.5, Math.min(3, scale));
    const leftBound = CONTENT_WIDTH * 0.3;
    const rightBound = CONTENT_WIDTH * 0.05;
    const topBound = CONTENT_HEIGHT * 0.05;
    const bottomBound = CONTENT_HEIGHT * 0.3;

    const clampedTranslateX = Math.max(-leftBound, Math.min(rightBound, translateX));
    const clampedTranslateY = Math.max(-topBound, Math.min(bottomBound, translateY));

    return {
      scale: clampedScale,
      translateX: clampedTranslateX,
      translateY: clampedTranslateY,
    };
  }, []);

  const gestureStateRef = useRef({
    isZooming: false,
    initialTouches: [] as NativeTouchEvent[],
    initialDistance: 0,
    initialScale: 1,
  });

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

  // Загрузка столов и остальная логика остается без изменений
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

  useEffect(() => {
    loadTables(true);
  }, [startTime, endTime]);

  useEffect(() => {
    loadTables(false);
  }, []);

  useEffect(() => {
    loadTables(false);
  }, [startTime, endTime, tablesLastUpdate]);

  // Обработчики UI
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

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTable(null);
    loadTables(true);
  };

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

  const handleZoomIn = () => {
    const newTransform = applyBounds({
      scale: transform.scale * 1.5,
      translateX: transform.translateX,
      translateY: transform.translateY,
    });
    setTransform(newTransform);
  };

  const handleZoomOut = () => {
    const newTransform = applyBounds({
      scale: transform.scale / 1.5,
      translateX: transform.translateX,
      translateY: transform.translateY,
    });
    setTransform(newTransform);
  };

  const handleResetMap = () => {
    setTransform(applyBounds({
      scale: 0.55,
      translateX: -100,
      translateY: -50,
    }));
  };

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
      <View style={[
          hallMapStyles.content,
          isWeb && hallMapStyles.content
        ]}>
        {/* Панель выбора времени - ПЕРЕНЕСЕНА ВВЕРХ */}
        <View style={hallMapStyles.timeSelectionPanel}>
          <Text style={hallMapStyles.timeSelectionTitle}>Время бронирования</Text>
          <Text style={hallMapStyles.timeRestrictionText}>Доступно с 12:00 до 04:00 следующего дня</Text>

          <View style={[
              hallMapStyles.timeSelectionRow,
              isWeb && hallMapStyles.timeSelectionRowWeb
            ]}>
              <View style={[
                hallMapStyles.timePickerCompact,
                isWeb && hallMapStyles.timePickerCompactWeb
              ]}>
                <Text style={hallMapStyles.timePickerLabel}>Начало</Text>

                {isWeb ? (
                  <WebDatePicker
                    selected={startTime}
                    onChange={handleWebStartTimeChange}
                    minDate={getMinStartTime()}
                    maxDate={getMaxStartTime()}
                    label="Начало"
                  />
                ) : (
                  <TouchableOpacity
                    style={[
                      hallMapStyles.timePickerButtonCompact,
                      isWeb && hallMapStyles.timePickerButtonCompactWeb,
                      showStartPicker && hallMapStyles.timePickerButtonActive
                    ]}
                    onPress={openStartTimePicker}
                    disabled={isUpdating || isLoading}
                  >
                    <Text style={[
                      hallMapStyles.timePickerTextCompact,
                      isWeb && hallMapStyles.timePickerTextCompactWeb,
                      showStartPicker && hallMapStyles.timePickerTextActive
                    ]}>
                      {formatTime(startTime)}
                    </Text>
                    <Text style={[
                      hallMapStyles.dateTextCompact,
                      isWeb && hallMapStyles.dateTextCompactWeb
                    ]}>
                      {formatDateCompact(startTime)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[
                hallMapStyles.timeSeparator,
                isWeb && hallMapStyles.timeSeparatorWeb
              ]}>
                <Text style={hallMapStyles.timeSeparatorText}>→</Text>
              </View>

              <View style={[
                hallMapStyles.timePickerCompact,
                isWeb && hallMapStyles.timePickerCompactWeb
              ]}>
                <Text style={hallMapStyles.timePickerLabel}>Окончание</Text>

                {isWeb ? (
                  <WebDatePicker
                    selected={endTime}
                    onChange={handleWebEndTimeChange}
                    minDate={getMinEndTime(startTime)}
                    maxDate={getMaxEndTime(startTime)}
                    label="Окончание"
                  />
                ) : (
                  <TouchableOpacity
                    style={[
                      hallMapStyles.timePickerButtonCompact,
                      isWeb && hallMapStyles.timePickerButtonCompactWeb,
                      showEndPicker && hallMapStyles.timePickerButtonActive
                    ]}
                    onPress={openEndTimePicker}
                    disabled={isUpdating || isLoading}
                  >
                    <Text style={[
                      hallMapStyles.timePickerTextCompact,
                      isWeb && hallMapStyles.timePickerTextCompactWeb,
                      showEndPicker && hallMapStyles.timePickerTextActive
                    ]}>
                      {formatTime(endTime)}
                    </Text>
                    <Text style={[
                      hallMapStyles.dateTextCompact,
                      isWeb && hallMapStyles.dateTextCompactWeb
                    ]}>
                      {formatDateCompact(endTime)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

          {/* Показываем нативные пикеры только для iOS */}
          {Platform.OS === 'ios' && showStartPicker && (
            <View style={hallMapStyles.pickerContainer}>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                display="spinner"
                onChange={handleStartTimeChange}
                minimumDate={getMinStartTime()}
                maximumDate={getMaxStartTime()}
                minuteInterval={15}
              />
              <TouchableOpacity
                style={hallMapStyles.pickerCloseButton}
                onPress={() => setShowStartPicker(false)}
              >
                <Text style={hallMapStyles.pickerCloseButtonText}>Готово</Text>
              </TouchableOpacity>
            </View>
          )}

          {Platform.OS === 'ios' && showEndPicker && (
            <View style={hallMapStyles.pickerContainer}>
              <DateTimePicker
                value={endTime}
                mode="datetime"
                display="spinner"
                onChange={handleEndTimeChange}
                minimumDate={getMinEndTime(startTime)}
                maximumDate={getMaxEndTime(startTime)}
                minuteInterval={15}
              />
              <TouchableOpacity
                style={hallMapStyles.pickerCloseButton}
                onPress={() => setShowEndPicker(false)}
              >
                <Text style={hallMapStyles.pickerCloseButtonText}>Готово</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Карта зала - ПЕРЕНЕСЕНА ПОД ПАНЕЛЬ ВЫБОРА ВРЕМЕНИ */}
        <View style={hallMapStyles.mapWrapper}>
          <View
            style={[
              hallMapStyles.mapContainer,
              Platform.OS === 'android' && hallMapStyles.mapContainerAndroid,
              isWeb && hallMapStyles.mapContainerWeb
            ]}
            {...panResponder.panHandlers}
            {...(isWeb && { className: "map-container-web" })}
          >
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
              <ImageBackground
                source={require('../../assets/Map.png')}
                style={hallMapStyles.mapBackground}
                resizeMode="cover"
              >
                <View style={hallMapStyles.tablesContainer}>
                  {tables.map(renderTable)}
                </View>
              </ImageBackground>
            </View>

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

            <View style={hallMapStyles.scaleInfoOverlay}>
              <Text style={hallMapStyles.scaleText}>Масштаб: {Math.round(transform.scale * 100)}%</Text>
            </View>
          </View>
        </View>

        {/* Легенда остается на своем месте */}
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

      {/* Остальные компоненты остаются без изменений */}
      <CartModal
        visible={cartModalVisible}
        onClose={handleCloseCart}
        onOrderSuccess={handleOrderSuccess}
      />

      <FloatingCartButton onPress={handleOpenCart} />

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