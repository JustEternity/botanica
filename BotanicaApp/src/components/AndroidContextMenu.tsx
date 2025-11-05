import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ContextMenuAction, MenuItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AndroidContextMenuProps {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAction: (action: ContextMenuAction, item: MenuItem) => void;
}

export default function AndroidContextMenu({ 
  visible, 
  item, 
  onClose, 
  onAction 
}: AndroidContextMenuProps) {
  const handleAction = (action: ContextMenuAction) => {
    if (!item) return;
    onAction(action, item);
    onClose();
  };

  const handleOverlayPress = () => {
    onClose();
  };

  if (!visible || !item) return null;

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
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.subtitle}>Выберите действие</Text>
            </View>

            {/* Кнопка удаления */}
            <TouchableOpacity
              style={[styles.menuButton, styles.destructiveButton]}
              onPress={() => handleAction('delete')}
            >
              <Text style={[styles.menuButtonText, styles.destructiveText]}>
                Удалить
              </Text>
            </TouchableOpacity>

            {/* Кнопка скрытия/показа */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleAction('toggle_visibility')}
            >
              <Text style={styles.menuButtonText}>
                {item.is_available ? 'Скрыть' : 'Показать'}
              </Text>
            </TouchableOpacity>

            {/* Кнопка редактирования */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleAction('edit')}
            >
              <Text style={styles.menuButtonText}>Редактировать</Text>
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