import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

// ВЫНОСИМ КОМПОНЕНТ ИЗОБРАЖЕНИЯ В ОТДЕЛЬНЫЙ МЕМОИЗИРОВАННЫЙ КОМПОНЕНТ
const MenuModalImage = React.memo(({ 
  item, 
  onRetry 
}: { 
  item: MenuItem; 
  onRetry: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // КЕШИРУЕМ СОСТОЯНИЕ ИЗОБРАЖЕНИЯ В REF
  const imageStateRef = useRef<{
    loaded: boolean;
    error: boolean;
    dimensions: { width: number; height: number };
  } | null>(null);

  const highQualityImage = useMemo(() => getOptimizedImageUrl(item.image), [item.image]);

  useEffect(() => {
    if (item) {
      // ЕСЛИ СОСТОЯНИЕ УЖЕ ЗАКЕШИРОВАНО, ВОССТАНАВЛИВАЕМ ЕГО
      if (imageStateRef.current) {
        setImageError(imageStateRef.current.error);
        setImageLoading(!imageStateRef.current.loaded);
        setImageDimensions(imageStateRef.current.dimensions);
      } else {
        setImageError(false);
        setImageLoading(true);
        
        Image.getSize(
          highQualityImage,
          (width, height) => {
            const dimensions = { width, height };
            setImageDimensions(dimensions);
            imageStateRef.current = {
              loaded: false,
              error: false,
              dimensions
            };
          },
          (error) => {
            console.log('❌ Ошибка получения размеров изображения:', error);
            const dimensions = { width: 300, height: 200 };
            setImageDimensions(dimensions);
            imageStateRef.current = {
              loaded: false,
              error: false,
              dimensions
            };
          }
        );
      }
    }
  }, [item, highQualityImage]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
    if (imageStateRef.current) {
      imageStateRef.current.loaded = true;
      imageStateRef.current.error = false;
    }
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
    if (imageStateRef.current) {
      imageStateRef.current.loaded = true;
      imageStateRef.current.error = true;
    }
  }, []);

  const handleRetryLoad = useCallback(() => {
    setImageError(false);
    setImageLoading(true);
    imageStateRef.current = null; // СБРАСЫВАЕМ КЕШ ДЛЯ ПОВТОРНОЙ ЗАГРУЗКИ
    onRetry();
  }, [onRetry]);

  // ВЫЧИСЛЯЕМ СТИЛЬ ИЗОБРАЖЕНИЯ
  const imageStyle = useMemo((): ImageStyle => {
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
  }, [imageDimensions]);

  return (
    <View style={styles.imageContainer}>
      {imageLoading && (
        <View style={[styles.imagePlaceholder, { width: imageStyle.width, height: imageStyle.height }]}>
          <ActivityIndicator size="large" color={Platform.OS === 'web' ? '#8D6E63' : '#2E7D32'} />
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
          <Text style={[
            styles.modalErrorText,
            Platform.OS === 'web' && styles.webModalErrorText
          ]}>🖼️</Text>
          <Text style={[
            styles.modalErrorText,
            Platform.OS === 'web' && styles.webModalErrorText
          ]}>Ошибка загрузки изображения</Text>
          <Text style={[
            styles.retryHint,
            Platform.OS === 'web' && styles.webRetryHint
          ]}>Нажмите для повторной загрузки</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ОСНОВНОЙ КОМПОНЕНТ МОДАЛКИ
export default function MenuModal({
  visible,
  item,
  initialQuantity,
  onClose,
  onAddToOrder,
}: MenuModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  
  // ИСПОЛЬЗУЕМ REF ДЛЯ ПРЕДОТВРАЩЕНИЯ СБРОСА СОСТОЯНИЯ ПРИ ПЕРЕРЕНДЕРАХ
  const itemRef = useRef<MenuItem | null>(null);
  
  useEffect(() => {
    if (visible && item) {
      setQuantity(initialQuantity);
      itemRef.current = item;
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

  // ЗАГЛУШКА ДЛЯ ПОВТОРНОЙ ЗАГРУЗКИ ИЗОБРАЖЕНИЯ
  const handleRetryImage = useCallback(() => {
    // Принудительно обновляем состояние, если нужно
  }, []);

  if (!item) return null;

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
        style={[
          styles.overlay,
          Platform.OS === 'web' && styles.webOverlay
        ]}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View style={[
          styles.modalContainer,
          Platform.OS === 'web' && styles.webModalContainer
        ]}>
          <View style={[
            styles.header,
            Platform.OS === 'web' && styles.webHeader
          ]}>
            <View style={styles.headerSpacer} />
            <Text style={[
              styles.modalTitle,
              Platform.OS === 'web' && styles.webModalTitle
            ]}>{item.name}</Text>
            <TouchableOpacity
              style={[
                styles.closeButton,
                Platform.OS === 'web' && styles.webCloseButton
              ]}
              onPress={onClose}
            >
              <Text style={[
                styles.closeButtonText,
                Platform.OS === 'web' && styles.webCloseButtonText
              ]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* ИСПОЛЬЗУЕМ ОТДЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ ИЗОБРАЖЕНИЯ */}
            <MenuModalImage item={item} onRetry={handleRetryImage} />

            <Text style={[
              styles.description,
              Platform.OS === 'web' && styles.webDescription
            ]}>
              {item.description}
            </Text>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={[
                  styles.priceLabel,
                  Platform.OS === 'web' && styles.webPriceLabel
                ]}>
                  {quantity > 0 ? 'Общая стоимость:' : 'Цена:'}
                </Text>
                <Text style={[
                  styles.price,
                  Platform.OS === 'web' && styles.webPrice
                ]}>
                  {displayPrice} ₽
                </Text>
              </View>
              {quantity > 0 && (
                <Text style={[
                  styles.priceDetails,
                  Platform.OS === 'web' && styles.webPriceDetails
                ]}>
                  {item.price} ₽ × {quantity} шт.
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={[
            styles.quantitySection,
            Platform.OS === 'web' && styles.webQuantitySection
          ]}>
            <View style={[
              styles.quantityControls,
              Platform.OS === 'web' && styles.webQuantityControls
            ]}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === 0 && styles.quantityButtonDisabled,
                  Platform.OS === 'web' && styles.webQuantityButton
                ]}
                onPress={handleDecrement}
                disabled={quantity === 0}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={[
                styles.quantityText,
                Platform.OS === 'web' && styles.webQuantityText
              ]}>
                {quantity}
              </Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  Platform.OS === 'web' && styles.webQuantityButton
                ]}
                onPress={handleIncrement}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                quantity === 0 && styles.addButtonDisabled,
                Platform.OS === 'web' && styles.webAddButton
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

// СТИЛИ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ
const styles = StyleSheet.create({
  // ... существующие стили без изменений
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
      maxHeight: SCREEN_HEIGHT * 0.8,
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
      backgroundColor: '#FFF8F0',
      borderWidth: 1,
      borderColor: '#F5E6D3',
      overflow: 'hidden',
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

  webHeader: Platform.select({
    web: {
      borderBottomColor: '#F5E6D3',
      backgroundColor: '#FFF8F0',
    },
    default: {}
  }) as ViewStyle,

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

  webModalTitle: Platform.select({
    web: {
      color: '#5D4037',
    },
    default: {}
  }) as TextStyle,

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  webCloseButton: Platform.select({
    web: {
      backgroundColor: '#8D6E63',
    },
    default: {}
  }) as ViewStyle,

  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  } as TextStyle,

  webCloseButtonText: Platform.select({
    web: {
      color: '#FFF8F0',
    },
    default: {}
  }) as TextStyle,

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

  webModalErrorText: Platform.select({
    web: {
      color: '#8D6E63',
    },
    default: {}
  }) as TextStyle,

  retryHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  webRetryHint: Platform.select({
    web: {
      color: '#8D6E63',
    },
    default: {}
  }) as TextStyle,

  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  } as TextStyle,

  webDescription: Platform.select({
    web: {
      color: '#8D6E63',
    },
    default: {}
  }) as TextStyle,

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

  webPriceLabel: Platform.select({
    web: {
      color: '#2E7D32',
    },
    default: {}
  }) as TextStyle,

  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  } as TextStyle,

  webPrice: Platform.select({
    web: {
      color: '#2E7D32',
    },
    default: {}
  }) as TextStyle,

  priceDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  } as TextStyle,

  webPriceDetails: Platform.select({
    web: {
      color: '#8D6E63',
    },
    default: {}
  }) as TextStyle,

  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
  } as ViewStyle,

  webQuantitySection: Platform.select({
    web: {
      borderTopColor: '#F5E6D3',
      backgroundColor: '#FFF8F0',
    },
    default: {}
  }) as ViewStyle,

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 5,
  } as ViewStyle,

  webQuantityControls: Platform.select({
    web: {
      backgroundColor: '#FFF8F0',
    },
    default: {}
  }) as ViewStyle,

  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  webQuantityButton: Platform.select({
    web: {
      backgroundColor: '#8D6E63',
    },
    default: {}
  }) as ViewStyle,

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

  webQuantityText: Platform.select({
    web: {
      color: '#5D4037',
    },
    default: {}
  }) as TextStyle,

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
      backgroundColor: '#8D6E63',
    },
    default: {}
  }) as ViewStyle,
});