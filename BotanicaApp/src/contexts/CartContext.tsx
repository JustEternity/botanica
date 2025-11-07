import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem, Table } from '../types';

interface CartTable {
  table: Table;
  startTime: Date;
  endTime: Date;
  guestsCount: number;
}

interface CartMenuItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  // Данные корзины
  tableReservation: CartTable | null;
  menuItems: CartMenuItem[];
  comment: string;
  isLoading: boolean;
  
  // Методы для столиков
  setTableReservation: (table: CartTable) => void;
  updateTableGuests: (guestsCount: number) => void;
  removeTableReservation: () => void;
  
  // Методы для товаров
  addMenuItem: (item: MenuItem, quantity: number) => void;
  updateMenuItemQuantity: (itemId: string, newQuantity: number) => void;
  removeMenuItem: (itemId: string) => void;
  
  // Общие методы
  setComment: (comment: string) => void;
  clearCart: () => void;
  
  // Вспомогательные методы
  getTotalPrice: () => number;
  getItemsCount: () => number;
  isEmpty: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@botanica_cart';

interface StoredCart {
  tableReservation: CartTable | null;
  menuItems: CartMenuItem[];
  comment: string;
  savedAt: string;
}

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [tableReservation, setTableReservation] = useState<CartTable | null>(null);
  const [menuItems, setMenuItems] = useState<CartMenuItem[]>([]);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка корзины из AsyncStorage при старте приложения
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Сохранение корзины в AsyncStorage при каждом изменении
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage();
    }
  }, [tableReservation, menuItems, comment, isLoading]);

  const loadCartFromStorage = async () => {
    try {
      console.log('🔄 Загрузка корзины из хранилища...');
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      
      if (storedCart) {
        const parsedCart: StoredCart = JSON.parse(storedCart);
        
        // Восстанавливаем объекты Date из строк
        if (parsedCart.tableReservation) {
          parsedCart.tableReservation.startTime = new Date(parsedCart.tableReservation.startTime);
          parsedCart.tableReservation.endTime = new Date(parsedCart.tableReservation.endTime);
        }

        setTableReservation(parsedCart.tableReservation);
        setMenuItems(parsedCart.menuItems || []);
        setComment(parsedCart.comment || '');

        console.log('✅ Корзина загружена:', {
          table: parsedCart.tableReservation ? `Стол №${parsedCart.tableReservation.table.number}` : 'нет',
          items: parsedCart.menuItems?.length || 0,
          comment: parsedCart.comment ? 'есть' : 'нет'
        });
      } else {
        console.log('📭 Корзина не найдена в хранилище');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки корзины:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToStorage = async () => {
    try {
      const cartToSave: StoredCart = {
        tableReservation,
        menuItems,
        comment,
        savedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
      console.log('💾 Корзина сохранена:', {
        table: tableReservation ? `Стол №${tableReservation.table.number}` : 'нет',
        items: menuItems.length,
        time: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('❌ Ошибка сохранения корзины:', error);
    }
  };

  const clearStorageCart = async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      console.log('🗑️ Корзина очищена из хранилища');
    } catch (error) {
      console.error('❌ Ошибка очистки корзины:', error);
    }
  };

  // Методы для столиков
  const handleSetTableReservation = (tableData: CartTable) => {
    setTableReservation(tableData);
  };

  const handleUpdateTableGuests = (guestsCount: number) => {
    if (tableReservation) {
      setTableReservation({
        ...tableReservation,
        guestsCount: Math.max(1, Math.min(guestsCount, tableReservation.table.maxPeople || 10))
      });
    }
  };

  const handleRemoveTableReservation = () => {
    setTableReservation(null);
  };

  // Методы для товаров
  const addMenuItem = (item: MenuItem, quantity: number) => {
    setMenuItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.item.id === item.id);
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prev, { item, quantity }];
      }
    });
  };

  const updateMenuItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeMenuItem(itemId);
      return;
    }

    setMenuItems(prev =>
      prev.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const removeMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
  };

  // Общие методы
  const handleSetComment = (newComment: string) => {
    setComment(newComment);
  };

  const clearCart = () => {
    setTableReservation(null);
    setMenuItems([]);
    setComment('');
    clearStorageCart();
  };

  // Вспомогательные методы
  const getTotalPrice = () => {
    const itemsTotal = menuItems.reduce(
      (sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 
      0
    );
    return itemsTotal;
  };

  const getItemsCount = () => {
    return menuItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  };

  const isEmpty = () => {
    return !tableReservation && menuItems.length === 0;
  };

  return (
    <CartContext.Provider value={{
      // Данные
      tableReservation,
      menuItems,
      comment,
      isLoading,
      
      // Методы для столиков
      setTableReservation: handleSetTableReservation,
      updateTableGuests: handleUpdateTableGuests,
      removeTableReservation: handleRemoveTableReservation,
      
      // Методы для товаров
      addMenuItem,
      updateMenuItemQuantity,
      removeMenuItem,
      
      // Общие методы
      setComment: handleSetComment,
      clearCart,
      
      // Вспомогательные
      getTotalPrice,
      getItemsCount,
      isEmpty,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};