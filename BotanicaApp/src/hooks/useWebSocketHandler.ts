// src/hooks/useWebSocketHandler.ts
import { useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useTable } from '../contexts/TableContext';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { incrementGlobalMenuVersion } from '../utils/imageCache';

export const useWebSocketHandler = () => {
  const { lastMessage } = useWebSocket();
  const { refreshTables } = useTable();
  const { user } = useAuth();
  const { loadMenuData } = useMenu();
  
  // Refs для хранения актуальных функций
  const loadMenuDataRef = useRef(loadMenuData);
  const refreshTablesRef = useRef(refreshTables);
  const userRef = useRef(user);

  // Обновляем refs при изменении
  useEffect(() => {
    loadMenuDataRef.current = loadMenuData;
    refreshTablesRef.current = refreshTables;
    userRef.current = user;
  }, [loadMenuData, refreshTables, user]);

  // Ref для отслеживания времени последнего сообщения каждого типа
  const lastProcessedTimeRef = useRef<{ [key: string]: number }>({});
  const processingMessagesRef = useRef<Set<string>>(new Set());

  const handleWebSocketMessage = useCallback((message: any) => {
    if (!message || !message.type) return;

    const now = Date.now();
    const messageType = message.type;

    // Защита от дублирования - игнорируем сообщения того же типа в течение 500ms
    const lastProcessedTime = lastProcessedTimeRef.current[messageType] || 0;
    if (now - lastProcessedTime < 500) {
      console.log('⏭️ Пропускаем дублирующее сообщение:', messageType);
      return;
    }

    // Защита от одновременной обработки одинаковых сообщений
    if (processingMessagesRef.current.has(messageType)) {
      console.log('⏳ Сообщение уже обрабатывается:', messageType);
      return;
    }

    // Обновляем время последней обработки
    lastProcessedTimeRef.current[messageType] = now;
    processingMessagesRef.current.add(messageType);

    console.log('🔄 Обработка WebSocket сообщения:', messageType, message);

    switch (messageType) {
      case 'menu_update':
        console.log('📋 Обновление меню получено через WebSocket');
        
        // Используем setTimeout для асинхронности
        setTimeout(async () => {
          try {
            const isAdmin = userRef.current?.role === 'admin';
            await loadMenuDataRef.current(isAdmin);
            incrementGlobalMenuVersion();
            console.log('✅ Меню обновлено через WebSocket');
          } catch (error) {
            console.error('❌ Ошибка обновления меню через WebSocket:', error);
          } finally {
            // Снимаем блокировку после завершения
            processingMessagesRef.current.delete('menu_update');
          }
        }, 100);
        break;

      case 'order_update':
        console.log('📦 Обновление заказа получено');
        
        setTimeout(() => {
          try {
            refreshTablesRef.current();
            console.log('✅ Таблицы обновлены через WebSocket');
          } catch (error) {
            console.error('❌ Ошибка обновления таблиц:', error);
          } finally {
            processingMessagesRef.current.delete('order_update');
          }
        }, 100);
        break;

      case 'reservation_update':
        console.log('🪑 Обновление бронирования получено');
        processingMessagesRef.current.delete('reservation_update');
        break;

      case 'cart_update':
        console.log('🛒 Обновление корзины получено');
        processingMessagesRef.current.delete('cart_update');
        break;

      default:
        console.log('📨 Неизвестный тип сообщения:', messageType);
        processingMessagesRef.current.delete(messageType);
    }
  }, []);

  useEffect(() => {
    if (!lastMessage) return;
    
    handleWebSocketMessage(lastMessage);
  }, [lastMessage, handleWebSocketMessage]);
};