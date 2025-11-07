import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Order } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OrderContextMenuProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onAction: (action: string, order: Order) => void;
}

export default function OrderContextMenu({ 
  visible, 
  order, 
  onClose, 
  onAction 
}: OrderContextMenuProps) {
  const handleAction = (action: string) => {
    if (!order) return;
    onAction(action, order);
  };

  const handleOverlayPress = () => {
    onClose();
  };

  // iOS Action Sheet
  if (Platform.OS === 'ios' && visible && order) {
    const options = [];
    const destructiveButtonIndex: number[] = [];
    let cancelButtonIndex = 0;

    // Доступные действия в зависимости от статуса
    if (order.status === 'в работе') {
      options.push('Выполнить заказ');
      options.push('Отменить заказ');
      destructiveButtonIndex.push(1); // Отмена - деструктивное действие
      options.push('Удалить заказ');
      destructiveButtonIndex.push(2); // Удаление - деструктивное действие
      cancelButtonIndex = 3;
    } else {
      // Для выполненных или отмененных заказов
      options.push('Удалить заказ');
      destructiveButtonIndex.push(0); // Удаление - деструктивное действие
      cancelButtonIndex = 1;
    }
    
    options.push('Отмена');

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: `Заказ #${order.id}`,
        message: `Статус: ${order.status}`,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: // Первая кнопка
            if (order.status === 'в работе') {
              handleAction('complete');
            } else {
              handleAction('delete');
            }
            break;
          case 1: // Вторая кнопка
            if (order.status === 'в работе') {
              handleAction('cancel');
            } else {
              // Для неактивных заказов - отмена
              onClose();
            }
            break;
          case 2: // Третья кнопка (только для заказов в работе)
            if (order.status === 'в работе') {
              handleAction('delete');
            }
            break;
          default:
            onClose();
        }
      }
    );
    return null;
  }

  if (!visible || !order) return null;

  // Android Modal
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
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            {/* Заголовок */}
            <View style={styles.header}>
              <Text style={styles.title}>Заказ #{order.id}</Text>
              <Text style={styles.subtitle}>Статус: {order.status}</Text>
              <Text style={styles.subtitle}>Выберите действие</Text>
            </View>

            {/* Действия в зависимости от статуса */}
            {order.status === 'в работе' && (
              <>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => handleAction('complete')}
                >
                  <Text style={styles.menuButtonText}>
                    ✅ Выполнить заказ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuButton, styles.destructiveButton]}
                  onPress={() => handleAction('cancel')}
                >
                  <Text style={[styles.menuButtonText, styles.destructiveText]}>
                    ❌ Отменить заказ
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Удаление заказа для всех статусов */}
            <TouchableOpacity
              style={[styles.menuButton, styles.destructiveButton]}
              onPress={() => handleAction('delete')}
            >
              <Text style={[styles.menuButtonText, styles.destructiveText]}>
                🗑️ Удалить заказ
              </Text>
            </TouchableOpacity>

            {/* Разделитель */}
            <View style={styles.separator} />

            {/* Кнопка отмены */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
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
  menuContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  menuContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  menuButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  destructiveButton: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  separator: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});