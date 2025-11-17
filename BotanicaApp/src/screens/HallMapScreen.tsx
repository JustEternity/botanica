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
  ScrollView,
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

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
const enforce15MinuteIntervals = (date: Date): Date => {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  newDate.setMinutes(roundedMinutes, 0, 0);
  return newDate;
};

// УПРОЩЕННАЯ ВАЛИДАЦИЯ ВРЕМЕНИ
const isValidStartTime = (time: Date) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();

  // Разрешаем время с 12:00 до 4:00 следующего дня
  return (hours >= 12 && hours <= 23) ||
         (hours >= 0 && hours < 4) ||
         (hours === 4 && minutes === 0);
};

const isValidEndTime = (time: Date) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();

  // Разрешаем время с 13:00 до 4:00 следующего дня
  return (hours >= 13 && hours <= 23) ||
         (hours >= 0 && hours < 4) ||
         (hours === 4 && minutes === 0);
};

const isNotPastTime = (time: Date) => {
  const now = new Date();
  const bufferTime = new Date(now.getTime() - 5 * 60 * 1000);
  return time >= bufferTime;
};

// УПРОЩЕННАЯ ПРОВЕРКА СМЕНЫ
const isSameWorkingShift = (startTime: Date, endTime: Date): boolean => {
  const startHours = startTime.getHours();
  const endHours = endTime.getHours();

  // Если начало до 4 утра
  if (startHours < 4) {
    // Конец должен быть в тот же день до 4:00
    return (endHours < 4 || (endHours === 4 && endTime.getMinutes() === 0)) &&
           startTime.getDate() === endTime.getDate();
  }

  // Если начало после 12:00
  if (startHours >= 12) {
    // Конец может быть в тот же день после 13:00 ИЛИ на следующий день до 4:00
    if (endHours < 4 || (endHours === 4 && endTime.getMinutes() === 0)) {
      return endTime.getDate() === startTime.getDate() + 1;
    } else {
      return endTime.getHours() >= 13 && startTime.getDate() === endTime.getDate();
    }
  }

  return false;
};

// Функция для веб-версии (аналогичная мобильной)
const isSameWorkingShiftWeb = isSameWorkingShift;

const validateReservationTime = (
  startTime: Date,
  endTime: Date
): { isValid: boolean; error?: string } => {
  const now = new Date();

  if (startTime < now) {
    return {
      isValid: false,
      error: 'Нельзя выбрать прошедшее время'
    };
  }

  if (!isValidStartTime(startTime)) {
    return {
      isValid: false,
      error: 'Время начала должно быть между 12:00 и 04:00'
    };
  }

  if (!isValidEndTime(endTime)) {
    return {
      isValid: false,
      error: 'Время окончания должно быть между 13:00 и 04:00'
    };
  }

  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  if (durationHours < 1) {
    return {
      isValid: false,
      error: 'Минимальное время бронирования - 1 час'
    };
  }

  const isSameShift = isWeb
    ? isSameWorkingShiftWeb(startTime, endTime)
    : isSameWorkingShift(startTime, endTime);

  if (!isSameShift) {
    return {
      isValid: false,
      error: 'Нельзя выбрать время из разных рабочих смен'
    };
  }

  return { isValid: true };
};

const hasMinimumInterval = (start: Date, end: Date) => {
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 1;
};

// Функция для получения валидных времен окончания
const getValidEndTimes = (startTime: Date): Date[] => {
  const validTimes: Date[] = [];
  const start = new Date(startTime);

  // Добавляем 4:00 как валидное время окончания
  const fourOClock = new Date(start);
  if (start.getHours() < 4) {
    // Если начало до 4:00, то 4:00 того же дня
    fourOClock.setHours(4, 0, 0, 0);
  } else {
    // Если начало после 12:00, то 4:00 следующего дня
    fourOClock.setDate(fourOClock.getDate() + 1);
    fourOClock.setHours(4, 0, 0, 0);
  }

  // Генерируем времена с интервалом 15 минут
  let current = new Date(start);
  current.setHours(current.getHours() + 1);
  current = enforce15MinuteIntervals(current);

  while (current <= fourOClock) {
    if (isValidEndTime(current) && hasMinimumInterval(startTime, current)) {
      validTimes.push(new Date(current));
    }
    current = new Date(current.getTime() + 15 * 60 * 1000);
  }

  // Убедимся, что 4:00 включено
  if (isValidEndTime(fourOClock) &&
      hasMinimumInterval(startTime, fourOClock) &&
      !validTimes.some(t => t.getTime() === fourOClock.getTime())) {
    validTimes.push(fourOClock);
  }

  return validTimes
    .filter(time => time > startTime)
    .sort((a, b) => a.getTime() - b.getTime());
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
  const [timeError, setTimeError] = useState<string | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Получение ближайшего доступного времени
  const getNearestAvailableTime = (): { startTime: Date; endTime: Date } => {
    const now = new Date();
    let startTime = enforce15MinuteIntervals(now);

    if (!isValidStartTime(startTime)) {
      startTime = new Date(now);
      const currentHours = now.getHours();

      if (currentHours >= 4 && currentHours < 12) {
        startTime.setHours(12, 0, 0, 0);
      } else {
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(12, 0, 0, 0);
      }
    }

    const endTime = calculateEndTimeWithinSameShift(startTime);
    return { startTime, endTime };
  };

  const calculateEndTimeWithinSameShift = (startTime: Date): Date => {
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    // Если после добавления часа мы выходим за пределы смены, устанавливаем 4:00
    if (!isSameWorkingShift(startTime, endTime)) {
      if (startTime.getHours() < 4) {
        endTime.setHours(4, 0, 0, 0);
      } else {
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(4, 0, 0, 0);
      }
    }

    return enforce15MinuteIntervals(endTime);
  };

  const [startTime, setStartTime] = useState(() => {
    const { startTime: nearestStart } = getNearestAvailableTime();
    return enforce15MinuteIntervals(nearestStart);
  });
  const [endTime, setEndTime] = useState(() => {
    const { endTime: nearestEnd } = getNearestAvailableTime();
    return enforce15MinuteIntervals(nearestEnd);
  });

  useEffect(() => {
    if (startTime && endTime) {
      const validation = validateReservationTime(startTime, endTime);
      if (!validation.isValid) {
        setTimeError(validation.error || null);
      } else {
        setTimeError(null);
      }
    }
  }, [startTime, endTime]);

  // УЛУЧШЕННЫЕ ОБРАБОТЧИКИ ДЛЯ МОБИЛЬНЫХ ПИКЕРОВ
  const handleMobileStartTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      if (event.type === 'set' && selectedDate) {
        const newStartTime = enforce15MinuteIntervals(selectedDate);

        if (!isNotPastTime(newStartTime)) {
          Alert.alert('Ошибка', 'Нельзя выбрать прошедшее время');
          return;
        }

        if (!isValidStartTime(newStartTime)) {
          Alert.alert('Ошибка', 'Время начала должно быть между 12:00 и 04:00');
          return;
        }

        setStartTime(newStartTime);

        // Автоматически устанавливаем конечное время
        const newEndTime = calculateEndTimeWithinSameShift(newStartTime);
        setEndTime(newEndTime);
      }
      setShowStartPicker(false);
    }
  };

  const handleMobileEndTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      if (event.type === 'set' && selectedDate) {
        const newEndTime = enforce15MinuteIntervals(selectedDate);

        const validation = validateReservationTime(startTime, newEndTime);
        if (!validation.isValid) {
          Alert.alert('Ошибка', validation.error || 'Некорректное время');
          return;
        }

        setEndTime(newEndTime);
      }
      setShowEndPicker(false);
    }
  };

  // УЛУЧШЕННЫЕ ОБРАБОТЧИКИ ДЛЯ ANDROID
  // УЛУЧШЕННЫЕ ОБРАБОТЧИКИ ДЛЯ ANDROID
  const handleAndroidStartTimeChange = () => {
    DateTimePickerAndroid.open({
      value: startTime,
      mode: 'date',
      is24Hour: true,
      display: 'default',
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          // После выбора даты, открываем time picker
          DateTimePickerAndroid.open({
            value: startTime,
            mode: 'time',
            is24Hour: true,
            display: 'default',
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type === 'set' && selectedTime) {
                // Объединяем выбранную дату и время
                const newDateTime = new Date(selectedDate);
                newDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                const newStartTime = enforce15MinuteIntervals(newDateTime);

                if (!isNotPastTime(newStartTime)) {
                  Alert.alert('Ошибка', 'Нельзя выбрать прошедшее время');
                  return;
                }

                if (!isValidStartTime(newStartTime)) {
                  Alert.alert('Ошибка', 'Время начала должно быть между 12:00 и 04:00');
                  return;
                }

                setStartTime(newStartTime);

                // Автоматически устанавливаем конечное время
                const newEndTime = calculateEndTimeWithinSameShift(newStartTime);
                setEndTime(newEndTime);
              }
            },
          });
        }
      },
    });
  };

  const handleAndroidEndTimeChange = () => {
    DateTimePickerAndroid.open({
      value: endTime,
      mode: 'date',
      is24Hour: true,
      display: 'default',
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          DateTimePickerAndroid.open({
            value: endTime,
            mode: 'time',
            is24Hour: true,
            display: 'default',
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type === 'set' && selectedTime) {
                const newDateTime = new Date(selectedDate);
                newDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                const newEndTime = enforce15MinuteIntervals(newDateTime);

                const validation = validateReservationTime(startTime, newEndTime);
                if (!validation.isValid) {
                  Alert.alert('Ошибка', validation.error || 'Некорректное время');
                  return;
                }

                setEndTime(newEndTime);
              }
            },
          });
        }
      },
    });
  };

  // ОБРАБОТЧИКИ ДЛЯ WEB (остаются без изменений)
  const handleWebStartTimeChange = (date: Date | null) => {
    if (date) {
      const newStartTime = enforce15MinuteIntervals(date);

      if (!isNotPastTime(newStartTime)) {
        Alert.alert('Ошибка', 'Нельзя выбрать прошедшее время');
        return;
      }

      if (!isValidStartTime(newStartTime)) {
        Alert.alert('Ошибка', 'Время начала должно быть между 12:00 и 04:00');
        return;
      }

      setStartTime(newStartTime);

      const newEndTime = calculateEndTimeWithinSameShift(newStartTime);
      setEndTime(newEndTime);
    }
  };

  const handleWebEndTimeChange = (date: Date | null) => {
    if (date) {
      const newEndTime = enforce15MinuteIntervals(date);

      const validation = validateReservationTime(startTime, newEndTime);
      if (!validation.isValid) {
        Alert.alert('Ошибка', validation.error || 'Некорректное время');
        return;
      }

      setEndTime(newEndTime);
    }
  };

  // Функции для открытия пикеров
  const openStartTimePicker = () => {
    if (Platform.OS === 'web') {
      return;
    } else if (Platform.OS === 'ios') {
      setShowEndPicker(false);
      setShowStartPicker(true);
    } else {
      handleAndroidStartTimeChange();
    }
  };

  const openEndTimePicker = () => {
    if (Platform.OS === 'web') {
      return;
    } else if (Platform.OS === 'ios') {
      setShowStartPicker(false);
      setShowEndPicker(true);
    } else {
      handleAndroidEndTimeChange();
    }
  };

  // Веб-компоненты (остаются без изменений)
  const WebStartDatePicker = ({ selected, onChange, label }: any) => (
    <View style={hallMapStyles.webDatePickerContainer}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly={false}
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd.MM.yyyy HH:mm"
        timeCaption="Время"
        locale="ru"
        minDate={new Date()}
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

  const WebEndDatePicker = ({ selected, onChange, startTime, label }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const validEndTimes = getValidEndTimes(startTime);

    const handleTimeSelect = (time: Date) => {
      onChange(time);
      setIsOpen(false);
    };

    const formatTimeForDisplay = (date: Date) => {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatDateForDisplay = (date: Date) => {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();

      if (isToday) return 'сегодня';
      if (isTomorrow) return 'завтра';

      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
      }).replace('/', '.');
    };

    return (
      <View style={hallMapStyles.webDatePickerContainer}>
        <TouchableOpacity
          style={hallMapStyles.webDatePickerButton}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={hallMapStyles.webDatePickerText}>
            {formatTimeForDisplay(selected)}
          </Text>
          <Text style={hallMapStyles.webDatePickerDateText}>
            {formatDateForDisplay(selected)}
          </Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={hallMapStyles.webTimeDropdown}>
            <ScrollView style={hallMapStyles.webTimeScrollView}>
              {validEndTimes.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    hallMapStyles.webTimeOption,
                    time.getTime() === selected.getTime() && hallMapStyles.webTimeOptionSelected
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text style={[
                    hallMapStyles.webTimeOptionText,
                    time.getTime() === selected.getTime() && hallMapStyles.webTimeOptionTextSelected
                  ]}>
                    {formatTimeForDisplay(time)}
                  </Text>
                  <Text style={hallMapStyles.webTimeOptionDate}>
                    {formatDateForDisplay(time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

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

  // ОСТАЛЬНОЙ КОД КОМПОНЕНТА (без изменений)
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

  return (
    <View style={hallMapStyles.container}>
      <View style={[
          hallMapStyles.content,
          isWeb && hallMapStyles.content
        ]}>
        <View style={hallMapStyles.timeSelectionPanel}>
          <Text style={hallMapStyles.timeSelectionTitle}>Время бронирования</Text>
          <Text style={hallMapStyles.timeRestrictionText}>Доступно с 12:00 до 04:00 следующего дня</Text>

          {timeError && (
            <View style={hallMapStyles.errorSection}>
              <Text style={hallMapStyles.errorText}>{timeError}</Text>
            </View>
          )}

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
                  <WebStartDatePicker
                    selected={startTime}
                    onChange={handleWebStartTimeChange}
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
                  <WebEndDatePicker
                    selected={endTime}
                    onChange={handleWebEndTimeChange}
                    startTime={startTime}
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

          {/* iOS Pickers */}
          {Platform.OS === 'ios' && showStartPicker && (
            <View style={hallMapStyles.pickerContainer}>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                display="spinner"
                onChange={handleMobileStartTimeChange}
                minimumDate={new Date()}
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
                onChange={handleMobileEndTimeChange}
                minimumDate={new Date(startTime.getTime() + 60 * 60 * 1000)}
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