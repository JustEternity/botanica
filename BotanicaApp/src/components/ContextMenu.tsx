// components/ContextMenu.tsx
import React from 'react';
import {
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { ContextMenuAction, MenuItem } from '../types';

interface ContextMenuProps {
  item: MenuItem | null;
  onAction: (action: ContextMenuAction, item: MenuItem) => void;
  onCancel: () => void;
}

export default function ContextMenu({ item, onAction, onCancel }: ContextMenuProps) {
  const showActionSheet = () => {
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
            onCancel(); // Явно вызываем отмену
            break;
          default:
            onCancel(); // На случай любого другого закрытия
        }
      }
    );
  };

  React.useEffect(() => {
    if (Platform.OS === 'ios' && item) {
      showActionSheet();
    }
  }, [item]);

  return null;
}