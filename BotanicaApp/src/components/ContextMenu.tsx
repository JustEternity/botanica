// components/ContextMenu.tsx
import React from 'react';
import {
  Platform,
  ActionSheetIOS,
  Alert,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { ContextMenuAction, MenuItem } from '../types';

interface ContextMenuProps {
  item: MenuItem | null;
  onAction: (action: ContextMenuAction, item: MenuItem) => void;
  onCancel: () => void;
  // Новые пропсы для веб-версии
  visible?: boolean;
  onClose?: () => void;
}

export default function ContextMenu({
  item,
  onAction,
  onCancel,
  visible = false,
  onClose = () => {}
}: ContextMenuProps) {
  // Веб-реализация контекстного меню
  const WebContextMenu = () => {
    if (!item) return null;

    const handleAction = (action: ContextMenuAction) => {
      onAction(action, item);
      onClose();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.menu} onStartShouldSetResponder={() => true}>
            <Text style={styles.menuTitle}>{item.name}</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction('edit')}
            >
              <Text style={styles.menuText}>✏️ Редактировать</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction('toggle_visibility')}
            >
              <Text style={styles.menuText}>
                {item.is_available ? '👁️ Скрыть' : '👁️ Показать'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.destructiveItem]}
              onPress={() => handleAction('delete')}
            >
              <Text style={[styles.menuText, styles.destructiveText]}>🗑️ Удалить</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.menuText}>❌ Отмена</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // iOS реализация
  const showIOSActionSheet = () => {
    if (!item) return;

    const options = [
      'Удалить',
      item.is_available ? 'Скрыть' : 'Показать',
      'Редактировать',
      'Отмена'
    ];

    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 3;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: item.name,
        message: 'Выберите действие для этого товара',
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: // Удалить
            onAction('delete', item);
            break;
          case 1: // Скрыть/Показать
            onAction('toggle_visibility', item);
            break;
          case 2: // Редактировать
            onAction('edit', item);
            break;
          case 3: // Отмена
            onAction('cancel', item);
            onCancel();
            break;
          default:
            onCancel();
        }
      }
    );
  };

  // Рендерим в зависимости от платформы
  if (Platform.OS === 'web') {
    return <WebContextMenu />;
  }

  if (Platform.OS === 'ios' && item) {
    showIOSActionSheet();
  }

  return null;
}

const styles = StyleSheet.create({
  // Стили для веб-версии
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 16,
    textAlign: 'center',
  },
  destructiveItem: {
    backgroundColor: '#ffebee',
  },
  destructiveText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginTop: 8,
  },
});