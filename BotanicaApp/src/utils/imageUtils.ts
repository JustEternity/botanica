// BotanicaApp/src/utils/imageUtils.ts
import { Image, Platform } from 'react-native';
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

import { getImageVersion, getGlobalMenuVersion } from './imageCache';

export const getOptimizedImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';

  // Если это локальный файл или blob URL, возвращаем как есть
  if (url.startsWith('file://') || url.startsWith('blob:') || url.startsWith('content://')) {
    return url;
  }

  let optimizedUrl = url;

  // Если это Cloudinary URL, добавляем параметры для оптимизации
  if (optimizedUrl.includes('cloudinary.com') && (width || height)) {
    const transformationParts = [];

    if (width && height) {
      transformationParts.push(`c_fill,w_${width},h_${height}`);
    } else if (width) {
      transformationParts.push(`c_fill,w_${width}`);
    } else if (height) {
      transformationParts.push(`c_fill,h_${height}`);
    }

    transformationParts.push('q_auto:good', 'f_auto');

    if (transformationParts.length > 0) {
      // Добавляем преобразования в URL Cloudinary
      const uploadIndex = optimizedUrl.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const beforeUpload = optimizedUrl.substring(0, uploadIndex + 8);
        const afterUpload = optimizedUrl.substring(uploadIndex + 8);
        optimizedUrl = `${beforeUpload}${transformationParts.join(',')}/${afterUpload}`;
      }
    }
  }

  // Добавляем параметры для инвалидации кеша для всех платформ
  const imageVersion = getImageVersion(url);
  const menuVersion = getGlobalMenuVersion();
  const separator = optimizedUrl.includes('?') ? '&' : '?';

  return `${optimizedUrl}${separator}_v=${imageVersion}&_mv=${menuVersion}&_t=${Date.now()}`;
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