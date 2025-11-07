import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MenuItem, MenuCategory } from '../types';
import { ApiService } from '../services/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditMenuItemModalProps {
    visible: boolean;
    categories: MenuCategory[];
    item?: MenuItem | null;
    onClose: () => void;
    onSave: (item: MenuItem) => void;
}

interface CloudinarySignature {
    signature: string;
    timestamp: number;
    cloud_name: string;
    api_key: string;
    overwrite: boolean;
    invalidate: boolean;
}

export default function EditMenuItemModal({
    visible,
    categories,
    item,
    onClose,
    onSave,
}: EditMenuItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category_id: '',
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isNewImage, setIsNewImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Refs для скролла категорий
    const categoriesScrollRef = useRef<ScrollView>(null);
    const categoryPositions = useRef<{[key: string]: number}>({});
    const categoryWidths = useRef<{[key: string]: number}>({});

    // Сбрасываем форму при открытии/закрытии модального окна
    useEffect(() => {
        if (visible) {
            if (item) {
                const initialCategoryId = item.category_id.toString() || (categories[0]?.id || '');
                setFormData({
                    name: item.name,
                    price: item.price.toString(),
                    description: item.description,
                    category_id: initialCategoryId,
                });
                setSelectedImage(item.image);
                setIsNewImage(false);
                setImageError(false);
                setImageLoading(true);
            } else {
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    category_id: categories[0]?.id || '',
                });
                setSelectedImage(null);
                setIsNewImage(false);
                setImageError(false);
                setImageLoading(true);
            }
        }
    }, [visible, item, categories]);

    // Автоматический скролл к выбранной категории
    useEffect(() => {
        if (visible && formData.category_id && categoriesScrollRef.current) {
            // Ждем немного, чтобы layout успел обновиться
            const timer = setTimeout(() => {
                const selectedPosition = categoryPositions.current[formData.category_id];
                const selectedWidth = categoryWidths.current[formData.category_id];
                
                if (selectedPosition !== undefined && selectedWidth !== undefined) {
                    // Вычисляем позицию для центрирования
                    const scrollPosition = Math.max(0, selectedPosition - (SCREEN_WIDTH - selectedWidth) / 2);
                    categoriesScrollRef.current?.scrollTo({
                        x: scrollPosition,
                        animated: true
                    });
                }
            }, 150);
            
            return () => clearTimeout(timer);
        }
    }, [visible, formData.category_id, categories]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImagePick = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1.0,
            });

            console.log('ImagePicker Result:', result);

            if (!result.canceled && result.assets && result.assets[0]) {
                const selectedAsset = result.assets[0];
                setSelectedImage(selectedAsset.uri);
                setIsNewImage(true);
                setImageError(false);
                setImageLoading(true);
            } else {
                console.log('User cancelled image picker');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать изображение');
        }
    };

    // Функция для получения оптимизированного URL изображения
    const getDisplayImageUrl = (imageUri: string | null) => {
        if (!imageUri) return null;

        if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
            return imageUri;
        }

        return getOptimizedImageUrl(imageUri);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleRetryLoad = () => {
        setImageError(false);
        setImageLoading(true);
    };

    // Сохранение позиции и ширины категории
    const saveCategoryLayout = (categoryId: string, x: number, width: number) => {
        categoryPositions.current[categoryId] = x;
        categoryWidths.current[categoryId] = width;
    };

    // 1. Запрос подписи у сервера
    const getCloudinarySignature = async (existingPublicId?: string): Promise<CloudinarySignature> => {
        try {
            const token = await ApiService.getAuthToken();
            if (!token) {
                throw new Error('Требуется авторизация');
            }
            const payload: any = { overwrite: true };
            if (existingPublicId) {
                payload.public_id = existingPublicId;
            }
            const response = await fetch('http://45.153.189.245:3001/api/cloudinary-signature', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting cloudinary signature:', error);
            throw error;
        }
    };

    // Прямая загрузка в Cloudinary с перезаписью существующих изображений
    const uploadImageToCloudinaryDirectly = async (imageUri: string): Promise<{ public_id: string, secure_url: string }> => {
        try {
            setIsUploading(true);

            let targetPublicId: string | undefined;
            if (item && item.cloudinary_public_id) {
                targetPublicId = item.cloudinary_public_id;
                console.log('Using existing public_id for overwrite:', targetPublicId);
            } else {
                targetPublicId = `botanica_item_${Math.random().toString(36).substring(2, 9)}`;
                console.log('Generated new public_id:', targetPublicId);
            }

            const signatureData = await getCloudinarySignature(targetPublicId);

            const formData = new FormData();
            const filename = imageUri.split('/').pop() || 'upload.jpg';
            const fileType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                type: fileType,
                name: filename,
            } as any);

            formData.append('timestamp', signatureData.timestamp.toString());
            formData.append('signature', signatureData.signature);
            formData.append('api_key', signatureData.api_key);
            formData.append('overwrite', signatureData.overwrite.toString());
            formData.append('invalidate', signatureData.invalidate.toString());
            formData.append('quality', 'auto:good');
            formData.append('fetch_format', 'auto');
            formData.append('public_id', targetPublicId);

            console.log('Uploading to Cloudinary with params:', {
                cloud_name: signatureData.cloud_name,
                overwrite: signatureData.overwrite,
                public_id: targetPublicId,
                quality: 'auto:good'
            });

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;
            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Cloudinary upload error:', errorText);
                throw new Error(`Cloudinary upload failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('Cloudinary upload success:', {
                public_id: result.public_id,
                url: result.secure_url,
                bytes: result.bytes,
                format: result.format
            });

            return {
                public_id: result.public_id,
                secure_url: result.secure_url
            };
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Ошибка', 'Введите название товара');
            return;
        }

        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            Alert.alert('Ошибка', 'Введите корректную цену');
            return;
        }

        if (!formData.description.trim()) {
            Alert.alert('Ошибка', 'Введите описание товара');
            return;
        }

        if (!formData.category_id) {
            Alert.alert('Ошибка', 'Выберите категорию');
            return;
        }

        if (!selectedImage) {
            Alert.alert('Ошибка', 'Выберите изображение товара');
            return;
        }

        setIsLoading(true);

        try {
            let cloudinaryData = null;

            if (isNewImage && selectedImage) {
                console.log('Uploading new image for:', item ? 'existing item' : 'new item');
                cloudinaryData = await uploadImageToCloudinaryDirectly(selectedImage);
                if (!cloudinaryData) {
                    throw new Error('Не удалось загрузить изображение');
                }
            }

            const itemData: any = {
                id: item?.id || Date.now().toString(),
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                description: formData.description.trim(),
                category_id: formData.category_id,
                is_available: true,
            };

            if (cloudinaryData) {
                itemData.cloudinary_public_id = cloudinaryData.public_id;
                itemData.cloudinary_url = cloudinaryData.secure_url;
                itemData.image = cloudinaryData.secure_url;
            } else if (item) {
                itemData.cloudinary_public_id = item.cloudinary_public_id;
                itemData.cloudinary_url = item.image;
                itemData.image = item.image;
            } else {
                itemData.image = selectedImage;
            }

            if (item) {
                await ApiService.updateMenuItem(item.id, itemData);
            } else {
                await ApiService.addMenuItem(itemData);
            }

            const completeItemData: MenuItem = {
                ...itemData,
                image: cloudinaryData ? cloudinaryData.secure_url : (item?.image || selectedImage),
                is_available: true,
            };

            onSave(completeItemData);
            Alert.alert('Успех', item ? 'Товар обновлен' : 'Товар добавлен');
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить товар');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading && !isUploading) {
            onClose();
        }
    };

    const displayImage = getDisplayImageUrl(selectedImage);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {item ? 'Редактирование товара' : 'Добавление товара'}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            disabled={isLoading || isUploading}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableOpacity
                            style={styles.imageContainer}
                            onPress={handleImagePick}
                            disabled={isUploading}
                        >
                            {displayImage ? (
                                <View style={styles.imageWrapper}>
                                    {imageLoading && (
                                        <View style={[styles.image, styles.imageLoading]}>
                                            <ActivityIndicator size="large" color="#2E7D32" />
                                        </View>
                                    )}

                                    <Image
                                        source={{ uri: displayImage }}
                                        style={[
                                            styles.image,
                                            imageLoading && styles.imageHidden
                                        ]}
                                        resizeMode="cover"
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                    />

                                    {imageError && (
                                        <TouchableOpacity
                                            style={[styles.image, styles.imageError]}
                                            onPress={handleRetryLoad}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.errorIcon}>🖼️</Text>
                                            <Text style={styles.errorText}>Ошибка загрузки изображения</Text>
                                            <Text style={styles.retryHint}>Нажмите для повторной загрузки</Text>
                                        </TouchableOpacity>
                                    )}

                                    {(isUploading) && (
                                        <View style={styles.uploadOverlay}>
                                            <ActivityIndicator size="large" color="#2E7D32" />
                                            <Text style={styles.uploadText}>
                                                {isUploading ? 'Загрузка в Cloudinary...' : 'Новое изображение'}
                                            </Text>
                                        </View>
                                    )}
                                    {isNewImage && !isUploading && (
                                        <View style={styles.newImageBadge}>
                                            <Text style={styles.newImageText}>Новое изображение</Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Text style={styles.imagePlaceholderIcon}>📷</Text>
                                    <Text style={styles.imagePlaceholderText}>
                                        Нажмите чтобы выбрать фото
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Название товара</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder="Введите название товара"
                                placeholderTextColor="#999"
                                editable={!isLoading && !isUploading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Категория</Text>
                            <ScrollView
                                ref={categoriesScrollRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoriesScroll}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {categories.map((category) => {
                                    const isSelected = formData.category_id === category.id;
                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.categoryButton,
                                                isSelected && styles.categoryButtonActive
                                            ]}
                                            onPress={() => handleInputChange('category_id', category.id)}
                                            disabled={isLoading || isUploading}
                                            onLayout={(event) => {
                                                const { x, width } = event.nativeEvent.layout;
                                                saveCategoryLayout(category.id, x, width);
                                            }}
                                        >
                                            <Text style={[
                                                styles.categoryButtonText,
                                                isSelected && styles.categoryButtonTextActive
                                            ]}>
                                                {category.title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Описание</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                placeholder="Введите описание товара"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={!isLoading && !isUploading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Цена (₽)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.price}
                                onChangeText={(value) => handleInputChange('price', value.replace(/[^0-9]/g, ''))}
                                placeholder="0"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                editable={!isLoading && !isUploading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (isLoading || isUploading) && styles.saveButtonDisabled
                            ]}
                            onPress={handleSave}
                            disabled={isLoading || isUploading}
                        >
                            {(isLoading || isUploading) ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    {item ? 'Сохранить изменения' : 'Добавить товар'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
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
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
        flex: 1,
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
    imageContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    imageLoading: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        position: 'absolute',
        zIndex: 1,
    },
    imageHidden: {
        opacity: 0,
    },
    imageError: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    errorIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 4,
        fontWeight: '500',
    },
    retryHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    uploadText: {
        color: 'white',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    newImageBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#2E7D32',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 1,
    },
    newImageText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e9ecef',
        borderStyle: 'dashed',
    },
    imagePlaceholderIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    categoriesScroll: {
        marginHorizontal: -5,
        maxHeight: 50,
    },
    categoriesContainer: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        alignItems: 'center',
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 4,
    },
    categoryButtonActive: {
        backgroundColor: '#2E7D32',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});