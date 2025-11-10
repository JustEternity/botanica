// types/index.ts
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  is_available?: boolean;
  cloudinary_public_id?: string;
  category_id: number;
};

export type MenuCategory = {
  id: string;
  title: string;
  is_active?: boolean;
};

export type ContextMenuAction = 'delete' | 'toggle_visibility' | 'edit' | 'cancel';

export type MenuSection = {
  id: string;
  title: string;
  data: MenuItem[];
  is_active?: boolean;
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

export type User = {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at?: string;
  cloudinary_public_id?: string;
  cloudinary_url?: string;
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

// ========== ТИПЫ ДЛЯ ЗАКАЗОВ И БРОНИРОВАНИЙ ==========

export interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  name: string;
  description: string;
}

export interface Order {
  id: string;
  reservation_id: string;
  user_id: string;
  status: 'в работе' | 'выполнен' | 'отменен' | 'не выполнен';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Дополнительные поля из JOIN запросов
  start_time?: string;
  end_time?: string;
  guests_count?: number;
  table_id?: string;
  table_name?: string;
  table_description?: string;
  table_capacity?: number;
  customer_name?: string;
  customer_phone?: string;
  reservation_active?: boolean;
  
  items: OrderItem[];
}

// Обновленный интерфейс для создания заказа/бронирования
export interface CreateOrderData {
  table_id: string;
  start_time: string;
  end_time: string;
  guests_count?: number;
  items?: Array<{
    menu_item_id: string;
    quantity: number;
  }>;
  notes?: string;
}

// Новый интерфейс для ответа при создании заказа/бронирования
export interface CreateOrderResponse {
  success: boolean;
  order?: Order; // Заказ создается только если есть items
  reservation: {
    id: string;
    table_id: string;
    start_time: string;
    end_time: string;
    guests_count: number;
  };
  message?: string;
}

// Интерфейс для бронирования
export interface Reservation {
  id: string;
  table_id: string;
  start_time: string;
  end_time: string;
  guests_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Дополнительные поля из JOIN запросов
  table_name?: string;
  table_description?: string;
  table_capacity?: number;
  customer_name?: string;
  customer_phone?: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TableOrdersResponse {
  success: boolean;
  orders: Order[];
  table: Table;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TablesResponse {
  success: boolean;
  tables: Table[];
  requested_period: {
    start: string;
    end: string;
  };
}

// Ответ для получения бронирований
export interface ReservationsResponse {
  success: boolean;
  reservations: Reservation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Типы для работы с бронированиями
export interface CreateReservationData {
  table_id: string;
  start_time: string;
  end_time: string;
  guests_count?: number;
  notes?: string;
}

export interface UpdateReservationData {
  start_time?: string;
  end_time?: string;
  guests_count?: number;
  notes?: string;
  is_active?: boolean;
}