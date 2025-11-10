import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CartModalProps {
    visible: boolean;
    onClose: () => void;
    onOrderSuccess?: () => void;
}

export default function CartModal({ visible, onClose, onOrderSuccess }: CartModalProps) {
    const { user } = useAuth();
    const {
        tableReservation,
        menuItems,
        comment,
        updateTableGuests,
        removeTableReservation,
        updateMenuItemQuantity,
        removeMenuItem,
        setComment,
        clearCart,
        getTotalPrice,
        getItemsCount,
        isEmpty,
        isLoading,
    } = useCart();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Форматирование времени
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
        });
    };

    // Обработчики для гостей
    const handleGuestsIncrement = () => {
        if (tableReservation) {
            const newCount = tableReservation.guestsCount + 1;
            if (newCount <= (tableReservation.table.maxPeople || 10)) {
                updateTableGuests(newCount);
            }
        }
    };

    const handleGuestsDecrement = () => {
        if (tableReservation) {
            const newCount = tableReservation.guestsCount - 1;
            if (newCount >= 1) {
                updateTableGuests(newCount);
            }
        }
    };

    // Обработчики для товаров
    const handleItemIncrement = (itemId: string) => {
        const cartItem = menuItems.find(item => item.item.id === itemId);
        if (cartItem) {
            updateMenuItemQuantity(itemId, cartItem.quantity + 1);
        }
    };

    const handleItemDecrement = (itemId: string) => {
        const cartItem = menuItems.find(item => item.item.id === itemId);
        if (cartItem) {
            updateMenuItemQuantity(itemId, cartItem.quantity - 1);
        }
    };

    // Оформление заказа
    const handleCreateOrder = async () => {
        if (!user) {
            Alert.alert(
                'Требуется авторизация',
                'Пожалуйста, войдите в систему для оформления заказа',
                [
                    { text: 'Отмена', style: 'cancel' },
                    {
                        text: 'Войти', onPress: () => {
                            onClose();
                            // Здесь можно добавить навигацию к экрану входа
                        }
                    }
                ]
            );
            return;
        }

        if (!tableReservation) {
            Alert.alert('Ошибка', 'Выберите столик для бронирования');
            return;
        }

        // if (menuItems.length === 0) {
        //     Alert.alert('Ошибка', 'Добавьте товары в заказ');
        //     return;
        // }

        setIsSubmitting(true);

        try {
            const orderData = {
                table_id: tableReservation.table.id,
                start_time: tableReservation.startTime.toISOString(),
                end_time: tableReservation.endTime.toISOString(),
                guests_count: tableReservation.guestsCount,
                items: menuItems.map(cartItem => ({
                    menu_item_id: cartItem.item.id,
                    quantity: cartItem.quantity,
                })),
                notes: comment || undefined,
            };

            await ApiService.createOrder(orderData);

            Alert.alert('Успех', 'Заказ успешно оформлен!');
            clearCart();
            onOrderSuccess?.();

            onClose();
        } catch (error: any) {
            console.error('Ошибка создания заказа:', error);
            Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте еще раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPrice = getTotalPrice();

    // Если корзина загружается, показываем индикатор
    if (isLoading) {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#2E7D32" />
                            <Text style={styles.loadingText}>Загрузка корзины...</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Заголовок */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Корзина</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Секция столика */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Бронирование столика</Text>

                            {tableReservation ? (
                                <View style={styles.tableCard}>
                                    <View style={styles.tableInfo}>
                                        <Text style={styles.tableNumber}>
                                            Стол №{tableReservation.table.number}
                                        </Text>
                                        <Text style={styles.tableTime}>
                                            {formatDate(tableReservation.startTime)} • {formatTime(tableReservation.startTime)} - {formatTime(tableReservation.endTime)}
                                        </Text>
                                        <Text style={styles.tableDescription}>
                                            {tableReservation.table.description}
                                        </Text>
                                    </View>

                                    <View style={styles.guestsControl}>
                                        <Text style={styles.guestsLabel}>Гости:</Text>
                                        <View style={styles.counterContainer}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.counterButton,
                                                    tableReservation.guestsCount <= 1 && styles.counterButtonDisabled
                                                ]}
                                                onPress={handleGuestsDecrement}
                                                disabled={tableReservation.guestsCount <= 1}
                                            >
                                                <Text style={styles.counterButtonText}>-</Text>
                                            </TouchableOpacity>

                                            <Text style={styles.counterValue}>
                                                {tableReservation.guestsCount}
                                            </Text>

                                            <TouchableOpacity
                                                style={[
                                                    styles.counterButton,
                                                    tableReservation.guestsCount >= (tableReservation.table.maxPeople || 10) && styles.counterButtonDisabled
                                                ]}
                                                onPress={handleGuestsIncrement}
                                                disabled={tableReservation.guestsCount >= (tableReservation.table.maxPeople || 10)}
                                            >
                                                <Text style={styles.counterButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={removeTableReservation}
                                    >
                                        <Text style={styles.removeButtonText}>Удалить</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        Выберите столик для бронирования на схеме зала
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Разделитель */}
                        <View style={styles.divider} />

                        {/* Секция товаров */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Заказанные блюда</Text>

                            {menuItems.length > 0 ? (
                                menuItems.map((cartItem) => (
                                    <View key={cartItem.item.id} style={styles.menuItemCard}>
                                        <View style={styles.menuItemInfo}>
                                            <Text style={styles.menuItemName}>
                                                {cartItem.item.name}
                                            </Text>
                                            <Text style={styles.menuItemPrice}>
                                                {cartItem.item.price * cartItem.quantity} ₽
                                            </Text>
                                            <Text style={styles.menuItemDescription}>
                                                {cartItem.item.price} ₽ × {cartItem.quantity} шт.
                                            </Text>
                                        </View>

                                        <View style={styles.itemControl}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.smallCounterButton,
                                                    cartItem.quantity <= 1 && styles.counterButtonDisabled
                                                ]}
                                                onPress={() => handleItemDecrement(cartItem.item.id)}
                                                disabled={cartItem.quantity <= 1}
                                            >
                                                <Text style={styles.smallCounterButtonText}>-</Text>
                                            </TouchableOpacity>

                                            <Text style={styles.smallCounterValue}>
                                                {cartItem.quantity}
                                            </Text>

                                            <TouchableOpacity
                                                style={styles.smallCounterButton}
                                                onPress={() => handleItemIncrement(cartItem.item.id)}
                                            >
                                                <Text style={styles.smallCounterButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.smallRemoveButton}
                                            onPress={() => removeMenuItem(cartItem.item.id)}
                                        >
                                            <Text style={styles.smallRemoveButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        Выберите позиции из меню
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Поле для комментария */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Комментарий к заказу</Text>
                            <TextInput
                                style={styles.commentInput}
                                value={comment}
                                onChangeText={setComment}
                                placeholder="Добавьте пожелания к заказу..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Итоговая сумма */}
                        {(!isEmpty() && menuItems.length > 0) && (
                            <View style={styles.totalSection}>
                                <Text style={styles.totalLabel}>Итого:</Text>
                                <Text style={styles.totalPrice}>{totalPrice} ₽</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Кнопка оформления заказа */}
                    {!isEmpty() && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.orderButton,
                                    isSubmitting && styles.orderButtonDisabled
                                ]}
                                onPress={handleCreateOrder}
                                disabled={isSubmitting || !tableReservation}
                            >
                                <Text style={styles.orderButtonText}>
                                    {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.9,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    tableCard: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    },
    tableInfo: {
        marginBottom: 12,
    },
    tableNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 4,
    },
    tableTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    tableDescription: {
        fontSize: 12,
        color: '#888',
    },
    guestsControl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    guestsLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 4,
    },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    counterButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    counterValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    removeButton: {
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    removeButtonText: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: '500',
    },
    menuItemCard: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuItemInfo: {
        flex: 1,
    },
    menuItemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    menuItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 2,
    },
    menuItemDescription: {
        fontSize: 12,
        color: '#666',
    },
    itemControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 2,
        marginRight: 8,
    },
    smallCounterButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallCounterButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
    },
    smallCounterValue: {
        fontSize: 12,
        fontWeight: 'bold',
        marginHorizontal: 8,
        minWidth: 15,
        textAlign: 'center',
    },
    smallRemoveButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallRemoveButtonText: {
        fontSize: 12,
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    emptyState: {
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    orderButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    orderButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    orderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '500',
    },
});