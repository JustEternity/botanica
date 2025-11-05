// BotanicaApp/src/utils/imageUtils.ts
import { Image } from 'react-native';

// Утилиты для работы с изображениями
export const getOptimizedImageUrl = (imageUrl: string, width?: number, height?: number): string => {
  if (!imageUrl) return imageUrl;
  
  if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/upload/')) {
    const parts = imageUrl.split('/upload/');
    if (parts.length === 2) {
      const imagePath = parts[1].split('/').pop();
      
      if (width && height) {
        return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${imagePath}`;
      }
      
      return `${parts[0]}/upload/q_auto,f_auto/${imagePath}`;
    }
  }
  
  return imageUrl;
};

// Упрощенная функция предзагрузки
export const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    Image.prefetch(url)
      .then(() => resolve(url))
      .catch((error) => reject(new Error(`Failed to load image: ${url}`)));
  });
};