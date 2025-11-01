import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Table } from '../types';
import { tableReservationStyles } from '../styles/tableReservationStyles';

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

  if (!table) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={tableReservationStyles.modalContainer}>
        <View style={tableReservationStyles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Заголовок модального окна */}
            <View style={tableReservationStyles.modalHeader}>
              <Text style={tableReservationStyles.modalTitle}>Бронирование стола</Text>
              <TouchableOpacity
                style={tableReservationStyles.closeButton}
                onPress={onClose}
              >
                <Text style={tableReservationStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Информация о столе */}
            <View style={tableReservationStyles.tableInfoSection}>
              <Text style={tableReservationStyles.tableNumberLarge}>
                Стол №{table.number}
              </Text>
              <Text style={tableReservationStyles.tableDescription}>
                {table.description}
              </Text>

              <View style={tableReservationStyles.tableSpecs}>
                <View style={tableReservationStyles.specItem}>
                  <Text style={tableReservationStyles.specLabel}>Вместимость:</Text>
                  <Text style={tableReservationStyles.specValue}>
                    до {table.maxPeople} человек
                  </Text>
                </View>
              </View>
            </View>

            {/* Информация о времени бронирования */}
            <View style={tableReservationStyles.timeInfoSection}>
                <Text style={tableReservationStyles.timeInfoTitle}>Время бронирования</Text>
                <View style={tableReservationStyles.timeDetails}>
                    <Text style={tableReservationStyles.timeDetail}>
                    Начало: {formatDate(startTime)} {formatTime(startTime)}
                    </Text>
                    <Text style={tableReservationStyles.timeDetail}>
                    Окончание: {formatDate(endTime)} {formatTime(endTime)}
                    </Text>
                    <Text style={tableReservationStyles.durationText}>
                    Продолжительность: {Math.round((endTime.getTime() - startTime.getTime()) / (60 * 60 * 1000))} часа(ов)
                    </Text>
                </View>
                </View>

            {/* Выбор количества человек */}
            <View style={tableReservationStyles.optionSection}>
              <Text style={tableReservationStyles.optionTitle}>Количество человек</Text>
              <View style={tableReservationStyles.counterContainer}>
                <TouchableOpacity
                  style={tableReservationStyles.counterButton}
                  onPress={handlePeopleDecrement}
                  disabled={peopleCount <= 1}
                >
                  <Text style={[
                    tableReservationStyles.counterButtonText,
                    peopleCount <= 1 && tableReservationStyles.counterButtonDisabled
                  ]}>-</Text>
                </TouchableOpacity>

                <View style={tableReservationStyles.counterDisplay}>
                  <Text style={tableReservationStyles.counterValue}>{peopleCount}</Text>
                  <Text style={tableReservationStyles.counterLabel}>человек(а)</Text>
                </View>

                <TouchableOpacity
                  style={tableReservationStyles.counterButton}
                  onPress={handlePeopleIncrement}
                  disabled={peopleCount >= (table.maxPeople || 1)}
                >
                  <Text style={[
                    tableReservationStyles.counterButtonText,
                    peopleCount >= (table.maxPeople || 1) && tableReservationStyles.counterButtonDisabled
                  ]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Кнопка добавления в заказ */}
            <TouchableOpacity
              style={tableReservationStyles.addToOrderButton}
              onPress={handleAddToOrder}
              activeOpacity={0.7}
            >
              <Text style={tableReservationStyles.addToOrderButtonText}>
                Добавить в заказ
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}