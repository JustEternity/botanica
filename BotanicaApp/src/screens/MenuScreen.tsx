import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MenuSection, MenuItem } from '../types';
import { menuStyles } from '../styles/menuStyles';
import { ApiService } from '../services/api';

// Тематические фразы для загрузки
const LOADING_PHRASES = [
  "Затягиваемся...",
  "Забиваем кальян...", 
  "Разжигаем угли...",
  "Подготавливаем табак...",
  "Настраиваем атмосферу...",
  "Готовим вкусы..."
];

// Cloudinary плейсхолдер
const CLOUDINARY_PLACEHOLDER = 'https://res.cloudinary.com/dczeplme4/image/upload/w_300,h_200,c_fill,q_auto,f_auto/botanica_placeholder';

// Компонент для элемента меню с обработкой ошибок изображения
const MenuItemComponent = React.memo(({ item }: { item: MenuItem }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View style={menuStyles.menuItem}>
      <View style={menuStyles.itemImageContainer}>
        <Image
          source={{ 
            uri: imageError ? CLOUDINARY_PLACEHOLDER : item.image 
          }}
          style={menuStyles.itemImage}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {imageLoading && (
          <View style={[menuStyles.itemImage, menuStyles.imageLoading]}>
            <ActivityIndicator size="small" color="#2E7D32" />
          </View>
        )}
      </View>
      <View style={menuStyles.itemContent}>
        <View style={menuStyles.itemHeader}>
          <Text style={menuStyles.itemName}>{item.name}</Text>
          <Text style={menuStyles.itemPrice}>{item.price} ₽</Text>
        </View>
        <Text style={menuStyles.itemDescription}>{item.description}</Text>
      </View>
    </View>
  );
});

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);
  const [menuData, setMenuData] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [isDataReady, setIsDataReady] = useState(false);

  const categoriesRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<{[key: string]: number}>({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingPhraseRef = useRef<NodeJS.Timeout | null>(null);

  // Смена фраз загрузки
  useEffect(() => {
    if (loading) {
      let currentIndex = 0;
      setLoadingPhrase(LOADING_PHRASES[0]);
      
      loadingPhraseRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % LOADING_PHRASES.length;
        setLoadingPhrase(LOADING_PHRASES[currentIndex]);
      }, 2000);
    } else {
      if (loadingPhraseRef.current) {
        clearInterval(loadingPhraseRef.current);
      }
    }

    return () => {
      if (loadingPhraseRef.current) {
        clearInterval(loadingPhraseRef.current);
      }
    };
  }, [loading]);

  // Загрузка данных меню
  const loadMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getMenu();
      setMenuData(data);
      
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
        
        setTimeout(() => {
          setIsDataReady(true);
        }, 100);
      }
    } catch (err) {
      setError('Не удалось загрузить меню. Проверьте подключение к интернету.');
      console.error('Ошибка загрузки меню:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuData();
  }, []);

  // Функция для прокрутки к выбранной категории
  const scrollToCategory = useCallback((categoryId: string) => {
    if (isScrolling || !menuData.length || !isDataReady) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(categoryId);
    setIsScrolling(true);

    const targetPosition = categoryPositions.current[categoryId];
    
    if (scrollViewRef.current && targetPosition !== undefined) {
      scrollViewRef.current.scrollTo({
        y: Math.max(0, targetPosition - 20),
        animated: true
      });
    }

    const categoryDataIndex = menuData.findIndex(section => section.id === categoryId);
    if (categoriesRef.current && categoryDataIndex !== -1) {
      categoriesRef.current.scrollToIndex({
        index: categoryDataIndex,
        animated: true,
        viewPosition: 0.5
      });
    }

    setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  }, [isScrolling, menuData, isDataReady]);

  const saveCategoryPosition = useCallback((categoryId: string, y: number) => {
    categoryPositions.current[categoryId] = y;
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolling || !menuData.length || !isDataReady) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    const viewportHeight = event.nativeEvent.layoutMeasurement.height;
    
    let newSelectedCategory = selectedCategory;
    let foundInViewport = false;

    Object.entries(categoryPositions.current).forEach(([sectionId, sectionY]) => {
      if (scrollY >= sectionY - 100 && scrollY <= sectionY + 100) {
        newSelectedCategory = sectionId;
        foundInViewport = true;
      }
    });

    if (!foundInViewport) {
      let closestSection = menuData[0]?.id || '';
      let minDistance = Infinity;

      Object.entries(categoryPositions.current).forEach(([sectionId, sectionY]) => {
        if (sectionY <= scrollY + 50) {
          const distance = scrollY - sectionY;
          if (distance >= 0 && distance < minDistance) {
            minDistance = distance;
            closestSection = sectionId;
          }
        }
      });

      if (closestSection && minDistance < viewportHeight) {
        newSelectedCategory = closestSection;
      }
    }

    if (newSelectedCategory && newSelectedCategory !== selectedCategory) {
      setSelectedCategory(newSelectedCategory);

      const categoryDataIndex = menuData.findIndex(section => section.id === newSelectedCategory);
      if (categoriesRef.current && categoryDataIndex !== -1) {
        categoriesRef.current.scrollToIndex({
          index: categoryDataIndex,
          animated: true,
          viewPosition: 0.5
        });
      }
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [isScrolling, selectedCategory, menuData, isDataReady]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const handleMomentumScrollEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (loadingPhraseRef.current) {
        clearInterval(loadingPhraseRef.current);
      }
    };
  }, []);

  // Экран загрузки
  if (loading) {
    return (
      <View style={[menuStyles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>💨</Text>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={{ marginTop: 20, color: '#2E7D32', fontSize: 18, fontWeight: '600' }}>
            {loadingPhrase}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[menuStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>😔</Text>
          <Text style={{ fontSize: 18, color: '#F44336', marginBottom: 16, textAlign: 'center', fontWeight: '600' }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#2E7D32',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 25,
              marginTop: 10,
            }}
            onPress={loadMenuData}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isDataReady && menuData.length > 0) {
    return (
      <View style={[menuStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: '#666' }}>Подготавливаем меню...</Text>
      </View>
    );
  }

  return (
    <View style={menuStyles.container}>
      <View style={menuStyles.headerContainer}>
        <View style={menuStyles.categoriesContainer}>
          <FlatList
            ref={categoriesRef}
            data={menuData}
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

      <ScrollView
        ref={scrollViewRef}
        style={menuStyles.menuContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={menuStyles.scrollContent}
      >
        {menuData.map((category) => (
          <View 
            key={category.id}
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              saveCategoryPosition(category.id, y);
            }}
          >
            <View style={menuStyles.sectionHeader}>
              <Text style={menuStyles.sectionTitle}>{category.title}</Text>
            </View>

            {category.data.map((item) => (
              <MenuItemComponent key={item.id} item={item} />
            ))}
          </View>
        ))}

        <View style={menuStyles.bottomSpace} />
      </ScrollView>
    </View>
  );
}