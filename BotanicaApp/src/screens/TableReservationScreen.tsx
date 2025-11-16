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
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.modalTitle}>Бронирование стола</Text>
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
            {/* Информация о столе */}
            <View style={styles.tableInfoSection}>
              <Text style={styles.tableNumberLarge}>
                Стол №{table.number}
              </Text>
              <Text style={styles.description}>
                {table.description}
              </Text>

              <View style={styles.tableSpecs}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Вместимость:</Text>
                  <Text style={styles.specValue}>
                    до {table.maxPeople} человек
                  </Text>
                </View>
              </View>
            </View>

            {/* Информация о времени бронирования */}
            <View style={styles.timeInfoSection}>
              <Text style={styles.sectionTitle}>Время бронирования</Text>
              <View style={styles.timeDetails}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Начало:</Text>
                  <Text style={styles.timeValue}>
                    {formatDate(startTime)} {formatTime(startTime)}
                  </Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Окончание:</Text>
                  <Text style={styles.timeValue}>
                    {formatDate(endTime)} {formatTime(endTime)}
                  </Text>
                </View>
                <View style={styles.durationContainer}>
                  <Text style={styles.durationText}>
                    Продолжительность: {Math.round((endTime.getTime() - startTime.getTime()) / (60 * 60 * 1000))} часа(ов)
                  </Text>
                </View>
              </View>
            </View>

            {/* Выбор количества человек */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Количество человек</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    peopleCount <= 1 && styles.quantityButtonDisabled
                  ]}
                  onPress={handlePeopleDecrement}
                  disabled={peopleCount <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityValue}>{peopleCount}</Text>
                  <Text style={styles.quantityLabel}>человек(а)</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    peopleCount >= (table.maxPeople || 1) && styles.quantityButtonDisabled
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
          <View style={styles.footer}>
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

  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  } as TextStyle,

  tableSpecs: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  } as ViewStyle,

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

  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,

  timeInfoSection: {
    marginBottom: 20,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  } as TextStyle,

  timeDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  } as ViewStyle,

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

  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,

  durationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  } as ViewStyle,

  durationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  } as TextStyle,

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

  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 20,
  } as ViewStyle,

  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,

  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  } as TextStyle,

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  } as ViewStyle,

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
    },
    default: {}
  }) as ViewStyle,
});