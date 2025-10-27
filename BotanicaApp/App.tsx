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
  Linking,
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
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

// Остальные экраны
function ProfileScreen() {
  return (
    <View style={commonStyles.simpleContainer}>
      <Text style={commonStyles.simpleTitle}>👤 Профиль</Text>
      <Text>Информация о пользователе</Text>
    </View>
  );
}

function AboutScreen() {
  // Функции для открытия ссылок
  const openPhone = () => {
    Linking.openURL('tel:+79128267200');
  };

  const openVK = () => {
    Linking.openURL('https://melbet.ru/ru/sport');
  };

  const openMap = () => {
    const address = 'Кировская обл., г.Киров, улица Всесвятская 72, этаж 2';
    const url = Platform.OS === 'ios' 
      ? `http://maps.apple.com/?q=${encodeURIComponent(address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    
    Linking.openURL(url);
  };

  return (
    <ScrollView style={aboutStyles.container} showsVerticalScrollIndicator={false}>

      {/* Основное изображение */}
      <View style={aboutStyles.imageContainer}>
        <Image 
          source={{ uri: 'https://avatars.mds.yandex.net/get-altay/13299246/2a0000018e60570e0f370fa0382d858dc5a3/XXXL' }}
          style={aboutStyles.mainImage}
          resizeMode="cover"
        />
      </View>

      {/* Приветственный текст */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>Добро пожаловать в Botanica!</Text>
        <Text style={aboutStyles.sectionText}>
          Уютная кальянная в самом сердце Кирова, где современный комфорт 
          встречается с атмосферой расслабления и качественного отдыха.
        </Text>
      </View>

      {/* Секция скидок */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>🎁 Наши скидки</Text>
        
        {/* Дневная скидка */}
        <View style={aboutStyles.discountItem}>
          <View style={aboutStyles.discountIcon}>
            <Text style={aboutStyles.icon}>🌞</Text>
          </View>
          <View style={aboutStyles.discountInfo}>
            <Text style={aboutStyles.discountTitle}>Дневная скидка 25% на бар и кальян</Text>
            <Text style={aboutStyles.discountDescription}>
              В будни, с 11:00 до 17:00
            </Text>
          </View>
        </View>

        {/* Скидка в день рождения */}
        <View style={aboutStyles.discountItem}>
          <View style={aboutStyles.discountIcon}>
            <Text style={aboutStyles.icon}>🎂</Text>
          </View>
          <View style={aboutStyles.discountInfo}>
            <Text style={aboutStyles.discountTitle}>Скидка в день рождения 10%</Text>
            <Text style={aboutStyles.discountNote}>
              *Скидка дня рождения применяется только при предъявлении документа, удостоверяющего личность
            </Text>
          </View>
        </View>
      </View>

      {/* Контактная информация */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>📞 Контакты</Text>
        
        {/* Телефон */}
        <TouchableOpacity style={aboutStyles.contactItem} onPress={openPhone}>
          <View style={aboutStyles.contactIcon}>
            <Text style={aboutStyles.icon}>📞</Text>
          </View>
          <View style={aboutStyles.contactInfo}>
            <Text style={aboutStyles.contactLabel}>Телефон администратора</Text>
            <Text style={aboutStyles.contactValue}>+7 (912) 826-72-00</Text>
            <Text style={aboutStyles.contactHint}>Нажмите для звонка</Text>
          </View>
        </TouchableOpacity>

        {/* Адрес */}
        <TouchableOpacity style={aboutStyles.contactItem} onPress={openMap}>
          <View style={aboutStyles.contactIcon}>
            <Text style={aboutStyles.icon}>📍</Text>
          </View>
          <View style={aboutStyles.contactInfo}>
            <Text style={aboutStyles.contactLabel}>Наш адрес</Text>
            <Text style={aboutStyles.contactValue}>
              г. Киров, ул. Всесвятская 72, 2 этаж
            </Text>
            <Text style={aboutStyles.contactHint}>Нажмите для открытия карты</Text>
          </View>
        </TouchableOpacity>

        {/* Социальные сети */}
        <TouchableOpacity style={aboutStyles.contactItem} onPress={openVK}>
          <View style={aboutStyles.contactIcon}>
            <Text style={aboutStyles.icon}>👥</Text>
          </View>
          <View style={aboutStyles.contactInfo}>
            <Text style={aboutStyles.contactLabel}>Мы ВКонтакте</Text>
            <Text style={aboutStyles.contactValue}>vk.com/hp_botanica</Text>
            <Text style={aboutStyles.contactHint}>Нажмите для перехода</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Галерея изображений */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>🍃 Наша атмосфера</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aboutStyles.gallery}>
          <Image 
            source={{ uri: 'https://avatars.mds.yandex.net/get-altay/7179902/2a00000183d8472e516bf9e59696257889b7/XXXL' }}
            style={aboutStyles.galleryImage}
          />
          <Image 
            source={{ uri: 'https://avatars.mds.yandex.net/get-altay/5473371/2a0000017f28a6bb99aa7591c16e83d47050/XXXL' }}
            style={aboutStyles.galleryImage}
          />
          <Image 
            source={{ uri: 'https://avatars.mds.yandex.net/get-altay/10636707/2a0000018b0615bf1b948c772946e9edd001/XXXL' }}
            style={aboutStyles.galleryImage}
          />
          <Image 
            source={{ uri: 'https://i.pinimg.com/736x/63/7f/10/637f106bb34579117e5a344ffdd8a5a7.jpg' }}
            style={aboutStyles.galleryImage}
          />
        </ScrollView>
      </View>

      {/* Услуги */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>✨ Наши услуги</Text>
        
        <View style={aboutStyles.servicesGrid}>
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>💨</Text>
            <Text style={aboutStyles.serviceTitle}>Кальяны</Text>
            <Text style={aboutStyles.serviceDescription}>
              Широкий выбор табаков и вкусов
            </Text>
          </View>
          
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>🍹</Text>
            <Text style={aboutStyles.serviceTitle}>Напитки</Text>
            <Text style={aboutStyles.serviceDescription}>
              Освежающие коктейли и чаи
            </Text>
          </View>
          
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>🎵</Text>
            <Text style={aboutStyles.serviceTitle}>Музыка</Text>
            <Text style={aboutStyles.serviceDescription}>
              Приятная атмосферная музыка
            </Text>
          </View>
          
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>🎮</Text>
            <Text style={aboutStyles.serviceTitle}>Развлечения</Text>
            <Text style={aboutStyles.serviceDescription}>
              Настольные игры и приставка
            </Text>
          </View>
        </View>
      </View>

      {/* Время работы */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>🕒 Время работы</Text>
        <View style={aboutStyles.schedule}>
          <View style={aboutStyles.scheduleItem}>
            <Text style={aboutStyles.scheduleDay}>Пн - Чт</Text>
            <Text style={aboutStyles.scheduleTime}>11:00 - 01:00</Text>
          </View>
          <View style={aboutStyles.scheduleItem}>
            <Text style={aboutStyles.scheduleDay}>Пятница</Text>
            <Text style={aboutStyles.scheduleTime}>11:00 - 03:00</Text>
          </View>
          <View style={aboutStyles.scheduleItem}>
            <Text style={aboutStyles.scheduleDay}>Сб - Вс</Text>
            <Text style={aboutStyles.scheduleTime}>12:00 - 03:00</Text>
          </View>
        </View>
      </View>

      {/* Призыв к действию */}
      <View style={aboutStyles.ctaSection}>
        <Text style={aboutStyles.ctaTitle}>Ждём в гости! 🍃</Text>
        <Text style={aboutStyles.ctaText}>
          Бронируйте столики заранее по телефону или через администратора
        </Text>
        
        <TouchableOpacity style={aboutStyles.ctaButton} onPress={openPhone}>
          <Text style={aboutStyles.ctaButtonText}>📞 Забронировать стол</Text>
        </TouchableOpacity>
      </View>

      {/* Отступ внизу */}
      <View style={aboutStyles.bottomSpace} />
    </ScrollView>
  );
}

const Tab = createBottomTabNavigator();

// Главный компонент приложения - ЕДИНСТВЕННЫЙ экспорт по умолчанию
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
              <Text style={{ fontSize: size, color }}>🍽️</Text>
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
              <Text style={{ fontSize: size, color }}>🗺️</Text>
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
              <Text style={{ fontSize: size, color }}>👤</Text>
            ),
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: '«О нас»',
            tabBarLabel: '«О нас»',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>ℹ️</Text>
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
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
  mapContainerAndroid: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  tableAndroid: {
    minWidth: 55,
    minHeight: 55,
  },
  tableNumberAndroid: {
    fontSize: 18,
  },
});

// Стили для AboutScreen
const aboutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  imageContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#E8F5E8',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 18,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactHint: {
    fontSize: 12,
    color: '#2E7D32',
    fontStyle: 'italic',
  },
  gallery: {
    marginHorizontal: -5,
  },
  galleryImage: {
    width: 280,
    height: 180,
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: '#E8F5E8',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  serviceItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  schedule: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleDay: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  ctaSection: {
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  bottomSpace: {
    height: 30,
  },
  discountItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
  },
  discountIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  discountInfo: {
    flex: 1,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  discountDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  discountNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 4,
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