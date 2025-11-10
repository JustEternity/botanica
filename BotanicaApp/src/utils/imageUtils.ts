// BotanicaApp/src/utils/imageUtils.ts
import { Image } from 'react-native';
import { ApiService } from '../services/api';

const API_BASE_URL = 'http://45.153.189.245:3001/api';

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  overwrite: boolean;
  invalidate: boolean;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

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

export const getCloudinarySignature = async (publicId: string): Promise<CloudinarySignature> => {
  try {
    const token = await ApiService.getAuthToken();
    if (!token) {
      throw new Error('Требуется авторизация');
    }

    const response = await fetch(`${API_BASE_URL}/cloudinary-signature`, {
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
    console.error('Error getting cloudinary signature:', error);
    throw error;
  }
};

export const uploadImageToCloudinaryDirectly = async (
  imageUri: string, 
  existingPublicId?: string
): Promise<CloudinaryUploadResult> => {
  try {
    let targetPublicId: string;
    
    if (existingPublicId) {
      targetPublicId = existingPublicId;
      console.log('Using existing public_id for overwrite:', targetPublicId);
    } else {
      targetPublicId = `botanica_item_${Math.random().toString(36).substring(2, 9)}`;
      console.log('Generated new public_id:', targetPublicId);
    }

    const signatureData = await getCloudinarySignature(targetPublicId);

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

    return {
      public_id: result.public_id,
      secure_url: result.secure_url
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};