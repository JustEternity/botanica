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
    Platform,
    ViewStyle,
    TextStyle,
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

    const handleOverlayPress = (event: any) => {
        if (event.target === event.currentTarget) {
            onClose();
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
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#2E7D32" />
                            <Text style={styles.loadingText}>Загрузка корзины...</Text>
                        </View>
                    </View>
                </TouchableOpacity>
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
                    {/* Заголовок */}
                    <View style={styles.header}>
                        <View style={styles.headerSpacer} />
                        <Text style={styles.modalTitle}>Корзина</Text>
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
                                    <View style={styles.tableHeader}>
                                        <Text style={styles.tableNumber}>
                                            Стол №{tableReservation.table.number}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={removeTableReservation}
                                        >
                                            <Text style={styles.removeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.tableTime}>
                                        {formatDate(tableReservation.startTime)} • {formatTime(tableReservation.startTime)} - {formatTime(tableReservation.endTime)}
                                    </Text>
                                    <Text style={styles.tableDescription}>
                                        {tableReservation.table.description}
                                    </Text>

                                    <View style={styles.guestsControl}>
                                        <Text style={styles.guestsLabel}>Количество гостей:</Text>
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.quantityButton,
                                                    tableReservation.guestsCount <= 1 && styles.quantityButtonDisabled
                                                ]}
                                                onPress={handleGuestsDecrement}
                                                disabled={tableReservation.guestsCount <= 1}
                                            >
                                                <Text style={styles.quantityButtonText}>-</Text>
                                            </TouchableOpacity>

                                            <Text style={styles.quantityValue}>
                                                {tableReservation.guestsCount}
                                            </Text>

                                            <TouchableOpacity
                                                style={[
                                                    styles.quantityButton,
                                                    tableReservation.guestsCount >= (tableReservation.table.maxPeople || 10) && styles.quantityButtonDisabled
                                                ]}
                                                onPress={handleGuestsIncrement}
                                                disabled={tableReservation.guestsCount >= (tableReservation.table.maxPeople || 10)}
                                            >
                                                <Text style={styles.quantityButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        Выберите столик для бронирования на схеме зала
                                    </Text>
                                </View>
                            )}
                        </View>

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
                                            <View style={styles.quantityControlsSmall}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.quantityButtonSmall,
                                                        cartItem.quantity <= 1 && styles.quantityButtonDisabled
                                                    ]}
                                                    onPress={() => handleItemDecrement(cartItem.item.id)}
                                                    disabled={cartItem.quantity <= 1}
                                                >
                                                    <Text style={styles.quantityButtonText}>-</Text>
                                                </TouchableOpacity>

                                                <Text style={styles.quantityValueSmall}>
                                                    {cartItem.quantity}
                                                </Text>

                                                <TouchableOpacity
                                                    style={styles.quantityButtonSmall}
                                                    onPress={() => handleItemIncrement(cartItem.item.id)}
                                                >
                                                    <Text style={styles.quantityButtonText}>+</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <TouchableOpacity
                                                style={styles.removeButtonSmall}
                                                onPress={() => removeMenuItem(cartItem.item.id)}
                                            >
                                                <Text style={styles.removeButtonText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
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
                                    isSubmitting && styles.orderButtonDisabled,
                                    Platform.OS === 'web' && styles.webOrderButton as ViewStyle
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
        maxHeight: SCREEN_HEIGHT * 0.9,
    } as ViewStyle,

    webModalContainer: Platform.select({
        web: {
            width: '90%',
            maxWidth: 600,
            height: 'auto',
            maxHeight: SCREEN_HEIGHT * 0.9,
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

    section: {
        marginBottom: 24,
    } as ViewStyle,

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    } as TextStyle,

    tableCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    } as ViewStyle,

    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    } as ViewStyle,

    tableNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        flex: 1,
    } as TextStyle,

    tableTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    } as TextStyle,

    tableDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    } as TextStyle,

    guestsControl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    } as ViewStyle,

    guestsLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    } as TextStyle,

    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 25,
        padding: 5,
    } as ViewStyle,

    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    quantityButtonSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    quantityButtonDisabled: {
        backgroundColor: '#cccccc',
    } as ViewStyle,

    quantityButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    } as TextStyle,

    quantityValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
        minWidth: 30,
        textAlign: 'center',
        color: '#333',
    } as TextStyle,

    quantityValueSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 12,
        minWidth: 25,
        textAlign: 'center',
        color: '#333',
    } as TextStyle,

    removeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    removeButtonSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    } as ViewStyle,

    removeButtonText: {
        fontSize: 14,
        color: '#d32f2f',
        fontWeight: 'bold',
    } as TextStyle,

    menuItemCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    } as ViewStyle,

    menuItemInfo: {
        flex: 1,
        marginRight: 12,
    } as ViewStyle,

    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    } as TextStyle,

    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 4,
    } as TextStyle,

    menuItemDescription: {
        fontSize: 14,
        color: '#666',
    } as TextStyle,

    itemControl: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,

    quantityControlsSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 4,
    } as ViewStyle,

    emptyState: {
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    } as ViewStyle,

    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    } as TextStyle,

    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        minHeight: 100,
        textAlignVertical: 'top',
    } as TextStyle,

    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginTop: 8,
    } as ViewStyle,

    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    } as TextStyle,

    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
    } as TextStyle,

    footer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    } as ViewStyle,

    orderButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    } as ViewStyle,

    orderButtonDisabled: {
        backgroundColor: '#cccccc',
    } as ViewStyle,

    orderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,

    webOrderButton: Platform.select({
        web: {
            cursor: 'pointer',
        },
        default: {}
    }) as ViewStyle,

    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    } as ViewStyle,

    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '500',
    } as TextStyle,
});