// services/api.ts
import { MenuSection, MenuItem, User, AuthCredentials, RegisterData, MenuCategory } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://109.172.37.118:3001/api';

// Вспомогательная функция для работы с AsyncStorage
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
};

export class ApiService {
  static readonly BASE_URL = API_BASE_URL;

  static async getMenu(includeHidden: boolean = false): Promise<MenuSection[]> {
    try {
      console.log('🔄 Загрузка меню...');
      const token = await storage.getItem('authToken');
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (includeHidden) {
        headers['X-Include-Hidden'] = 'true';
      }

      const response = await fetch(`${API_BASE_URL}/menu`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Меню загружено:', data.length, 'категорий');
      
      // Логируем информацию о изображениях для отладки
      data.forEach((category: MenuSection) => {
        console.log(`📁 Категория: ${category.title}, товаров: ${category.data.length}`);
        category.data.forEach((item: MenuItem) => {
          console.log(`   🍽️ ${item.name}: ${item.image ? '🖼️' : '❌'} ${item.image}, available: ${item.is_available}`);
        });
      });
      
      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке меню:', error);
      throw error;
    }
  }

  static async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Сохраняем токен и пользователя
      await storage.setItem('authToken', data.token);
      await storage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  }

  static async register(registerData: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Сохраняем токен и пользователя
      await storage.setItem('authToken', data.token);
      await storage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  }

  static async getProfile(): Promise<User> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    await storage.removeItem('authToken');
    await storage.removeItem('user');
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await storage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Ошибка при получении текущего пользователя:', error);
      return null;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    return await storage.getItem('authToken');
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Удаление позиции меню (включая изображение из Cloudinary)
  static async deleteMenuItem(id: string, cloudinaryPublicId?: string): Promise<{ success: boolean }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Создаем объект с данными для удаления
      const deleteData: any = {};
      if (cloudinaryPublicId) {
        deleteData.cloudinary_public_id = cloudinaryPublicId;
      }

      const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      throw error;
    }
  }

  // Переключение видимости позиции
  static async toggleMenuItemVisibility(id: string, isAvailable: boolean): Promise<{ success: boolean; item: any }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch(`${API_BASE_URL}/menu-items/${id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: isAvailable
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при изменении видимости товара:', error);
      throw error;
    }
  }
  // services/api.ts - добавьте эти методы

// Получение категорий
static async getCategories(): Promise<MenuCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Ошибка при загрузке категорий:', error);
    throw error;
  }
}

// Добавление нового товара
static async addMenuItem(itemData: any): Promise<{ success: boolean; item: MenuItem }> {
  try {
    const token = await storage.getItem('authToken');
    if (!token) {
      throw new Error('Требуется авторизация');
    }

    const response = await fetch(`${API_BASE_URL}/menu-items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при добавлении товара:', error);
    throw error;
  }
}

// Обновление товара
static async updateMenuItem(id: string, itemData: any): Promise<{ success: boolean; item: MenuItem }> {
  try {
    const token = await storage.getItem('authToken');
    if (!token) {
      throw new Error('Требуется авторизация');
    }

    const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    throw error;
  }
}
}