// services/api.ts
import {
  MenuSection,
  MenuItem,
  User,
  AuthCredentials,
  RegisterData,
  MenuCategory,
  Table,
  Order,
  CreateOrderData,
  OrdersResponse,
  TableOrdersResponse,
  TablesResponse,
  CreateOrderResponse
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudinarySignature, uploadImageToCloudinaryDirectly } from '../utils/imageUtils'
const API_BASE_URL = 'http://45.153.189.245:3001/api';


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

  // ========== МЕТОДЫ ДЛЯ МЕНЮ ==========

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

      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке меню:', error);
      throw error;
    }
  }

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

  static async deleteMenuItem(id: string, cloudinaryPublicId?: string): Promise<{ success: boolean }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      console.log('🔄 Попытка удаления товара:', { id, cloudinaryPublicId });

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

      console.log('📡 Ответ сервера:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.log('❌ Детали ошибки от сервера:', errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.log('❌ Текст ошибки:', errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Товар успешно удален:', result);
      return result;

    } catch (error) {
      throw error;
    }
  }

  // Обновление фото профиля
  static async updateProfilePhoto(imageUri: string): Promise<{ success: boolean; user: User }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Конвертируем изображение в base64
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;

            const uploadResponse = await fetch(`${API_BASE_URL}/profile/photo`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageBase64: base64data
              }),
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || `HTTP error! status: ${uploadResponse.status}`);
            }

            const data = await uploadResponse.json();

            // Обновляем пользователя в хранилище
            await storage.setItem('user', JSON.stringify(data.user));

            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('Ошибка обновления фото профиля:', error);
      throw error;
    }
  }

  // Удаление фото профиля
  static async removeProfilePhoto(): Promise<{ success: boolean; user: User }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch(`${API_BASE_URL}/profile/photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Обновляем пользователя в хранилище
      await storage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Ошибка удаления фото профиля:', error);
      throw error;
    }
  }

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

  // ========== МЕТОДЫ ДЛЯ АВТОРИЗАЦИИ ==========



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

  // ========== МЕТОДЫ ДЛЯ СТОЛИКОВ И ЗАКАЗОВ ==========
  static async completeOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      console.log('🔄 Выполнение заказа...', orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Заказ выполнен:', orderId);
      return data;
    } catch (error) {
      console.error('❌ Ошибка выполнения заказа:', error);
      throw error;
    }
  }

  static async deleteOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      console.log('🔄 Удаление заказа...', orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Заказ удален:', orderId);
      return data;
    } catch (error) {
      console.error('❌ Ошибка удаления заказа:', error);
      throw error;
    }
  }

  static async getTables(startTime: string, endTime: string): Promise<TablesResponse> {
    try {
      console.log('🔄 Загрузка столиков...', { startTime, endTime });

      const response = await fetch(
        `${API_BASE_URL}/tables?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Столики загружены:', data.tables?.length || 0, 'столиков');

      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке столиков:', error);
      throw error;
    }
  }

  static async createOrder(orderData: CreateOrderData): Promise<CreateOrderResponse> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      console.log('🔄 Создание бронирования/заказа...', orderData);

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.order) {
        console.log('✅ Заказ и бронирование созданы:', data.order.id);
      } else {
        console.log('✅ Бронирование создано (без заказа):', data.reservation.id);
      }

      return data;
    } catch (error) {
      console.error('❌ Ошибка при создании бронирования/заказа:', error);
      throw error;
    }
  }

  static async cancelOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      console.log('🔄 Отмена заказа...', orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Заказ отменен:', orderId);
      return data;
    } catch (error) {
      console.error('❌ Ошибка при отмене заказа:', error);
      throw error;
    }
  }

  static async getAllOrders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${API_BASE_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка при получении заказов:', error);
      throw error;
    }
  }

  static async getUserOrders(userId: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${API_BASE_URL}/users/${userId}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка при получении заказов пользователя:', error);
      throw error;
    }
  }

  static async getTableOrders(tableId: string, filters?: {
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<TableOrdersResponse> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const queryParams = new URLSearchParams();
      if (filters?.date) queryParams.append('date', filters.date);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${API_BASE_URL}/tables/${tableId}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка при получении заказов по столику:', error);
      throw error;
    }
  }

  static async getOrderById(orderId: string): Promise<Order> {
    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('❌ Ошибка при получении заказа:', error);
      throw error;
    }
  }
}

// Функция для получения подписи Cloudinary для фото профиля
const getCloudinarySignatureForProfile = async (publicId: string): Promise<any> => {
  try {
    const token = await ApiService.getAuthToken();
    if (!token) {
      throw new Error('Требуется авторизация');
    }

    const response = await fetch(`${API_BASE_URL}/cloudinary-signature-profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        overwrite: true
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting cloudinary signature for profile:', error);
    throw error;
  }
};

// В services/api.ts - обновите функцию uploadProfilePhotoDirectly
export const uploadProfilePhotoDirectly = async (imageUri: string): Promise<{ success: boolean; user: User }> => {
  try {
    const token = await ApiService.getAuthToken();
    if (!token) {
      throw new Error('Требуется авторизация');
    }

    console.log('🔄 Начало загрузки фото профиля...');

    // Получаем текущего пользователя для существующего public_id
    const currentUser = await ApiService.getCurrentUser();

    let targetPublicId: string;
    let shouldOverwrite = false;

    if (currentUser?.cloudinary_public_id) {
      targetPublicId = currentUser.cloudinary_public_id;
      shouldOverwrite = true;
      console.log('🔄 Перезапись существующего фото профиля:', targetPublicId);
    } else {
      targetPublicId = `botanica_profile_${currentUser?.id}_${Date.now()}`;
      console.log('🆕 Создание нового фото профиля:', targetPublicId);
    }

    // 1. Получаем подпись для профиля (доступно всем пользователям)
    console.log('🔐 Получение подписи Cloudinary для профиля...');
    const signatureData = await getCloudinarySignatureForProfile(targetPublicId);

    // 2. Прямая загрузка в Cloudinary
    console.log('☁️ Загрузка в Cloudinary...');
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    const fileType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      type: fileType,
      name: filename,
    } as any);

    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('api_key', signatureData.api_key);
    formData.append('overwrite', signatureData.overwrite.toString());
    formData.append('invalidate', signatureData.invalidate.toString());
    formData.append('quality', 'auto:good');
    formData.append('fetch_format', 'auto');
    formData.append('public_id', targetPublicId);

    console.log('Uploading to Cloudinary with params:', {
      cloud_name: signatureData.cloud_name,
      overwrite: signatureData.overwrite,
      public_id: targetPublicId,
      quality: 'auto:good'
    });

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload success:', {
      public_id: result.public_id,
      url: result.secure_url,
      bytes: result.bytes,
      format: result.format
    });

    // 3. Обновляем пользователя в базе данных через API
    console.log('💾 Обновление данных пользователя...');
    const updateResponse = await fetch(`${API_BASE_URL}/profile/photo/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cloudinary_public_id: result.public_id,
        cloudinary_url: result.secure_url
      }),
    })
    console.log('📡 Ответ сервера:', {
      status: updateResponse.status,
      statusText: updateResponse.statusText,
      headers: Object.fromEntries(updateResponse.headers.entries())
    });

    // Проверяем Content-Type перед парсингом
    const contentType = updateResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await updateResponse.text();
      console.error('❌ Сервер вернул не JSON:', text.substring(0, 500));
      throw new Error(`Сервер вернул не JSON: ${contentType}`);
    }

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.error || `HTTP error! status: ${updateResponse.status}`);
    }

    const data = await updateResponse.json();
    console.log('✅ Фото профиля успешно обновлено');

    // Обновляем пользователя в хранилище
    await storage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('❌ Ошибка прямой загрузки фото профиля:', error);
    throw error;
  }
};