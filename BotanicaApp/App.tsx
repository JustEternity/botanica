import React from 'react';
import { Platform } from 'react-native';
import { TableProvider } from './src/contexts/TableContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import WebNavigator from './src/navigation/WebNavigator'; // Новый веб-навигатор
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { WebSocketHandler } from './src/components/WebSocketHandler';
import { MenuProvider } from './src/contexts/MenuContext';

export default function App() {
  // На вебе используем веб-навигатор
  if (Platform.OS === 'web') {
    return (
    <TableProvider>
      <AuthProvider>
        <CartProvider>
          <MenuProvider>
            <WebSocketProvider>
              <WebSocketHandler />
                <WebNavigator />
            </WebSocketProvider>
          </MenuProvider>
        </CartProvider>
      </AuthProvider>
    </TableProvider>
    );
  }

  // На мобилке - обычный навигатор
  return (
    <TableProvider>
      <AuthProvider>
        <CartProvider>
          <MenuProvider>
            <WebSocketProvider>
              <WebSocketHandler />
              <AppNavigator />
            </WebSocketProvider>
          </MenuProvider>
        </CartProvider>
      </AuthProvider>
    </TableProvider>
  );
}