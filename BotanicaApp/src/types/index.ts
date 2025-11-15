import { Platform } from 'react-native';

// Типы для заказов
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface Order {
  id: string;
  table_id: string;
  table_name: string;
  table_description?: string;
  table_capacity?: number;
  customer_name: string;
  customer_phone: string;
  guests_count: number;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number | string;
  created_at: string;
  items: OrderItem[];
  notes?: string;
}

export interface Table {
  id: string;
  number: number;
  isAvailable: boolean;
  position: { x: number; y: number };
  description: string;
  maxPeople: number;
}

// Типы для аутентификации
export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  cloudinary_url?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  phone: string;
  password: string;
}

// Типы для корзины
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Типы для меню
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// Типы для бронирования
export interface ReservationData {
  table_id: string;
  table_name: string;
  start_time: string;
  end_time: string;
  guests_count: number;
  customer_name: string;
  customer_phone: string;
  notes?: string;
}

// Функция для создания HTML контента для веба
export function createWebHomePage() {
  if (Platform.OS !== 'web') {
    return null; // На мобилке ничего не делаем
  }

  // Создаем HTML структуру для веба
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Botanica - Кафе Кальянная</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                background: #0a1f0a;
                color: #E8F5E8;
                line-height: 1.6;
            }
            
            .header {
                background: #0a1f0a;
                padding: 20px 50px;
                border-bottom: 1px solid #1a3d1a;
                text-align: center;
            }
            
            .title {
                font-size: 42px;
                font-weight: bold;
                color: #4CAF50;
                letter-spacing: 4px;
                margin-bottom: 5px;
            }
            
            .subtitle {
                font-size: 16px;
                color: #81C784;
                letter-spacing: 2px;
                margin-bottom: 20px;
            }
            
            .nav {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 20px;
            }
            
            .nav-button {
                padding: 10px 20px;
                color: #E8F5E8;
                text-decoration: none;
                font-weight: 600;
                letter-spacing: 1px;
                cursor: pointer;
                transition: color 0.3s;
            }
            
            .nav-button:hover {
                color: #4CAF50;
            }
            
            .hero {
                height: 600px;
                background: linear-gradient(135deg, #1a3d1a 0%, #0a1f0a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            
            .hero-title {
                font-size: 48px;
                font-weight: bold;
                color: #E8F5E8;
                margin-bottom: 15px;
                letter-spacing: 2px;
            }
            
            .hero-subtitle {
                font-size: 24px;
                color: #81C784;
                margin-bottom: 30px;
                letter-spacing: 1px;
            }
            
            .cta-button {
                background: #4CAF50;
                color: white;
                padding: 15px 40px;
                border: none;
                border-radius: 5px;
                font-size: 16;
                font-weight: bold;
                letter-spacing: 1px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .cta-button:hover {
                background: #45a049;
            }
            
            .section {
                padding: 80px 50px;
                text-align: center;
            }
            
            .section-title {
                font-size: 36px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 50px;
                letter-spacing: 2px;
            }
            
            .about-description {
                font-size: 18px;
                color: #E8F5E8;
                max-width: 800px;
                margin: 0 auto 40px;
                line-height: 28px;
            }
            
            .features {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            
            .feature {
                flex: 1;
                min-width: 200px;
                padding: 20px;
            }
            
            .feature-title {
                font-size: 18px;
                font-weight: bold;
                color: #81C784;
                margin-bottom: 10px;
            }
            
            .feature-text {
                font-size: 14px;
                color: #C8E6C9;
                line-height: 20px;
            }
            
            .menu-grid {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            
            .menu-category {
                background: #0a1f0a;
                padding: 40px;
                border-radius: 10px;
                border: 1px solid #2d5a2d;
                min-width: 200px;
                text-align: center;
            }
            
            .menu-category-title {
                font-size: 20px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
            }
            
            .menu-category-text {
                font-size: 16px;
                color: #81C784;
            }
            
            .contacts-grid {
                display: flex;
                justify-content: center;
                gap: 50px;
                flex-wrap: wrap;
            }
            
            .contact-info {
                text-align: center;
                min-width: 200px;
            }
            
            .contact-title {
                font-size: 16px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            
            .contact-text {
                font-size: 16px;
                color: #E8F5E8;
            }
            
            .footer {
                background: #0a1f0a;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #1a3d1a;
            }
            
            .footer-text {
                color: #81C784;
                font-size: 14px;
                letter-spacing: 1px;
            }
        </style>
    </head>
    <body>
        <header class="header">
            <h1 class="title">BOTANICA</h1>
            <p class="subtitle">КАФЕ • КАЛЬЯННАЯ</p>
            <nav class="nav">
                <a class="nav-button">МЕНЮ</a>
                <a class="nav-button">БРОНЬ СТОЛИКА</a>
                <a class="nav-button">КОНТАКТЫ</a>
            </nav>
        </header>

        <section class="hero">
            <div>
                <h2 class="hero-title">УЮТНАЯ АТМОСФЕРА</h2>
                <p class="hero-subtitle">И ЛУЧШИЕ КАЛЬЯНЫ В ГОРОДЕ</p>
                <button class="cta-button">ЗАБРОНИРОВАТЬ СТОЛИК</button>
            </div>
        </section>

        <section class="section" style="background: #0a1f0a;">
            <h3 class="section-title">О НАС</h3>
            <p class="about-description">
                Botanica - это уютное кафе-кальянная, где встречаются изысканные вкусы, 
                приятная атмосфера и высокий уровень сервиса. Мы создали место, 
                где можно расслабиться, пообщаться с друзьями и насладиться лучшими 
                кальянами в городе.
            </p>
            <div class="features">
                <div class="feature">
                    <div class="feature-title">🎯 ПРЕМИУМ КАЛЬЯНЫ</div>
                    <div class="feature-text">Только качественные табаки и свежие фрукты</div>
                </div>
                <div class="feature">
                    <div class="feature-title">☕ КОФЕ И НАПИТКИ</div>
                    <div class="feature-text">Широкий выбор напитков на любой вкус</div>
                </div>
                <div class="feature">
                    <div class="feature-title">🕒 РАБОТАЕМ ДО ПОЗДНЕ</div>
                    <div class="feature-text">Каждый день с 12:00 до 02:00</div>
                </div>
            </div>
        </section>

        <section class="section" style="background: #1a3d1a;">
            <h3 class="section-title">НАШЕ МЕНЮ</h3>
            <div class="menu-grid">
                <div class="menu-category">
                    <div class="menu-category-title">КАЛЬЯНЫ</div>
                    <div class="menu-category-text">От 500₽</div>
                </div>
                <div class="menu-category">
                    <div class="menu-category-title">КОФЕ</div>
                    <div class="menu-category-text">От 200₽</div>
                </div>
                <div class="menu-category">
                    <div class="menu-category-title">ЧАИ</div>
                    <div class="menu-category-text">От 250₽</div>
                </div>
                <div class="menu-category">
                    <div class="menu-category-title">КОКТЕЙЛИ</div>
                    <div class="menu-category-text">От 350₽</div>
                </div>
            </div>
        </section>

        <section class="section" style="background: #0a1f0a; text-align: center;">
            <h3 class="section-title">КОНТАКТЫ</h3>
            <div class="contacts-grid">
                <div class="contact-info">
                    <div class="contact-title">АДРЕС</div>
                    <div class="contact-text">ул. Центральная, 123</div>
                </div>
                <div class="contact-info">
                    <div class="contact-title">ТЕЛЕФОН</div>
                    <div class="contact-text">+7 (999) 123-45-67</div>
                </div>
                <div class="contact-info">
                    <div class="contact-title">ВРЕМЯ РАБОТЫ</div>
                    <div class="contact-text">Ежедневно 12:00 - 02:00</div>
                </div>
                <div class="contact-info">
                    <div class="contact-title">SOCIAL MEDIA</div>
                    <div class="contact-text">@botanica_cafe</div>
                </div>
            </div>
        </section>

        <footer class="footer">
            <p class="footer-text">© 2024 BOTANICA. ВСЕ ПРАВА ЗАЩИЩЕНЫ</p>
        </footer>

        <script>
            // Простой JavaScript для кнопок
            document.querySelector('.cta-button').addEventListener('click', function() {
                alert('Функция бронирования столика будет здесь!');
            });
            
            document.querySelectorAll('.nav-button').forEach(button => {
                button.addEventListener('click', function() {
                    alert('Навигация будет реализована позже');
                });
            });
        </script>
    </body>
    </html>
  `;

  // Вставляем HTML в веб-страницу
  if (typeof document !== 'undefined') {
    document.documentElement.innerHTML = htmlContent;
  }

  return htmlContent;
}

// Экспортируем функцию для использования
export default createWebHomePage;