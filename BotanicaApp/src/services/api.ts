// services/api.ts
import { MenuSection, MenuItem } from '../types';

const API_BASE_URL = 'http://109.172.37.118:3001/api';

export class ApiService {
  static readonly BASE_URL = API_BASE_URL;

  static async getMenu(): Promise<MenuSection[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при загрузке меню:', error);
      throw error;
    }
  }

  static async uploadImage(imageData: FormData): Promise<{public_id: string, secure_url: string}> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload-image`, {
        method: 'POST',
        body: imageData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw error;
    }
  }

  static async addMenuItem(itemData: {
    category_id: number;
    name: string;
    price: number;
    description: string;
    cloudinary_public_id: string;
    cloudinary_url: string;
  }): Promise<MenuItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.item;
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}