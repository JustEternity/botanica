// src/screens/MenuScreen.tsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  Animated,
  PanResponder,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useTable } from '../contexts/TableContext';
import { MenuSection, MenuItem, MenuCategory, ContextMenuAction } from '../types';
import MenuModal from '../components/MenuModal';
import { menuStyles } from '../styles/menuStyles';
import { ApiService } from '../services/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ContextMenu from '../components/ContextMenu';
import AndroidContextMenu from '../components/AndroidContextMenu';
import EditMenuItemModal from '../components/EditMenuItemModal';
import FloatingCartButton from '../components/FloatingCartButton';
import CartModal from '../components/CartModal';
import { incrementGlobalMenuVersion, incrementImageVersion } from '../utils/imageCache';
import { useMenu } from '../contexts/MenuContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Константы для Pull-to-Add
const PULL_THRESHOLD = 175;
const HOLD_DURATION = 1000;
const MAX_PULL_DISTANCE = 500;
const HOLD_PROGRESS_THRESHOLD = 0.5;

const LOADING_PHRASES = [
  "Затягиваемся...",
  "Забиваем кальян...",
  "Разжигаем угли...",
  "Подготавливаем табак...",
  "Настраиваем атмосферу...",
  "Готовим вкусы..."
];

// Компонент индикатора Pull-to-Add
const PullToAddIndicator: React.FC<{
  progress: number;
  isActive: boolean;
  isHolding: boolean;
  holdProgress: number;
}> = ({ progress, isActive, isHolding, holdProgress }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (progress > 0) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: Math.min(progress * 1.5, 1),
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [progress, opacityAnim, translateYAnim]);

  return (
    <View style={styles.pullIndicatorContainer}>
      <Animated.View
        style={[
          styles.pullIndicator,
          {
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <View style={styles.indicatorContent}>
          {isHolding ? (
            <View style={styles.holdProgressContainer}>
              <View style={styles.holdProgressBackground}>
                <View
                  style={[
                    styles.holdProgressFill,
                    { width: `${holdProgress * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.holdText}>
                Удерживайте... {Math.round(holdProgress * 100)}%
              </Text>
            </View>
          ) : (
            <Text style={styles.pullText}>
              {progress > 0.5 ? "Потяните сильнее..." : "Потяните для добавления товара"}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// Компонент элемента меню
const MenuItemComponent: React.FC<{
  item: MenuItem;
  onItemPress: (item: MenuItem) => void;
  onPlusPress: (item: MenuItem) => void;
  onLongPress: (item: MenuItem) => void;
  isGridLayout?: boolean;
}> = React.memo(({
  item,
  onItemPress,
  onPlusPress,
  onLongPress,
  isGridLayout = false
}) => {
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // РАЗНЫЕ РАЗМЕРЫ ДЛЯ ВЕБА И МОБИЛЬНЫХ
  const imageSize = Platform.OS === 'web' && isGridLayout ? 400 : 160;
  const optimizedImageUrl = getOptimizedImageUrl(item.image, imageSize, imageSize);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
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

  // Обработчик контекстного меню для веба
  const handleContextMenu = useCallback((e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      onLongPress(item);
    }
  }, [item, onLongPress]);

  const isAdmin = user?.role === 'admin';

  // Используем разные стили в зависимости от layout
  const containerStyle = isGridLayout
    ? [menuStyles.menuItemContainer, styles.gridMenuItemContainer]
    : menuStyles.menuItemContainer;

  const itemStyle = isGridLayout
    ? [menuStyles.menuItem, styles.gridMenuItem]
    : menuStyles.menuItem;

  const imageContainerStyle = isGridLayout
    ? [menuStyles.itemImageContainer, styles.gridImageContainer]
    : menuStyles.itemImageContainer;

  const imageStyle = isGridLayout
    ? [menuStyles.itemImage, styles.gridItemImage]
    : menuStyles.itemImage;

  const contentStyle = isGridLayout
    ? [menuStyles.itemContent, styles.gridItemContent]
    : menuStyles.itemContent;

  const nameStyle = isGridLayout
    ? [menuStyles.itemName, styles.gridItemName]
    : menuStyles.itemName;

  const priceStyle = isGridLayout
    ? [menuStyles.itemPrice, styles.gridItemPrice]
    : menuStyles.itemPrice;

  const descriptionStyle = isGridLayout
    ? [menuStyles.itemDescription, styles.gridItemDescription]
    : menuStyles.itemDescription;

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={itemStyle}
        onPress={handleItemPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
        {...(Platform.OS === 'web' ? {
          onContextMenu: handleContextMenu
        } : {})}
      >
        {isAdmin && item.is_available === false && (
          <View style={styles.hiddenIndicator}>
            <Text style={styles.hiddenIndicatorText}>Скрыто</Text>
          </View>
        )}

        {/* Добавляем область для контекстного меню на вебе */}
        {Platform.OS === 'web' && isAdmin && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            }}
            onContextMenu={handleContextMenu}
          />
        )}

        <View style={imageContainerStyle}>
          {/* Плейсхолдер - показываем всегда, реальное изображение поверх */}
          <Image
            source={require('../../assets/botanicaplaceholder.jpg')}
            style={imageStyle}
            resizeMode="cover"
          />

          {!imageError && (
            <Image
              source={{ uri: optimizedImageUrl }}
              style={[
                imageStyle,
                styles.realImage,
                { opacity: imageLoaded ? 1 : 0 }
              ]}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </View>

        <View style={contentStyle}>
          <View style={[menuStyles.itemHeader, isGridLayout && styles.gridItemHeader]}>
            <Text
              style={nameStyle}
              numberOfLines={isGridLayout ? 2 : 1}
            >
              {item.name}
            </Text>
            <Text
              style={priceStyle}
            >
              {item.price} ₽
            </Text>
          </View>
          <Text
            style={descriptionStyle}
            numberOfLines={isGridLayout ? 3 : 2}
          >
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          isGridLayout ? styles.gridPlusButton : styles.plusButton
        ]}
        onPress={handlePlusPress}
        activeOpacity={0.8}
      >
        <Text style={styles.plusButtonText}>+</Text>
      </TouchableOpacity>

      {/* Добавляем кнопку меню для админов на вебе */}
      {Platform.OS === 'web' && isAdmin && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={(e: any) => {
            e.stopPropagation();
            onLongPress(item);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.is_available === nextProps.item.is_available &&
         prevProps.isGridLayout === nextProps.isGridLayout;
});

// Основной компонент экрана меню
export default function MenuScreen() {
  const { user } = useAuth();
  const { addMenuItem } = useCart();
  const { refreshTables } = useTable();
  const { menuData, loadMenuData, refreshing, loading, error, clearError } = useMenu();
  
  const isAdmin = user?.role === 'admin';
  const { width: windowWidth } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && windowWidth > 768;

  // Refs для актуального значения isAdmin
  const isAdminRef = useRef(isAdmin);
  const pullProgressRef = useRef(new Animated.Value(0)).current;

  // Обновляем ref при изменении isAdmin
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  // Состояния Pull-to-Add (только для админов)
  const [pullState, setPullState] = useState({
    isPulling: false,
    pullDistance: 0,
    isHoldActive: false,
    holdProgress: 0,
    isAdding: false,
  });

  // Основные состояния
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [initialQuantity, setInitialQuantity] = useState(0);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedContextItem, setSelectedContextItem] = useState<MenuItem | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [webContextMenuVisible, setWebContextMenuVisible] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);

  const categoriesRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<{[key: string]: number}>({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingPhraseRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs для Pull-to-Add
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAtTopRef = useRef(true);
  const lastScrollYRef = useRef(0);
  const isHoldActiveRef = useRef(false);
  const holdProgressRef = useRef(0);
  const pullDistanceRef = useRef(0);

  // Расчет прогресса Pull-to-Add
  const pullProgress = useMemo(() => {
    return Math.min(pullState.pullDistance / PULL_THRESHOLD, 1);
  }, [pullState.pullDistance]);

  const loadMenuDataHandler = useCallback(async () => {
    try {
      await loadMenuData(isAdmin);
      
      if (menuData.length > 0) {
        setSelectedCategory(menuData[0].id);
        setIsDataReady(true);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
    }
  }, [isAdmin, loadMenuData, menuData.length]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    isHoldActiveRef.current = false;
    holdProgressRef.current = 0;
    
    setPullState(prev => ({
      ...prev, 
      isHoldActive: false, 
      holdProgress: 0
    }));
  }, []);
  
  const onRefresh = useCallback(() => {
    if (isAdminRef.current) {
      clearHoldTimer();
      isHoldActiveRef.current = false;
      holdProgressRef.current = 0;
      pullDistanceRef.current = 0;
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isHoldActive: false,
        holdProgress: 0,
        isAdding: false,
      });
    }

    loadMenuDataHandler();
  }, [loadMenuDataHandler, clearHoldTimer]);

  const handlePullRelease = useCallback(() => {
    if (!isAdminRef.current) return;
    
    const currentHoldProgress = holdProgressRef.current;
    
    clearHoldTimer();

    Animated.timing(pullProgressRef, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isHoldActive: false,
        holdProgress: 0,
        isAdding: false,
      });
      isHoldActiveRef.current = false;
      pullDistanceRef.current = 0;
      
      if (currentHoldProgress >= HOLD_PROGRESS_THRESHOLD && currentHoldProgress < 1) {
        onRefresh();
      }
    });
  }, [clearHoldTimer, onRefresh]);

  const completePullToAdd = useCallback(() => {
    if (!isAdminRef.current) return;
    
    setPullState(prev => ({ ...prev, isAdding: true }));
    
    Animated.timing(pullProgressRef, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setEditingItem(null);
      setEditModalVisible(true);
      
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isHoldActive: false,
        holdProgress: 0,
        isAdding: false,
      });
      isHoldActiveRef.current = false;
      pullDistanceRef.current = 0;
    });
  }, []);

  const startHoldTimer = useCallback(() => {
    if (!isAdminRef.current || isHoldActiveRef.current) return;

    isHoldActiveRef.current = true;
    setPullState(prev => ({ ...prev, isHoldActive: true, holdProgress: 0 }));
    holdProgressRef.current = 0;
    
    const startTime = Date.now();
    
    const updateProgress = () => {
      if (!isAtTopRef.current || !isHoldActiveRef.current || pullDistanceRef.current < PULL_THRESHOLD) {
        clearHoldTimer();
        setPullState(prev => ({ 
          ...prev, 
          isHoldActive: false, 
          holdProgress: 0
        }));
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      
      setPullState(prev => ({ ...prev, holdProgress: progress }));
      holdProgressRef.current = progress;

      if (progress < 1) {
        holdTimerRef.current = setTimeout(updateProgress, 50);
      } else {
        completePullToAdd();
      }
    };

    holdTimerRef.current = setTimeout(updateProgress, 50);
  }, [completePullToAdd, clearHoldTimer]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isAdminRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!isAdminRef.current) return false;
        return isAtTopRef.current && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        const currentIsAdmin = isAdminRef.current;
        
        if (!currentIsAdmin || !isAtTopRef.current || pullState.isAdding) {
          return;
        }

        const pullDistance = Math.min(gestureState.dy, MAX_PULL_DISTANCE);
        pullDistanceRef.current = pullDistance;
        
        setPullState(prev => ({
          ...prev,
          isPulling: true,
          pullDistance,
        }));

        Animated.timing(pullProgressRef, {
          toValue: Math.min(pullDistance / PULL_THRESHOLD, 1),
          duration: 50,
          useNativeDriver: false,
        }).start();

        if (pullDistance >= PULL_THRESHOLD) {
          if (!isHoldActiveRef.current) {
            startHoldTimer();
          }
        } else {
          if (isHoldActiveRef.current) {
            clearHoldTimer();
          }
        }
      },
      onPanResponderRelease: () => {
        if (!isAdminRef.current) return;
        handlePullRelease();
      },
      onPanResponderTerminate: () => {
        if (!isAdminRef.current) return;
        handlePullRelease();
      },
    })
  ).current;

  useEffect(() => {
    loadMenuDataHandler();
  }, [loadMenuDataHandler]);

  const TOP_BUFFER = 10;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    isAtTopRef.current = scrollY <= TOP_BUFFER;
    lastScrollYRef.current = scrollY;

    if (isAdminRef.current) {
      if (!isAtTopRef.current && (pullState.isPulling || pullState.isHoldActive)) {
        handlePullRelease();
      }

      if (scrollY < lastScrollYRef.current && isHoldActiveRef.current) {
        handlePullRelease();
      }
    }

    if (isScrolling || !menuData.length || !isDataReady) return;

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

      if (closestSection) {
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
  }, [isScrolling, selectedCategory, menuData, isDataReady, pullState.isPulling, pullState.isHoldActive, handlePullRelease]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
    
    if (isAdminRef.current && isHoldActiveRef.current) {
      handlePullRelease();
    }
  }, [handlePullRelease]);

  const handleScrollEndDrag = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const handleMomentumScrollBegin = useCallback(() => {
    if (isAdminRef.current && isHoldActiveRef.current) {
      handlePullRelease();
    }
  }, [handlePullRelease]);

  const handleMomentumScrollEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

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

  const handleAddToCart = useCallback((item: MenuItem, quantity: number) => {
    addMenuItem(item, quantity);
    Alert.alert(
      'Добавлено в корзину',
      `${item.name} x${quantity} на сумму ${item.price * quantity} ₽`
    );
  }, [addMenuItem]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleOrderSuccess = useCallback(() => {
    refreshTables();
  }, [refreshTables]);

  const handleLongPress = useCallback((item: MenuItem) => {
    if (isAdmin) {
      setSelectedContextItem({...item});
      
      if (Platform.OS === 'ios') {
        // iOS контекстное меню
      } else if (Platform.OS === 'android') {
        setContextMenuVisible(true);
      } else if (Platform.OS === 'web') {
        setWebContextMenuVisible(true);
      }
    }
  }, [isAdmin]);

  const handleContextMenuAction = useCallback(async (action: ContextMenuAction, item: MenuItem) => {
    // Закрываем все меню
    if (Platform.OS === 'ios') {
      setSelectedContextItem(null);
    } else if (Platform.OS === 'android') {
      setContextMenuVisible(false);
    } else if (Platform.OS === 'web') {
      setWebContextMenuVisible(false);
    }

    switch (action) {
      case 'delete':
        try {
          await ApiService.deleteMenuItem(item.id, item.cloudinary_public_id);
          incrementGlobalMenuVersion();
          Alert.alert('Успех', 'Товар успешно удален');
          await loadMenuData(isAdmin);
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось удалить товар');
        }
        break;

      case 'toggle_visibility':
        try {
          const newVisibility = !item.is_available;
          await ApiService.toggleMenuItemVisibility(item.id, newVisibility);
          incrementGlobalMenuVersion();
          Alert.alert('Успех', `Товар ${newVisibility ? 'опубликован' : 'скрыт'}`);
          await loadMenuData(isAdmin);
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось изменить видимость товара');
        }
        break;

      case 'edit':
        setEditingItem(item);
        setEditModalVisible(true);
        break;

      case 'cancel':
        break;
    }

    setSelectedContextItem(null);
  }, [loadMenuData, isAdmin]);

  const handleSaveItem = useCallback(async (itemData: MenuItem) => {
    try {
      incrementGlobalMenuVersion();
      if (itemData.image) {
        incrementImageVersion(itemData.image);
      }
      await loadMenuData(isAdmin);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить товар');
    }
  }, [loadMenuData, isAdmin]);

  const handleCloseAndroidMenu = useCallback(() => {
    setContextMenuVisible(false);
    setSelectedContextItem(null);
  }, []);

  const handleIOSActionSheetCancel = useCallback(() => {
    setSelectedContextItem(null);
  }, []);

  const handleCloseWebContextMenu = useCallback(() => {
    setWebContextMenuVisible(false);
    setSelectedContextItem(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingItem(null);
  }, []);

  const handleOpenCart = useCallback(() => {
    setCartModalVisible(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setCartModalVisible(false);
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    loadMenuDataHandler();
  }, [clearError, loadMenuDataHandler]);

  const categories: MenuCategory[] = menuData.map(section => ({
    id: section.id,
    title: section.title,
    is_active: section.is_active
  }));

  const scrollToCategory = useCallback((categoryId: string) => {
    if (isScrolling || !menuData.length || !isDataReady) {
      return;
    }

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

      <View style={isWebWide ? styles.gridContainer : null}>
        {category.data.map((item) => (
          <MenuItemComponent 
            key={item.id} 
            item={item} 
            onItemPress={openModalWithItem}
            onPlusPress={openModalWithPlus}
            onLongPress={handleLongPress}
            isGridLayout={isWebWide}
          />
        ))}
      </View>
    </View>
  ), [openModalWithItem, openModalWithPlus, handleLongPress, saveCategoryPosition, isWebWide]);

  // Эффекты для таймеров
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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      clearHoldTimer();
      pullProgressRef.setValue(0);
    };
  }, [loading, clearHoldTimer]);

  // Показываем экран загрузки
  if (loading || (!isDataReady && menuData.length > 0)) {
    return (
      <View style={[menuStyles.container, styles.centeredContainer]}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>💨</Text>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>
            {loading ? loadingPhrase : "Подготавливаем меню..."}
          </Text>
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
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={menuStyles.container}>
      {/* Индикатор Pull-to-Add (только для админов) */}
      {isAdmin && (pullState.isPulling || pullState.isHoldActive) && (
        <PullToAddIndicator
          progress={pullProgress}
          isActive={pullState.isHoldActive}
          isHolding={pullState.isHoldActive}
          holdProgress={pullState.holdProgress}
        />
      )}

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
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={menuStyles.scrollContent}
        refreshControl={
          !isAdmin ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E7D32']}
              tintColor="#2E7D32"
            />
          ) : undefined
        }
        {...(isAdmin ? panResponder.panHandlers : {})}
      >
        {menuData.map(renderMenuSection)}
        
        <View style={menuStyles.bottomSpace} />
      </ScrollView>

      {/* Модальные окна */}
      <MenuModal
        visible={modalVisible}
        item={selectedItem}
        initialQuantity={initialQuantity}
        onClose={closeModal}
        onAddToOrder={handleAddToCart}
      />

      <EditMenuItemModal
        visible={editModalVisible}
        categories={categories}
        item={editingItem}
        onClose={handleCloseEditModal}
        onSave={handleSaveItem}
      />

      <CartModal
        visible={cartModalVisible}
        onClose={handleCloseCart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Плавающая кнопка корзины */}
      <FloatingCartButton onPress={handleOpenCart} />

      {/* Контекстные меню */}
      {Platform.OS === 'ios' && (
        <ContextMenu
          item={selectedContextItem}
          onAction={handleContextMenuAction}
          onCancel={handleIOSActionSheetCancel}
        />
      )}

      {Platform.OS === 'android' && (
        <AndroidContextMenu
          visible={contextMenuVisible}
          item={selectedContextItem}
          onClose={handleCloseAndroidMenu}
          onAction={handleContextMenuAction}
        />
      )}

      {/* Веб-контекстное меню */}
      {Platform.OS === 'web' && (
        <ContextMenu
          item={selectedContextItem}
          onAction={handleContextMenuAction}
          onCancel={handleCloseWebContextMenu}
          visible={webContextMenuVisible}
          onClose={handleCloseWebContextMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1f0a',
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
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  plusButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
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
    marginTop: -4
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
  realImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Стили для Pull-to-Add индикатора
  pullIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    zIndex: 1000,
  },
  pullIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    opacity: 0,
    transform: [{ translateY: -15 }],
  },
  indicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  holdProgressContainer: {
    alignItems: 'center',
    minWidth: 160,
  },
  holdProgressBackground: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  holdProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  holdText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pullText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Стили для адаптивного grid layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'flex-start',
    paddingHorizontal: 24,
    marginHorizontal: 'auto',
    maxWidth: 1400,
    width: '100%',
    gap: 20
  },
  gridMenuItemContainer: {
    minWidth: 280,
    width: '23%',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    height: 380,
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  gridMenuItem: {
    flexDirection: 'column',
    height: '100%',
  },
  gridItemContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FFF8F0',
  },
  gridItemHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  gridItemName: {
    flex: 1,
    textAlign: 'left',
    marginRight: 8,
    fontWeight: '600',
    color: '#5D4037',
    fontSize: 16,
    alignSelf: 'flex-start',
    textAlignVertical: 'top',
  },
  gridItemPrice: {
    textAlign: 'right',
    fontWeight: 'bold',
    flexShrink: 0,
    color: '#4CAF50',
    fontSize: 16,
    alignSelf: 'flex-start',
    textAlignVertical: 'top',
  },
  gridItemDescription: {
    textAlign: 'left',
    marginTop: 8,
    color: '#8D6E63',
    lineHeight: 18,
    fontSize: 14,
    alignSelf: 'stretch',
    textAlignVertical: 'top',
  },
  gridImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFF8F0',
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  gridPlusButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8D6E63',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFF8F0',
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -4,
  },
});