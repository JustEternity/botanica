import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
  NativeScrollEvent
} from 'react-native';

// Включаем анимации для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
      // Используем measure для получения точных координат
      categoryHeader.measure((_x: number, _y: number, _width: number, _height: number, _pageX: number, pageY: number) => {
        // Вычисляем правильную позицию с учетом высоты фиксированного заголовка
        const scrollPosition = Math.max(0, pageY - headerHeight - 10); // -10 для небольшого отступа
        
        scrollViewRef.current?.scrollTo({ 
          y: scrollPosition, 
          animated: true 
        });
        
        // Сбрасываем состояние прокрутки через короткое время
        setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      });
    }

    // Прокручиваем горизонтальные категории к выбранной
    const categoryDataIndex = MENU_DATA.findIndex(section => section.id === categoryId);
    if (categoriesRef.current && categoryDataIndex !== -1) {
      categoriesRef.current.scrollToIndex({
        index: categoryDataIndex,
        animated: true,
        viewPosition: 0.5
      });
    }

    // Очищаем предыдущий таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [isScrolling, headerHeight]);

  // Обработчик скролла для определения видимой категории
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    
    // Если пользователь сам скроллит, не обновляем выбранную категорию
    if (isScrolling) return;

    // Находим ближайшую видимую категорию
    let closestCategory = selectedCategory;
    let minDistance = Infinity;

    MENU_DATA.forEach(category => {
      const categoryHeader = categoryRefs.current[category.id];
      if (categoryHeader) {
        categoryHeader.measure((_x: number, _y: number, _width: number, _height: number, _pageX: number, pageY: number) => {
          // Учитываем высоту фиксированного заголовка при определении видимости
          const categoryTop = pageY - headerHeight;
          const distance = Math.abs(scrollY - categoryTop);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestCategory = category.id;
          }

          // Если это последняя категория, обновляем состояние
          if (category.id === MENU_DATA[MENU_DATA.length - 1].id && closestCategory !== selectedCategory) {
            setSelectedCategory(closestCategory);
            
            // Прокручиваем горизонтальные категории к активной
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

    // Сбрасываем состояние прокрутки через короткое время после окончания скролла
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
    <View style={styles.container}>
      {/* Фиксированный заголовок и категории */}
      <View 
        style={styles.headerContainer}
        onLayout={measureHeader}
      >
        <Text style={styles.title}>🍽️ Меню Botanica</Text>
        
        {/* Горизонтальный список категорий в овальчиках */}
        <View style={styles.categoriesContainer}>
          <FlatList
            ref={categoriesRef}
            data={MENU_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item.id && styles.categoryButtonActive
                ]}
                onPress={() => scrollToCategory(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      </View>

      {/* ScrollView с точной прокруткой */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {MENU_DATA.map(category => (
          <View key={category.id}>
            {/* Заголовок категории с ref для точной прокрутки */}
            <View 
              style={styles.sectionHeader}
              ref={setCategoryRef(category.id)}
            >
              <Text style={styles.sectionTitle}>{category.title}</Text>
            </View>
            
            {/* Позиции меню в категории */}
            {category.data.map(item => (
              <View key={item.id} style={styles.menuItem}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price} ₽</Text>
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        
        {/* Отступ внизу */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// Остальные экраны (пока простые заглушки)
function ProfileScreen() {
  return (
    <View style={styles.simpleContainer}>
      <Text style={styles.simpleTitle}>👤 Профиль</Text>
      <Text>Информация о пользователе</Text>
    </View>
  );
}

function HallMapScreen() {
  return (
    <View style={styles.simpleContainer}>
      <Text style={styles.simpleTitle}>🗺️ Схема зала</Text>
      <Text>Схема столов для бронирования</Text>
    </View>
  );
}

function AboutScreen() {
  return (
    <View style={styles.simpleContainer}>
      <Text style={styles.simpleTitle}>ℹ️ О нас</Text>
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

const styles = StyleSheet.create({
  // Стили для экрана меню
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
    zIndex: 10,
    // Тень для iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Тень для Android
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
  
  // Стили для простых экранов
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