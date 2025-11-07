import React from 'react';
import { TableProvider } from './src/contexts/TableContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
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