import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Table } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TableReservationModalProps {
  visible: boolean;
  table: Table | null;
  startTime: Date;
  endTime: Date;
  onClose: () => void;
  onAddToOrder: (reservationData: {
    table: Table;
    startTime: Date;
    endTime: Date;
    peopleCount: number;
  }) => void;
}

export default function TableReservationModal({
  visible,
  table,
  startTime,
  endTime,
  onClose,
  onAddToOrder,
}: TableReservationModalProps) {
  const [peopleCount, setPeopleCount] = useState(2);

  // Сбрасываем значения при открытии модального окна
  useEffect(() => {
    if (visible && table) {
      setPeopleCount(2);
    }
  }, [visible, table]);

  // Обработчики для количества человек
  const handlePeopleIncrement = () => {
    if (table && peopleCount < table.maxPeople!) {
      setPeopleCount(peopleCount + 1);
    }
  };

  const handlePeopleDecrement = () => {
    if (peopleCount > 1) {
      setPeopleCount(peopleCount - 1);
    }
  };

  // Форматирование времени для отображения
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  // Обработчик добавления в заказ
  const handleAddToOrder = () => {
    if (!table) return;

    const reservationData = {
      table,
      startTime,
      endTime,
      peopleCount,
    };

    onAddToOrder(reservationData);
  };

  const handleOverlayPress = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!table) return null;

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
          {/* Заголовок модального окна */}
          <View style={[
            styles.header,
            Platform.OS === 'web' && styles.webHeader as ViewStyle
          ]}>
            <View style={styles.headerSpacer} />
            <Text style={[
              styles.modalTitle,
              Platform.OS === 'web' && styles.webModalTitle as TextStyle
            ]}>Бронирование стола</Text>
            <TouchableOpacity
              style={[
                styles.closeButton,
                Platform.OS === 'web' && styles.webCloseButton as ViewStyle
              ]}
              onPress={onClose}
            >
              <Text style={[
                styles.closeButtonText,
                Platform.OS === 'web' && styles.webCloseButtonText as TextStyle
              ]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Информация о столе */}
            <View style={styles.tableInfoSection}>
              <Text style={[
                styles.tableNumberLarge,
                Platform.OS === 'web' && styles.webTableNumberLarge as TextStyle
              ]}>
                Стол №{table.number}
              </Text>
              <Text style={[
                styles.description,
                Platform.OS === 'web' && styles.webDescription as TextStyle
              ]}>
                {table.description}
              </Text>

              <View style={[
                styles.tableSpecs,
                Platform.OS === 'web' && styles.webTableSpecs as ViewStyle
              ]}>
                <View style={styles.specItem}>
                  <Text style={[
                    styles.specLabel,
                    Platform.OS === 'web' && styles.webSpecLabel as TextStyle
                  ]}>Вместимость:</Text>
                  <Text style={[
                    styles.specValue,
                    Platform.OS === 'web' && styles.webSpecValue as TextStyle
                  ]}>
                    до {table.maxPeople} человек
                  </Text>
                </View>
              </View>
            </View>

            {/* Информация о времени бронирования */}
            <View style={styles.timeInfoSection}>
              <Text style={[
                styles.sectionTitle,
                Platform.OS === 'web' && styles.webSectionTitle as TextStyle
              ]}>Время бронирования</Text>
              <View style={[
                styles.timeDetails,
                Platform.OS === 'web' && styles.webTimeDetails as ViewStyle
              ]}>
                <View style={styles.timeRow}>
                  <Text style={[
                    styles.timeLabel,
                    Platform.OS === 'web' && styles.webTimeLabel as TextStyle
                  ]}>Начало:</Text>
                  <Text style={[
                    styles.timeValue,
                    Platform.OS === 'web' && styles.webTimeValue as TextStyle
                  ]}>
                    {formatDate(startTime)} {formatTime(startTime)}
                  </Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={[
                    styles.timeLabel,
                    Platform.OS === 'web' && styles.webTimeLabel as TextStyle
                  ]}>Окончание:</Text>
                  <Text style={[
                    styles.timeValue,
                    Platform.OS === 'web' && styles.webTimeValue as TextStyle
                  ]}>
                    {formatDate(endTime)} {formatTime(endTime)}
                  </Text>
                </View>
                <View style={[
                  styles.durationContainer,
                  Platform.OS === 'web' && styles.webDurationContainer as ViewStyle
                ]}>
                  <Text style={[
                    styles.durationText,
                    Platform.OS === 'web' && styles.webDurationText as TextStyle
                  ]}>
                    Продолжительность: {Math.round((endTime.getTime() - startTime.getTime()) / (60 * 60 * 1000))} часа(ов)
                  </Text>
                </View>
              </View>
            </View>

            {/* Выбор количества человек */}
            <View style={styles.quantitySection}>
              <Text style={[
                styles.sectionTitle,
                Platform.OS === 'web' && styles.webSectionTitle as TextStyle
              ]}>Количество человек</Text>
              <View style={[
                styles.quantityControls,
                Platform.OS === 'web' && styles.webQuantityControls as ViewStyle
              ]}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    peopleCount <= 1 && styles.quantityButtonDisabled,
                    Platform.OS === 'web' && styles.webQuantityButton as ViewStyle
                  ]}
                  onPress={handlePeopleDecrement}
                  disabled={peopleCount <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <View style={styles.quantityDisplay}>
                  <Text style={[
                    styles.quantityValue,
                    Platform.OS === 'web' && styles.webQuantityValue as TextStyle
                  ]}>{peopleCount}</Text>
                  <Text style={[
                    styles.quantityLabel,
                    Platform.OS === 'web' && styles.webQuantityLabel as TextStyle
                  ]}>человек(а)</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    peopleCount >= (table.maxPeople || 1) && styles.quantityButtonDisabled,
                    Platform.OS === 'web' && styles.webQuantityButton as ViewStyle
                  ]}
                  onPress={handlePeopleIncrement}
                  disabled={peopleCount >= (table.maxPeople || 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Кнопка добавления в заказ */}
          <View style={[
            styles.footer,
            Platform.OS === 'web' && styles.webFooter as ViewStyle
          ]}>
            <TouchableOpacity
              style={[
                styles.addButton,
                Platform.OS === 'web' && styles.webAddButton as ViewStyle
              ]}
              onPress={handleAddToOrder}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>
                Добавить в заказ
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
      backgroundColor: '#FFF8F0', // Кремовый фон для веба
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
      color: '#5D4037', // Темно-коричневый для веба
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
      backgroundColor: '#8D6E63', // Коричневый для веба
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
      color: '#FFF8F0', // Кремовый текст для веба
    },
    default: {}
  }) as TextStyle,

  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  } as ViewStyle,

  tableInfoSection: {
    marginBottom: 20,
  } as ViewStyle,

  tableNumberLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,

  webTableNumberLarge: Platform.select({
    web: {
      color: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as TextStyle,

  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  } as TextStyle,

  webDescription: Platform.select({
    web: {
      color: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as TextStyle,

  tableSpecs: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  } as ViewStyle,

  webTableSpecs: Platform.select({
    web: {
      backgroundColor: '#FFF8F0',
      borderWidth: 1,
      borderColor: '#F5E6D3',
    },
    default: {}
  }) as ViewStyle,

  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  specLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  } as TextStyle,

  webSpecLabel: Platform.select({
    web: {
      color: '#5D4037', // Темно-коричневый для веба
    },
    default: {}
  }) as TextStyle,

  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,

  webSpecValue: Platform.select({
    web: {
      color: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as TextStyle,

  timeInfoSection: {
    marginBottom: 20,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  } as TextStyle,

  webSectionTitle: Platform.select({
    web: {
      color: '#5D4037', // Темно-коричневый для веба
    },
    default: {}
  }) as TextStyle,

  timeDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  } as ViewStyle,

  webTimeDetails: Platform.select({
    web: {
      backgroundColor: '#FFF8F0',
      borderWidth: 1,
      borderColor: '#F5E6D3',
    },
    default: {}
  }) as ViewStyle,

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  timeLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  } as TextStyle,

  webTimeLabel: Platform.select({
    web: {
      color: '#5D4037', // Темно-коричневый для веба
    },
    default: {}
  }) as TextStyle,

  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,

  webTimeValue: Platform.select({
    web: {
      color: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as TextStyle,

  durationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  } as ViewStyle,

  webDurationContainer: Platform.select({
    web: {
      borderTopColor: '#F5E6D3',
    },
    default: {}
  }) as ViewStyle,

  durationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  } as TextStyle,

  webDurationText: Platform.select({
    web: {
      color: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as TextStyle,

  quantitySection: {
    marginBottom: 20,
  } as ViewStyle,

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 5,
    marginTop: 10,
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
      backgroundColor: '#8D6E63', // Коричневый для веба
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

  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 20,
  } as ViewStyle,

  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,

  webQuantityValue: Platform.select({
    web: {
      color: '#5D4037', // Темно-коричневый для веба
    },
    default: {}
  }) as TextStyle,

  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  } as TextStyle,

  webQuantityLabel: Platform.select({
    web: {
      color: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as TextStyle,

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  } as ViewStyle,

  webFooter: Platform.select({
    web: {
      borderTopColor: '#F5E6D3',
      backgroundColor: '#FFF8F0',
    },
    default: {}
  }) as ViewStyle,

  addButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  } as ViewStyle,

  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  webAddButton: Platform.select({
    web: {
      cursor: 'pointer',
      backgroundColor: '#8D6E63', // Коричневый для веба
    },
    default: {}
  }) as ViewStyle,
});