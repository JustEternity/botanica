// src/contexts/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  reconnect: () => void;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = useCallback((): string => {
  return 'ws://45.153.189.245:3001/ws';
}, []);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log(`🔗 Попытка подключения WebSocket: ${wsUrl}`);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('✅ WebSocket подключен');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Отправляем информацию о пользователе при подключении
        if (user) {
          sendMessage({
            type: 'user_connected',
            payload: { userId: user.id },
            timestamp: Date.now()
          });
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔒 WebSocket отключен:', event.code, event.reason);
        setIsConnected(false);
        
        // Пытаемся переподключиться с экспоненциальной задержкой
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Повторное подключение через ${delay}ms (попытка ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error(`❌ Достигнут лимит попыток переподключения (${maxReconnectAttempts})`);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket ошибка:', error);
        setIsConnected(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          console.log('📨 WebSocket сообщение:', message.type);
        } catch (error) {
          console.error('❌ Ошибка парсинга WebSocket сообщения:', error, event.data);
        }
      };

    } catch (error) {
      console.error('❌ Ошибка подключения WebSocket:', error);
    }
  }, [getWebSocketUrl, user]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = JSON.stringify({
          ...message,
          userId: user?.id // Добавляем ID пользователя к каждому сообщению
        });
        ws.current.send(messageString);
        console.log('📤 Отправлено WebSocket сообщение:', message.type);
      } catch (error) {
        console.error('❌ Ошибка отправки WebSocket сообщения:', error);
      }
    } else {
      console.warn('⚠️ WebSocket не подключен, невозможно отправить сообщение');
    }
  }, [user]);

  const reconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    reconnectAttempts.current = 0;
    console.log('🔄 Принудительное переподключение WebSocket');
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    connect();
  }, [connect]);

  // Очистка при размонтировании
  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.close(1000, 'Компонент размонтирован');
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Подключаемся только если есть пользователь
    if (user) {
      console.log('👤 Пользователь авторизован, запуск WebSocket...');
      connect();
    } else {
      console.log('👤 Пользователь не авторизован, очистка WebSocket');
      cleanup();
    }

    return cleanup;
  }, [user, connect, cleanup]);

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, 
      lastMessage, 
      reconnect,
      sendMessage 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};