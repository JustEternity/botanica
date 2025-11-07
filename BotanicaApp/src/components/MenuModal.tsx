import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MenuItem } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuModalProps {
  visible: boolean;
  item: MenuItem | null;
  initialQuantity: number;
  onClose: () => void;
  onAddToOrder: (item: MenuItem, quantity: number) => void;
}

export default function MenuModal({
  visible,
  item,
  initialQuantity,
  onClose,
  onAddToOrder,
}: MenuModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (visible && item) {
      setQuantity(initialQuantity);
      setImageError(false);
      setImageLoading(true);
      
      // Простая предзагрузка для улучшения пользовательского опыта
      const highQualityImage = getOptimizedImageUrl(item.image);
      Image.prefetch(highQualityImage)
        .then(() => {
          console.log('✅ Предзагрузка изображения для модального окна завершена');
        })
        .catch(error => {
          console.log('❌ Ошибка предзагрузки для модального окна:', error);
        });
    }
  }, [visible, item, initialQuantity]);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToOrder = () => {
    if (!item || quantity === 0) return;

    onAddToOrder(item, quantity);
    onClose();
  };

  const handleOverlayPress = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleRetryLoad = useCallback(() => {
    setImageError(false);
    setImageLoading(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  if (!item) return null;

  const highQualityImage = getOptimizedImageUrl(item.image);
  const totalPrice = item.price * quantity;
  const displayPrice = quantity > 0 ? totalPrice : item.price;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.modalTitle}>{item.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={[styles.image, styles.imageLoading]}>
                  <ActivityIndicator size="large" color="#2E7D32" />
                </View>
              )}
              
              <Image
                source={{ uri: highQualityImage }}
                style={[
                  styles.image,
                  imageLoading && styles.imageHidden
                ]}
                resizeMode="cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {imageError && (
                <TouchableOpacity 
                  style={[styles.image, styles.imageError]}
                  onPress={handleRetryLoad}
                  activeOpacity={0.7}
                >
                  <Text style={styles.errorIcon}>🖼️</Text>
                  <Text style={styles.modalErrorText}>Ошибка загрузки изображения</Text>
                  <Text style={styles.retryHint}>Нажмите для повторной загрузки</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.description}>
              {item.description}
            </Text>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {quantity > 0 ? 'Общая стоимость:' : 'Цена:'}
                </Text>
                <Text style={styles.price}>
                  {displayPrice} ₽
                </Text>
              </View>
              {quantity > 0 && (
                <Text style={styles.priceDetails}>
                  {item.price} ₽ × {quantity} шт.
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.quantitySection}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === 0 && styles.quantityButtonDisabled
                ]}
                onPress={handleDecrement}
                disabled={quantity === 0}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>
                {quantity}
              </Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrement}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                quantity === 0 && styles.addButtonDisabled
              ]}
              onPress={handleAddToOrder}
              disabled={quantity === 0}
            >
              <Text style={styles.addButtonText}>
                Добавить
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 20,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerSpacer: {
    width: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    position: 'absolute',
    zIndex: 1,
  },
  imageHidden: {
    opacity: 0,
  },
  imageError: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modalErrorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  retryHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  priceContainer: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  priceDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 5,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  quantityButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});