import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NavigationContainer as NavContainer } from '@react-navigation/native';
import { createBottomTabNavigator as createTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  PanResponder
} from 'react-native';

// Включаем анимации для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Переименовываем компоненты, чтобы избежать конфликтов
const NavigationContainer = NavContainer;
const createBottomTabNavigator = createTabNavigator;

// Типы для карты столов
type Table = {
  id: string;
  number: number;
  isAvailable: boolean;
  position: { x: number; y: number };
};

// Фиктивные данные для меню
const MENU_DATA = [
  {
    id: '1',
    title: 'Кальяны',
    data: [
      {
        id: '1',
        name: 'Кальян яблочный',
        price: 1200,
        description: 'Свежий табак на яблоке',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🍎'
      },
      {
        id: '2',
        name: 'Кальян классический',
        price: 1000,
        description: 'Классический кальян с молоком',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=💨'
      },
      {
        id: '3',
        name: 'Кальян премиум',
        price: 1500,
        description: 'Премиум табак и угли',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=⭐'
      }
    ]
  },
  {
    id: '2',
    title: 'Напитки',
    data: [
      {
        id: '4',
        name: 'Чай зеленый',
        price: 300,
        description: 'Свежезаваренный чай',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🍵'
      },
      {
        id: '5',
        name: 'Кофе латте',
        price: 350,
        description: 'Ароматный кофе с молоком',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=☕'
      },
      {
        id: '6',
        name: 'Морс клюквенный',
        price: 250,
        description: 'Освежающий морс',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🥤'
      }
    ]
  },
  {
    id: '3',
    title: 'Закуски',
    data: [
      {
        id: '7',
        name: 'Чипсы',
        price: 200,
        description: 'Хрустящие чипсы',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🥔'
      },
      {
        id: '8',
        name: 'Орешки',
        price: 180,
        description: 'Ассорти орехов',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🥜'
      }
    ]
  },
  {
    id: '4',
    title: 'Десерты',
    data: [
      {
        id: '9',
        name: 'Тирамису',
        price: 400,
        description: 'Итальянский десерт',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🍰'
      },
      {
        id: '10',
        name: 'Чизкейк',
        price: 350,
        description: 'Нежный чизкейк',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🎂'
      }
    ]
  }
];

// Компонент экрана меню с точной прокруткой
function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [isScrolling, setIsScrolling] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoriesRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryRefs = useRef<{[key: string]: View}>({});

  // Измеряем высоту заголовка и категорий
  const measureHeader = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  // Функция для точной прокрутки к выбранной категории
  const scrollToCategory = useCallback((categoryId: string) => {
    if (isScrolling) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(categoryId);
    setIsScrolling(true);

    const categoryHeader = categoryRefs.current[categoryId];

    if (scrollViewRef.current && categoryHeader) {
      categoryHeader.measure((_x: number, _y: number, _width: number, _height: number, _pageX: number, pageY: number) => {
        const scrollPosition = Math.max(0, pageY - headerHeight - 10);

        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true
        });

        setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      });
    }

    const categoryDataIndex = MENU_DATA.findIndex(section => section.id === categoryId);
    if (categoriesRef.current && categoryDataIndex !== -1) {
      categoriesRef.current.scrollToIndex({
        index: categoryDataIndex,
        animated: true,
        viewPosition: 0.5
      });
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [isScrolling, headerHeight]);

  // Обработчик скролла для определения видимой категории
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;

    if (isScrolling) return;

    let closestCategory = selectedCategory;
    let minDistance = Infinity;

    MENU_DATA.forEach(category => {
      const categoryHeader = categoryRefs.current[category.id];
      if (categoryHeader) {
        categoryHeader.measure((_x: number, _y: number, _width: number, _height: number, _pageX: number, pageY: number) => {
          const categoryTop = pageY - headerHeight;
          const distance = Math.abs(scrollY - categoryTop);

          if (distance < minDistance) {
            minDistance = distance;
            closestCategory = category.id;
          }

          if (category.id === MENU_DATA[MENU_DATA.length - 1].id && closestCategory !== selectedCategory) {
            setSelectedCategory(closestCategory);

            const categoryDataIndex = MENU_DATA.findIndex(section => section.id === closestCategory);
            if (categoriesRef.current && categoryDataIndex !== -1) {
              categoriesRef.current.scrollToIndex({
                index: categoryDataIndex,
                animated: true,
                viewPosition: 0.5
              });
            }
          }
        });
      }
    });

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const newTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 100);

    scrollTimeoutRef.current = newTimeout;
  }, [selectedCategory, isScrolling, headerHeight]);

  // Обработчик начала скролла
  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  // Обработчик окончания скролла
  const handleScrollEndDrag = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsScrolling(false);
    }, 100);
    scrollTimeoutRef.current = timeout;
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Сохраняем ref для категории
  const setCategoryRef = useCallback((categoryId: string) => (ref: View) => {
    categoryRefs.current[categoryId] = ref;
  }, []);

  return (
    <View style={menuStyles.container}>
      {/* Фиксированный заголовок и категории */}
      <View
        style={menuStyles.headerContainer}
        onLayout={measureHeader}
      >
        <Text style={menuStyles.title}>🍽️ Меню Botanica</Text>

        {/* Горизонтальный список категорий в овальчиках */}
        <View style={menuStyles.categoriesContainer}>
          <FlatList
            ref={categoriesRef}
            data={MENU_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  menuStyles.categoryButton,
                  selectedCategory === item.id && menuStyles.categoryButtonActive
                ]}
                onPress={() => scrollToCategory(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  menuStyles.categoryText,
                  selectedCategory === item.id && menuStyles.categoryTextActive
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={menuStyles.categoriesList}
          />
        </View>
      </View>

      {/* ScrollView с точной прокруткой */}
      <ScrollView
        ref={scrollViewRef}
        style={menuStyles.menuContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={menuStyles.scrollContent}
      >
        {MENU_DATA.map(category => (
          <View key={category.id}>
            {/* Заголовок категории с ref для точной прокрутки */}
            <View
              style={menuStyles.sectionHeader}
              ref={setCategoryRef(category.id)}
            >
              <Text style={menuStyles.sectionTitle}>{category.title}</Text>
            </View>

            {/* Позиции меню в категории */}
            {category.data.map(item => (
              <View key={item.id} style={menuStyles.menuItem}>
                <Image
                  source={{ uri: item.image }}
                  style={menuStyles.itemImage}
                  resizeMode="cover"
                />

                <View style={menuStyles.itemContent}>
                  <View style={menuStyles.itemHeader}>
                    <Text style={menuStyles.itemName}>{item.name}</Text>
                    <Text style={menuStyles.itemPrice}>{item.price} ₽</Text>
                  </View>
                  <Text style={menuStyles.itemDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Отступ внизу */}
        <View style={menuStyles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// Компонент экрана карты столов
function HallMapScreen() {
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
        Platform.OS === 'android' && hallMapStyles.tableAndroid, // Специальные стили для Android
        {
          left: table.position.x,
          top: table.position.y,
        }
      ]}
      onPress={() => handleTableSelect(table)}
      disabled={!table.isAvailable}
      // Для Android: улучшаем отклик на касание
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

      {/* Контейнер карты */}
      <View style={hallMapStyles.content}>
        <Text style={hallMapStyles.sectionTitle}>Выберите стол</Text>

        {/* Элементы управления */}
        <View style={hallMapStyles.controls}>
          <View style={hallMapStyles.zoomControls}>
            <TouchableOpacity
              style={hallMapStyles.zoomButton}
              onPress={handleZoomIn}
              activeOpacity={0.7}
            >
              <Text style={hallMapStyles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={hallMapStyles.zoomButton}
              onPress={handleZoomOut}
              activeOpacity={0.7}
            >
              <Text style={hallMapStyles.zoomButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={hallMapStyles.resetButton}
            onPress={handleResetMap}
            activeOpacity={0.7}
          >
            <Text style={hallMapStyles.resetButtonText}>⟲ Сброс</Text>
          </TouchableOpacity>
        </View>

        {/* Информация о масштабе */}
        <View style={hallMapStyles.scaleInfo}>
          <Text style={hallMapStyles.scaleText}>Масштаб: {Math.round(transform.scale * 100)}%</Text>
          <Text style={hallMapStyles.helpText}>• Один палец для перемещения</Text>
          <Text style={hallMapStyles.helpText}>• Два пальца для масштабирования</Text>
        </View>

        {/* Большая карта зала с возможностью перемещения и масштабирования */}
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
        </View>

        {/* Легенда */}
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

// Остальные экраны (простые заглушки)
function ProfileScreen() {
  return (
    <View style={commonStyles.simpleContainer}>
      <Text style={commonStyles.simpleTitle}>👤 Профиль</Text>
      <Text>Информация о пользователе</Text>
    </View>
  );
}

function AboutScreen() {
  return (
    <View style={commonStyles.simpleContainer}>
      <Text style={commonStyles.simpleTitle}>ℹ️ О нас</Text>
      <Text>Информация о кафе Botanica</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Menu"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarStyle: {
            paddingVertical: 5,
          },
        }}
      >
        <Tab.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            title: 'Меню',
            tabBarLabel: 'Меню',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: 20 }}>🍽️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="HallMap"
          component={HallMapScreen}
          options={{
            title: 'Схема зала',
            tabBarLabel: 'Схема зала',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: 20 }}>🗺️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Профиль',
            tabBarLabel: 'Профиль',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: 20 }}>👤</Text>
            ),
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'О нас',
            tabBarLabel: 'О нас',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: 20 }}>ℹ️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Стили для экрана меню
const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10,
  },
  categoriesContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    height: 60,
  },
  categoriesList: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    marginRight: 10,
    justifyContent: 'center',
    marginVertical: 5,
    minWidth: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#2E7D32',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  menuItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpace: {
    height: 20,
  },
});

// Стили для карты столов
const hallMapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2E7D32',
    borderBottomWidth: 1,
    borderBottomColor: '#1B5E20',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E7D32',
    textAlign: 'center',
  },
  // Контейнер для элементов управления
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  // Элементы управления масштабом
  zoomControls: {
    flexDirection: 'row',
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  zoomButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  // Кнопка сброса
  resetButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#757575',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  resetButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  // Информация о масштабе
  scaleInfo: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  scaleText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Контейнер для карты с возможностью перемещения
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 400,
  },
  // Большая карта
  simpleMap: {
    width: 600,
    height: 500,
    position: 'relative',
  },
  table: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tableOccupied: {
    backgroundColor: '#F44336',
  },
  tableSelected: {
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: '#1976D2',
    transform: [{ scale: 1.1 }],
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  occupied: {
    backgroundColor: '#F44336',
  },
  selected: {
    backgroundColor: '#2196F3',
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  selectedTableInfo: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectedTableText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  clearSelectionButton: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSelectionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Специальные стили для Android
  mapContainerAndroid: {
    // Улучшаем обработку жестов на Android
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  tableAndroid: {
    // Увеличиваем область касания для Android
    minWidth: 55,
    minHeight: 55,
  },
  tableNumberAndroid: {
    // Увеличиваем текст для лучшей читаемости на Android
    fontSize: 18,
  },
});

// Общие стили
const commonStyles = StyleSheet.create({
  simpleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  simpleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },
});