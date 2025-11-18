// src/contexts/MenuContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { MenuSection } from '../types';
import { ApiService } from '../services/api';

interface MenuContextType {
  menuData: MenuSection[];
  loadMenuData: (isAdmin?: boolean) => Promise<void>;
  refreshing: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuData, setMenuData] = useState<MenuSection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenuData = useCallback(async (isAdmin: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const includeHidden = isAdmin;
      const data = await ApiService.getMenu(includeHidden);
      setMenuData(data);
    } catch (err) {
      const errorMessage = 'Не удалось загрузить меню. Проверьте подключение к интернету.';
      setError(errorMessage);
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <MenuContext.Provider value={{ 
      menuData, 
      loadMenuData, 
      refreshing, 
      loading, 
      error,
      clearError
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};