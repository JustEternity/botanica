import React from 'react';
import { Platform } from 'react-native';
import { TableProvider } from './src/contexts/TableContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import WebNavigator from './src/navigation/WebNavigator'; // Новый веб-навигатор

export default function App() {
  // На вебе используем веб-навигатор
  if (Platform.OS === 'web') {
    return (
      <TableProvider>
        <AuthProvider>
          <CartProvider>
            <WebNavigator />
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
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </TableProvider>
  );
}