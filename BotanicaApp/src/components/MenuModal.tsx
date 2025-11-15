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
  Platform,
  ImageStyle,
  ViewStyle,
  TextStyle,
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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (visible && item) {
      setQuantity(initialQuantity);
      setImageError(false);
      setImageLoading(true);

      const highQualityImage = getOptimizedImageUrl(item.image);
      Image.getSize(
        highQualityImage,
        (width, height) => {
          setImageDimensions({ width, height });
          Image.prefetch(highQualityImage)
            .then(() => {
              console.log('✅ Предзагрузка изображения завершена');
            })
            .catch(error => {
              console.log('❌ Ошибка предзагрузки:', error);
            });
        },
        (error) => {
          console.log('❌ Ошибка получения размеров изображения:', error);
          setImageDimensions({ width: 300, height: 200 });
        }
      );
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

  // Вычисляем пропорции изображения для корректного отображения
  const getImageStyle = (): ImageStyle => {
    const maxContainerWidth = Platform.OS === 'web' ? 600 : SCREEN_WIDTH;
    const maxWidth = maxContainerWidth - 40;
    const maxHeight = SCREEN_HEIGHT * 0.4;

    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      const ratio = imageDimensions.width / imageDimensions.height;
      let width = maxWidth;
      let height = maxWidth / ratio;

      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * ratio;
      }

      if (width > maxWidth) {
        width = maxWidth;
        height = maxWidth / ratio;
      }

      return { width, height };
    }

    return { width: maxWidth, height: 200 };
  };

  const imageStyle = getImageStyle();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[
          styles.overlay,
          Platform.OS === 'web' && styles.webOverlay as ViewStyle
        ]}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View style={[
          styles.modalContainer,
          Platform.OS === 'web' && styles.webModalContainer as ViewStyle
        ]}>
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
                <View style={[styles.imagePlaceholder, { width: imageStyle.width, height: imageStyle.height }]}>
                  <ActivityIndicator size="large" color="#2E7D32" />
                </View>
              )}

              <Image
                source={{ uri: highQualityImage }}
                style={[
                  styles.image,
                  imageStyle,
                  imageLoading && styles.imageHidden
                ]}
                resizeMode="contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {imageError && (
                <TouchableOpacity
                  style={[styles.imagePlaceholder, styles.imageError, { width: imageStyle.width, height: imageStyle.height }]}
                  onPress={handleRetryLoad}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalErrorText}>🖼️</Text>
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
                quantity === 0 && styles.addButtonDisabled,
                Platform.OS === 'web' && styles.webAddButton as ViewStyle
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

// Исправленные стили с правильными типами
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,

  webOverlay: Platform.select({
    web: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    default: {}
  }) as ViewStyle,

  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 20,
  } as ViewStyle,

  webModalContainer: Platform.select({
    web: {
      width: '90%',
      maxWidth: 600,
      height: 'auto',
      maxHeight: SCREEN_HEIGHT * 0.8, // Используем числа вместо '80vh'
      borderRadius: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    default: {}
  }) as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  } as ViewStyle,

  headerSpacer: {
    width: 30,
  } as ViewStyle,

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  } as TextStyle,

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  } as TextStyle,

  content: {
    paddingHorizontal: 20,
  } as ViewStyle,

  imageContainer: {
    position: 'relative',
    marginTop: 10,
    alignItems: 'center',
  } as ViewStyle,

  image: {
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  } as ImageStyle,

  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    position: 'absolute',
    zIndex: 1,
  } as ViewStyle,

  imageHidden: {
    opacity: 0,
  } as ImageStyle,

  imageError: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  } as ViewStyle,

  modalErrorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  } as TextStyle,

  retryHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  } as TextStyle,

  priceContainer: {
    marginBottom: 20,
    alignItems: 'flex-end',
  } as ViewStyle,

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,

  priceLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  } as TextStyle,

  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  } as TextStyle,

  priceDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  } as TextStyle,

  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
  } as ViewStyle,

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 5,
  } as ViewStyle,

  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  quantityButtonDisabled: {
    backgroundColor: '#cccccc',
  } as ViewStyle,

  quantityButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  } as TextStyle,

  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
    color: '#333',
  } as TextStyle,

  addButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  } as ViewStyle,

  addButtonDisabled: {
    backgroundColor: '#cccccc',
  } as ViewStyle,

  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  webAddButton: Platform.select({
    web: {
      maxWidth: 200,
      cursor: 'pointer',
    },
    default: {}
  }) as ViewStyle,
});