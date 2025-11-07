import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../contexts/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FloatingCartButtonProps {
  onPress: () => void;
}

export default function FloatingCartButton({ onPress }: FloatingCartButtonProps) {
  const { getItemsCount, tableReservation, isLoading } = useCart();
  
  const itemCount = getItemsCount();
  const hasTable = !!tableReservation;

  // Показываем индикатор загрузки вместо кнопки, пока данные загружаются
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator color="white" size="small" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.cartIcon}>🛒</Text>
      
      {/* Бейдж с количеством товаров */}
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}
      
      {/* Индикатор бронирования столика */}
      {hasTable && (
        <View style={styles.tableIndicator}>
          <Text style={styles.tableIndicatorText}>📋</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 35, 
    right: 35,  
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: '#cccccc',
  },
  cartIcon: {
    fontSize: 24,
    color: 'white',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableIndicator: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableIndicatorText: {
    fontSize: 8,
    color: 'white',
  },
});