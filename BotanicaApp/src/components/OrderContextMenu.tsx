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
  availableActions: string[];
}

export default function OrderContextMenu({ 
  visible, 
  order, 
  onClose, 
  onAction,
  availableActions 
}: OrderContextMenuProps) {
  const handleAction = (action: string) => {
    if (!order) return;
    onAction(action, order);
  };

  const handleOverlayPress = () => {
    onClose();
  };

  // Функция для получения метки действия
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'complete':
        return 'Выполнить заказ';
      case 'cancel':
        return 'Отменить заказ';
      case 'delete':
        return 'Удалить заказ';
      default:
        return action;
    }
  };

  // Функция для получения иконки действия
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'complete':
        return '✅';
      case 'cancel':
        return '❌';
      case 'delete':
        return '🗑️';
      default:
        return '⚙️';
    }
  };

  // iOS Action Sheet
  if (Platform.OS === 'ios' && visible && order) {
    const options = [];
    const destructiveButtonIndex: number[] = [];
    
    // Добавляем доступные действия
    availableActions.forEach((action, index) => {
      options.push(getActionLabel(action));
      if (action === 'cancel' || action === 'delete') {
        destructiveButtonIndex.push(index);
      }
    });
    
    // Добавляем кнопку отмены
    const cancelButtonIndex = options.length;
    options.push('Отмена');

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveButtonIndex.length > 0 ? destructiveButtonIndex : undefined,
        title: `Заказ #${order.id}`,
        message: `Статус: ${order.status}`,
      },
      (buttonIndex) => {
        if (buttonIndex === cancelButtonIndex) {
          onClose();
          return;
        }

        // Если нажата одна из action кнопок
        if (buttonIndex < availableActions.length) {
          const action = availableActions[buttonIndex];
          handleAction(action);
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

            {/* Доступные действия */}
            {availableActions.map((action) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.menuButton,
                  (action === 'cancel' || action === 'delete') && styles.destructiveButton
                ]}
                onPress={() => handleAction(action)}
              >
                <Text style={[
                  styles.menuButtonText,
                  (action === 'cancel' || action === 'delete') && styles.destructiveText
                ]}>
                  {getActionIcon(action)} {getActionLabel(action)}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Разделитель */}
            {availableActions.length > 0 && <View style={styles.separator} />}

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