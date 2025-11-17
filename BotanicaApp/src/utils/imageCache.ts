// Глобальный кеш версий изображений
const imageVersionCache = new Map<string, number>();

// Глобальная версия меню для принудительной инвалидации
let globalMenuVersion = 0;

// Получить текущую версию для конкретного изображения
export const getImageVersion = (imageUrl: string): number => {
  return imageVersionCache.get(imageUrl) || 0;
};

// Увеличить версию для конкретного изображения
export const incrementImageVersion = (imageUrl: string): void => {
  const currentVersion = getImageVersion(imageUrl);
  imageVersionCache.set(imageUrl, currentVersion + 1);
};

// Получить глобальную версию меню
export const getGlobalMenuVersion = (): number => {
  return globalMenuVersion;
};

// Увеличить глобальную версию меню
export const incrementGlobalMenuVersion = (): void => {
  globalMenuVersion++;
};

// Сбросить кеш для конкретного изображения
export const resetImageCache = (imageUrl: string): void => {
  imageVersionCache.delete(imageUrl);
};

// Сбросить весь кеш
export const clearAllImageCache = (): void => {
  imageVersionCache.clear();
  globalMenuVersion = 0;
};