// types/index.ts - добавьте эти типы
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  is_available?: boolean;
  cloudinary_public_id?: string;
  category_id?: string; // Добавляем для формы
};

export type MenuCategory = {
  id: string;
  title: string;
  is_active?: boolean;
};

// Добавляем тип для контекстного меню
export type ContextMenuAction = 'delete' | 'toggle_visibility' | 'edit' | 'cancel';

export type MenuSection = {
  id: string;
  title: string;
  data: MenuItem[];
  is_active?: boolean; // Добавляем это поле
};


export interface Table {
  id: string;
  number: number;
  isAvailable: boolean;
  position: {
    x: number;
    y: number;
  };
  description?: string;
  maxPeople?: number;
}

export type MenuModalData = {
  item: MenuItem;
  initialQuantity: number;
};

// Новые типы для авторизации
export type User = {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at?: string;
};

export type AuthCredentials = {
  phone: string;
  password: string;
};

export type RegisterData = {
  name: string;
  phone: string;
  password: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};