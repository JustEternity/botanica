import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  PanResponder,
} from 'react-native';
import { Table } from '../types';
import { hallMapStyles } from '../styles/hallMapStyles';

export default function HallMapScreen() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
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

  // Создаем PanResponder для обработки жестов с улучшениями для Android
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Для Android: активируем только при заметном перемещении
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 5 || Math.abs(dy) > 5;
      },

      onPanResponderGrant: (evt, gs) => {
        const touches = evt.nativeEvent.touches;

        // Сохраняем начальное состояние при начале жеста
        panStartRef.current = {
          translateX: transformRef.current.translateX,
          translateY: transformRef.current.translateY,
          scale: transformRef.current.scale,
        };

        // Если два пальца, сохраняем начальное состояние для масштабирования
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

        // Перемещение одним пальцем
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
        // Масштабирование двумя пальцами
        else if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          const currentDistance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          // Вычисляем изменение масштаба относительно начального расстояния
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
        // Сбрасываем начальное состояние масштабирования
        zoomStartRef.current.distance = 0;
      },

      // Для Android: предотвращаем прерывание жестов
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // Данные столов с позициями на карте (20 столов)
  const tables: Table[] = [
    { id: '1', number: 1, isAvailable: true, position: { x: 50, y: 50 } },
    { id: '2', number: 2, isAvailable: true, position: { x: 150, y: 50 } },
    { id: '3', number: 3, isAvailable: false, position: { x: 250, y: 50 } },
    { id: '4', number: 4, isAvailable: true, position: { x: 350, y: 50 } },
    { id: '5', number: 5, isAvailable: true, position: { x: 450, y: 50 } },
    { id: '6', number: 6, isAvailable: true, position: { x: 50, y: 150 } },
    { id: '7', number: 7, isAvailable: false, position: { x: 150, y: 150 } },
    { id: '8', number: 8, isAvailable: true, position: { x: 250, y: 150 } },
    { id: '9', number: 9, isAvailable: true, position: { x: 350, y: 150 } },
    { id: '10', number: 10, isAvailable: true, position: { x: 450, y: 150 } },
    { id: '11', number: 11, isAvailable: true, position: { x: 50, y: 250 } },
    { id: '12', number: 12, isAvailable: false, position: { x: 150, y: 250 } },
    { id: '13', number: 13, isAvailable: true, position: { x: 250, y: 250 } },
    { id: '14', number: 14, isAvailable: true, position: { x: 350, y: 250 } },
    { id: '15', number: 15, isAvailable: true, position: { x: 450, y: 250 } },
    { id: '16', number: 16, isAvailable: true, position: { x: 50, y: 350 } },
    { id: '17', number: 17, isAvailable: false, position: { x: 150, y: 350 } },
    { id: '18', number: 18, isAvailable: true, position: { x: 250, y: 350 } },
    { id: '19', number: 19, isAvailable: true, position: { x: 350, y: 350 } },
    { id: '20', number: 20, isAvailable: true, position: { x: 450, y: 350 } },
  ];

  // Улучшенный обработчик выбора стола для Android
  const handleTableSelect = (table: Table) => {
    if (!table.isAvailable) {
      Alert.alert('Стол занят', `Стол №${table.number} в настоящее время занят`);
      return;
    }

    // Для Android: небольшая задержка для лучшей обратной связи
    if (Platform.OS === 'android') {
      setTimeout(() => {
        setSelectedTable(table.id);
        Alert.alert(
          'Стол выбран',
          `Выбран стол №${table.number}`
        );
      }, 50);
    } else {
      setSelectedTable(table.id);
      Alert.alert(
        'Стол выбран',
        `Выбран стол №${table.number}`
      );
    }
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

  // Рендер отдельного стола на карте с улучшениями для Android
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
      {/* Заголовок */}
      <View style={hallMapStyles.header}>
        <Text style={hallMapStyles.headerTitle}>🗺️ Схема зала</Text>
      </View>

      {/* Основной контент - теперь карта занимает все пространство */}
      <View style={hallMapStyles.content}>
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

        {/* Информация о выбранном столе */}
        {selectedTable && (
          <View style={hallMapStyles.selectedTableInfo}>
            <Text style={hallMapStyles.selectedTableText}>
              Выбран стол: №{tables.find(t => t.id === selectedTable)?.number}
            </Text>
            <TouchableOpacity
              style={hallMapStyles.clearSelectionButton}
              onPress={() => setSelectedTable(null)}
              activeOpacity={0.7}
            >
              <Text style={hallMapStyles.clearSelectionText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}