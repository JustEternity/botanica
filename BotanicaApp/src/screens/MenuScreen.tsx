// screens/MenuScreen.tsx
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
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { MenuSection, MenuItem, MenuCategory, ContextMenuAction } from '../types';
import MenuModal from '../components/MenuModal';
import { menuStyles } from '../styles/menuStyles';
import { ApiService } from '../services/api';
import { getOptimizedImageUrl, preloadImage } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import ContextMenu from '../components/ContextMenu';
import AndroidContextMenu from '../components/AndroidContextMenu';
import EditMenuItemModal from '../components/EditMenuItemModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Константы
const LOADING_PHRASES = [
  "Затягиваемся...",
  "Забиваем кальян...", 
  "Разжигаем угли...",
  "Подготавливаем табак...",
  "Настраиваем атмосферу...",
  "Готовим вкусы..."
];

const CLOUDINARY_PLACEHOLDER = 'https://res.cloudinary.com/dczeplme4/image/upload/w_300,h_200,c_fill,q_auto,f_auto/botanica_placeholder';

// Компонент элемента меню (без изменений)
const MenuItemComponent: React.FC<{
  item: MenuItem;
  onItemPress: (item: MenuItem) => void;
  onPlusPress: (item: MenuItem) => void;
  onLongPress: (item: MenuItem) => void;
}> = React.memo(({ 
  item, 
  onItemPress, 
  onPlusPress,
  onLongPress 
}) => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentImageUri, setCurrentImageUri] = useState<string>('');

  const MAX_RETRIES = 2;
  const RETRY_DELAY = 3000;

  const optimizedImageUrl = getOptimizedImageUrl(item.image, 160, 160);

  const loadImageWithRetry = useCallback(async (url: string, retryAttempt = 0) => {
    try {
      setImageLoading(true);
      setImageError(false);
      
      await preloadImage(url);
      setCurrentImageUri(url);
      setImageLoading(false);
    } catch (error) {
      console.log(`Ошибка загрузки изображения для ${item.name} (попытка ${retryAttempt + 1}):`, error);
      
      if (retryAttempt < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadImageWithRetry(url, retryAttempt + 1);
        }, RETRY_DELAY);
      } else {
        setImageError(true);
        setImageLoading(false);
      }
    }
  }, [item.name]);

  useEffect(() => {
    if (item.image) {
      loadImageWithRetry(optimizedImageUrl);
    }
  }, [item.image, optimizedImageUrl, loadImageWithRetry]);

  useEffect(() => {
    if (retryCount > 0 && !imageLoading && !imageError) {
      loadImageWithRetry(optimizedImageUrl);
    }
  }, [retryCount, imageLoading, imageError, loadImageWithRetry, optimizedImageUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handlePlusPress = useCallback((e: any) => {
    e.stopPropagation();
    onPlusPress(item);
  }, [item, onPlusPress]);

  const handleItemPress = useCallback(() => {
    onItemPress(item);
  }, [item, onItemPress]);

  const handleLongPress = useCallback(() => {
    onLongPress(item);
  }, [item, onLongPress]);

  const handleRetryLoad = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setImageError(false);
    setImageLoading(true);
  }, []);

  return (
    <View style={menuStyles.menuItemContainer}>
      <TouchableOpacity 
        style={menuStyles.menuItem}
        onPress={handleItemPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Индикатор скрытого товара для администратора */}
        {user?.role === 'admin' && item.is_available === false && (
          <View style={styles.hiddenIndicator}>
            <Text style={styles.hiddenIndicatorText}>Скрыто</Text>
          </View>
        )}

        <View style={menuStyles.itemImageContainer}>
          {imageLoading && (
            <View style={[menuStyles.itemImage, styles.imageLoading]}>
              <ActivityIndicator size="small" color="#2E7D32" />
              {retryCount > 0 && (
                <Text style={styles.retryText}>
                  Повторная загрузка... ({retryCount}/{MAX_RETRIES})
                </Text>
              )}
            </View>
          )}
          
          {!imageLoading && imageError && (
            <TouchableOpacity 
              style={[menuStyles.itemImage, styles.imageError]}
              onPress={handleRetryLoad}
              activeOpacity={0.7}
            >
              <Text style={styles.errorIcon}>🖼️</Text>
              <Text style={styles.errorText}>Ошибка загрузки</Text>
              <Text style={styles.retryHint}>Нажмите для повторной загрузки</Text>
            </TouchableOpacity>
          )}
          
          {!imageLoading && !imageError && (
            <Image
              source={{ uri: currentImageUri || optimizedImageUrl }}
              style={menuStyles.itemImage}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </View>
        
        <View style={menuStyles.itemContent}>
          <View style={menuStyles.itemHeader}>
            <Text style={menuStyles.itemName}>{item.name}</Text>
            <Text style={menuStyles.itemPrice}>{item.price} ₽</Text>
          </View>
          <Text style={menuStyles.itemDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.plusButton}
        onPress={handlePlusPress}
        activeOpacity={0.8}
      >
        <Text style={styles.plusButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

// Основной компонент экрана меню
export default function MenuScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);
  const [menuData, setMenuData] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [isDataReady, setIsDataReady] = useState(false);
  
  // Состояния для основного модального окна товара
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [initialQuantity, setInitialQuantity] = useState(0);

  // Состояния для контекстного меню
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedContextItem, setSelectedContextItem] = useState<MenuItem | null>(null);

  // Состояния для модального окна редактирования/добавления
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Состояния для pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  const categoriesRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<{[key: string]: number}>({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingPhraseRef = useRef<NodeJS.Timeout | null>(null);
  const addButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Сбрасываем контекстное меню при изменении пользователя
  useEffect(() => {
    if (!user) {
      setSelectedContextItem(null);
      setContextMenuVisible(false);
      setShowAddButton(false);
    }
  }, [user]);

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
      if (addButtonTimeoutRef.current) {
        clearTimeout(addButtonTimeoutRef.current);
      }
    };
  }, [loading]);

  const loadMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Начинаем загрузку меню...');
      
      // Для администраторов загружаем все товары, включая скрытые
      const includeHidden = user?.role === 'admin';
      const data = await ApiService.getMenu(includeHidden);
      setMenuData(data);
      
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
        
        // Даем время на рендеринг перед установкой позиций
        setTimeout(() => {
          setIsDataReady(true);
        }, 500);
      }
      
      console.log('✅ Меню успешно загружено в состояние');
    } catch (err) {
      const errorMessage = 'Не удалось загрузить меню. Проверьте подключение к интернету.';
      setError(errorMessage);
      console.error('❌ Ошибка загрузки меню:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // Функция для pull-to-refresh
  const onRefresh = useCallback(() => {
    if (user?.role !== 'admin') {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);

    // Имитируем задержку в 1.5 секунды
    addButtonTimeoutRef.current = setTimeout(() => {
      setShowAddButton(true);
      setRefreshing(false);
      
      // Автоматически скрываем кнопку через 5 секунд
      setTimeout(() => {
        setShowAddButton(false);
      }, 5000);
    }, 1500);
  }, [user]);

  // Функция для открытия модального окна добавления
  const openAddModal = () => {
    setEditingItem(null);
    setEditModalVisible(true);
    setShowAddButton(false);
  };

  const openModalWithPlus = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setInitialQuantity(1);
    setModalVisible(true);
  }, []);

  const openModalWithItem = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setInitialQuantity(0);
    setModalVisible(true);
  }, []);

  const handleAddToOrder = useCallback((item: MenuItem, quantity: number) => {
    Alert.alert(
      'Добавлено в заказ',
      `${item.name} x${quantity} на сумму ${item.price * quantity} ₽`
    );
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Функция для обработки долгого нажатия
  const handleLongPress = useCallback((item: MenuItem) => {
    if (user?.role === 'admin') {
      setSelectedContextItem({...item});
      
      if (Platform.OS === 'ios') {
        // Для iOS ContextMenu сам покажет ActionSheet
      } else {
        // Для Android показываем кастомное модальное окно
        setContextMenuVisible(true);
      }
    }
  }, [user]);

  // Функция обработки действий контекстного меню
  const handleContextMenuAction = useCallback(async (action: ContextMenuAction, item: MenuItem) => {
    // Сбрасываем выбранный элемент сразу после начала действия
    if (Platform.OS === 'ios') {
      setSelectedContextItem(null);
    }

    switch (action) {
      case 'delete':
        try {
          await ApiService.deleteMenuItem(item.id, item.cloudinary_public_id);
          Alert.alert('Успех', 'Товар успешно удален');
          loadMenuData();
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось удалить товар');
        }
        break;

      case 'toggle_visibility':
        try {
          const newVisibility = !item.is_available;
          await ApiService.toggleMenuItemVisibility(item.id, newVisibility);
          Alert.alert('Успех', `Товар ${newVisibility ? 'опубликован' : 'скрыт'}`);
          loadMenuData();
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось изменить видимость товара');
        }
        break;

      case 'edit':
        setEditingItem(item);
        setEditModalVisible(true);
        break;

      case 'cancel':
        // Просто закрываем меню (для iOS)
        break;
    }

    // Для Android закрываем модальное окно после любого действия
    if (Platform.OS === 'android') {
      setContextMenuVisible(false);
      setSelectedContextItem(null);
    }
  }, [loadMenuData]);

  // Обработчик сохранения товара
  const handleSaveItem = useCallback(async (itemData: MenuItem) => {
    try {
      // Здесь будет вызов API для сохранения товара
      // Пока просто обновляем локальное состояние
      if (editingItem) {
        // Редактирование существующего товара
        Alert.alert('Успех', 'Товар обновлен (в демо-режиме)');
      } else {
        // Добавление нового товара
        Alert.alert('Успех', 'Товар добавлен (в демо-режиме)');
      }
      loadMenuData();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить товар');
    }
  }, [editingItem, loadMenuData]);

  // Функция для закрытия Android контекстного меню
  const handleCloseAndroidMenu = useCallback(() => {
    setContextMenuVisible(false);
    setSelectedContextItem(null);
  }, []);

  // Функция для обработки отмены в iOS ActionSheet
  const handleIOSActionSheetCancel = useCallback(() => {
    setSelectedContextItem(null);
  }, []);

  // Функция для закрытия модального окна редактирования
  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingItem(null);
  }, []);

  // Получаем список категорий для формы
  const categories: MenuCategory[] = menuData.map(section => ({
    id: section.id,
    title: section.title,
    is_active: section.is_active
  }));

  // Восстановленная функция скролла к категории
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

  // Сохранение позиций категорий
  const saveCategoryPosition = useCallback((categoryId: string, y: number) => {
    categoryPositions.current[categoryId] = y;
  }, []);

  // Обработчики скролла (восстановленные)
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolling || !menuData.length || !isDataReady) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    const viewportHeight = event.nativeEvent.layoutMeasurement.height;
    
    let newSelectedCategory = selectedCategory;
    let foundInViewport = false;

    // Ищем категорию в viewport
    Object.entries(categoryPositions.current).forEach(([sectionId, sectionY]) => {
      if (scrollY >= sectionY - 100 && scrollY <= sectionY + 100) {
        newSelectedCategory = sectionId;
        foundInViewport = true;
      }
    });

    // Если не нашли в viewport, ищем ближайшую сверху
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

      // Скроллим горизонтальный список категорий
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
      if (addButtonTimeoutRef.current) {
        clearTimeout(addButtonTimeoutRef.current);
      }
    };
  }, []);

  const renderCategoryItem = useCallback(({ item }: { item: MenuSection }) => (
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
  ), [selectedCategory, scrollToCategory]);

  const renderMenuSection = useCallback((category: MenuSection) => (
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
        <MenuItemComponent 
          key={item.id} 
          item={item} 
          onItemPress={openModalWithItem}
          onPlusPress={openModalWithPlus}
          onLongPress={handleLongPress}
        />
      ))}
    </View>
  ), [openModalWithItem, openModalWithPlus, handleLongPress, saveCategoryPosition]);

  if (loading) {
    return (
      <View style={[menuStyles.container, styles.centeredContainer]}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>💨</Text>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>{loadingPhrase}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[menuStyles.container, styles.centeredContainer]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadMenuData}
          >
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isDataReady && menuData.length > 0) {
    return (
      <View style={[menuStyles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.preparingText}>Подготавливаем меню...</Text>
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
            renderItem={renderCategoryItem}
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
        refreshControl={
          user?.role === 'admin' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E7D32']}
              tintColor="#2E7D32"
            />
          ) : undefined
        }
      >
        {/* Кнопка добавления товара (появляется после pull-to-refresh) */}
        {showAddButton && (
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Добавить новый товар</Text>
          </TouchableOpacity>
        )}

        {menuData.map(renderMenuSection)}
        <View style={menuStyles.bottomSpace} />
      </ScrollView>

      {/* Основное модальное окно просмотра товара */}
      <MenuModal
        visible={modalVisible}
        item={selectedItem}
        initialQuantity={initialQuantity}
        onClose={closeModal}
        onAddToOrder={handleAddToOrder}
      />

      {/* Модальное окно добавления/редактирования товара */}
      <EditMenuItemModal
        visible={editModalVisible}
        categories={categories}
        item={editingItem}
        onClose={handleCloseEditModal}
        onSave={handleSaveItem}
      />

      {/* Контекстное меню для iOS */}
      {Platform.OS === 'ios' && (
        <ContextMenu
          item={selectedContextItem}
          onAction={handleContextMenuAction}
          onCancel={handleIOSActionSheetCancel}
        />
      )}

      {/* Контекстное меню для Android */}
      {Platform.OS === 'android' && (
        <AndroidContextMenu
          visible={contextMenuVisible}
          item={selectedContextItem}
          onClose={handleCloseAndroidMenu}
          onAction={handleContextMenuAction}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 20,
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContent: {
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  preparingText: {
    marginTop: 16,
    color: '#666',
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageError: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#d32f2f',
  },
  retryHint: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  retryText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  plusButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  plusButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  hiddenIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 5,
  },
  hiddenIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});