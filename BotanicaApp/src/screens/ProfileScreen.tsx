import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { profileStyles } from '../styles/profileStyles';
import { useAuth } from '../contexts/AuthContext';
import RegisterModal from '../components/RegisterModal';
import { ApiService, uploadProfilePhotoDirectly } from '../services/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const defaultAvatar = require('../../assets/default-avatar.jpg');

interface ProfileScreenProps {
  navigation: any;
}

// Глобальная переменная для отслеживания версии фото
let globalPhotoVersion = 0;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, login, register, logout, isLoading, checkAuth } = useAuth();
  const [phone, setPhone] = useState('+7');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  
  const isMountedRef = useRef(true);
  const currentOperationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Инициализация при первом рендере
    setLocalPhotoUrl(null);
    initializePhotoState();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Обновление фото при изменении пользователя
  useEffect(() => {
    if (user?.cloudinary_url) {
      updatePhotoFromServer(user.cloudinary_url);
    } else {
      setLocalPhotoUrl(null);
    }
  }, [user?.cloudinary_url]);

  const initializePhotoState = () => {
    if (user?.cloudinary_url) {
      updatePhotoFromServer(user.cloudinary_url);
    } else {
      setLocalPhotoUrl(null);
    }
  };

  const updatePhotoFromServer = (cloudinaryUrl: string) => {
    if (!cloudinaryUrl) {
      setLocalPhotoUrl(null);
      return;
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const optimizedUrl = getOptimizedImageUrl(cloudinaryUrl, 200, 200);
    const freshUrl = `${optimizedUrl}${optimizedUrl.includes('?') ? '&' : '?'}_t=${timestamp}&r=${random}&v=${++globalPhotoVersion}`;
    
    setLocalPhotoUrl(freshUrl);
    setPhotoVersion(globalPhotoVersion);
  };

  const handlePhoneChange = (text: string) => {
    if (!text.startsWith('+7')) {
      setPhone('+7');
      return;
    }

    const cleaned = text.replace(/[^\d+]/g, '');
    if (cleaned.length > 12) return;
    setPhone(cleaned);
  };

  const formatDisplayPhone = (phone: string) => {
    if (phone.length <= 2) return phone;
    const digits = phone.slice(2);

    if (digits.length <= 3) return `+7 (${digits}`;
    if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  };

  const generateFreshPhotoUrl = (baseUrl: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_t=${timestamp}&r=${random}&v=${++globalPhotoVersion}`;
  };

  const handlePhotoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        
        setIsPhotoLoading(true);
        const operationId = Date.now().toString();
        currentOperationIdRef.current = operationId;
        
        try {
          // Оптимистичное обновление - показываем выбранное фото сразу
          const freshLocalUrl = generateFreshPhotoUrl(selectedAsset.uri);
          setLocalPhotoUrl(freshLocalUrl);
          setPhotoVersion(globalPhotoVersion);
          
          // Загружаем фото на сервер
          const uploadResponse = await uploadProfilePhotoDirectly(selectedAsset.uri);
          
          if (uploadResponse && uploadResponse.user?.cloudinary_url) {
            // Обновляем фото с серверным URL
            const freshServerUrl = generateFreshPhotoUrl(uploadResponse.user.cloudinary_url);
            
            if (isMountedRef.current && currentOperationIdRef.current === operationId) {
              setLocalPhotoUrl(freshServerUrl);
              setPhotoVersion(globalPhotoVersion);
            }
            
            Alert.alert('Успех', 'Фото профиля обновлено');
          }
        } catch (error) {
          console.error('Ошибка загрузки фото:', error);
          if (isMountedRef.current && currentOperationIdRef.current === operationId) {
            // Восстанавливаем предыдущее состояние
            if (user?.cloudinary_url) {
              updatePhotoFromServer(user.cloudinary_url);
            } else {
              setLocalPhotoUrl(null);
            }
            Alert.alert('Ошибка', 'Не удалось обновить фото профиля');
          }
        } finally {
          if (isMountedRef.current && currentOperationIdRef.current === operationId) {
            setIsPhotoLoading(false);
            currentOperationIdRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      if (isMountedRef.current) {
        Alert.alert('Ошибка', 'Не удалось выбрать изображение');
        setIsPhotoLoading(false);
        currentOperationIdRef.current = null;
      }
    }
  };

  const handlePhotoRemove = async () => {
    Alert.alert(
      'Удаление фото',
      'Вы уверены, что хотите удалить фото профиля?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setIsPhotoLoading(true);
            const operationId = Date.now().toString();
            currentOperationIdRef.current = operationId;
            
            try {
              // Оптимистичное обновление - сразу убираем фото
              setLocalPhotoUrl(null);
              
              await ApiService.removeProfilePhoto();
              
              if (isMountedRef.current && currentOperationIdRef.current === operationId) {
                Alert.alert('Успех', 'Фото профиля удалено');
              }
            } catch (error) {
              console.error('Ошибка удаления фото профиля:', error);
              if (isMountedRef.current && currentOperationIdRef.current === operationId) {
                // Восстанавливаем предыдущее состояние
                if (user?.cloudinary_url) {
                  updatePhotoFromServer(user.cloudinary_url);
                }
                Alert.alert('Ошибка', 'Не удалось удалить фото профиля');
              }
            } finally {
              if (isMountedRef.current && currentOperationIdRef.current === operationId) {
                setIsPhotoLoading(false);
                currentOperationIdRef.current = null;
              }
            }
          }
        }
      ]
    );
  };

  const handlePhotoPress = () => {
    if (!user || isPhotoLoading) {
      return;
    }

    const options = [];

    if (user.cloudinary_url || localPhotoUrl) {
      options.push(
        { text: 'Удалить фото', style: 'destructive' as const, onPress: handlePhotoRemove },
        { text: 'Изменить фото', onPress: handlePhotoPick }
      );
    } else {
      options.push({ text: 'Добавить фото', onPress: handlePhotoPick });
    }

    options.push({ text: 'Отмена', style: 'cancel' as const });

    Alert.alert(
      'Фото профиля',
      'Выберите действие',
      options
    );
  };

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (phone.length < 12) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setIsLoginLoading(true);
    try {
      const success = await login({ phone, password });
      if (!success) {
        Alert.alert('Ошибка', 'Неверный номер телефона или пароль');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Произошла ошибка при входе');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (name: string, phone: string, password: string) => {
    return await register({ name, phone, password });
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            setLocalPhotoUrl(null);
            setPhotoVersion(0);
            currentOperationIdRef.current = null;
            logout();
          }
        }
      ]
    );
  };

  const handleOrderHistory = () => {
    navigation.navigate('OrderHistory');
  };

  const openRegisterModal = () => {
    setRegisterModalVisible(true);
  };

  const closeRegisterModal = () => {
    setRegisterModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={[profileStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: '#666' }}>Загрузка...</Text>
      </View>
    );
  }

  if (user) {
    return (
      <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.scrollContent}>
        <View style={profileStyles.content}>
          {/* Фото профиля */}
          <TouchableOpacity
            style={profileStyles.photoContainer}
            onPress={handlePhotoPress}
            disabled={isPhotoLoading}
          >
            <View style={profileStyles.photoWrapper}>
              <View style={profileStyles.photoMainContainer}>
                <View style={profileStyles.photoWithOverlay}>
                  <Image
                    source={localPhotoUrl ? { uri: localPhotoUrl } : defaultAvatar}
                    style={profileStyles.photo}
                    key={`photo-${photoVersion}`}
                    onError={() => {
                      // При ошибке загрузки используем аватар по умолчанию
                      setLocalPhotoUrl(null);
                    }}
                  />
                  
                  {isPhotoLoading && (
                    <View style={profileStyles.photoLoadingOverlay}>
                      <ActivityIndicator size="large" color="#2E7D32" />
                      <Text style={profileStyles.photoLoadingText}>Загрузка...</Text>
                    </View>
                  )}
                </View>
                
                {!isPhotoLoading && (
                  <View style={profileStyles.editPhotoIndicator}>
                    <Text style={profileStyles.editPhotoText}>✏️</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Информация пользователя */}
          <View style={profileStyles.fieldsContainer}>
            <View style={profileStyles.userInfo}>
              <Text style={profileStyles.userName}>{user.name}</Text>
              <Text style={profileStyles.userPhone}>{formatDisplayPhone(user.phone)}</Text>
              {user.role === 'admin' && (
                <Text style={profileStyles.adminBadge}>👑 Администратор</Text>
              )}
            </View>
          </View>

          {/* Кнопка истории заказов */}
          <TouchableOpacity
            style={profileStyles.historyButton}
            onPress={handleOrderHistory}
            activeOpacity={0.7}
          >
            <Text style={profileStyles.historyButtonText}>История заказов</Text>
          </TouchableOpacity>

          {/* Кнопка выхода */}
          <TouchableOpacity
            style={profileStyles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={profileStyles.logoutButtonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.scrollContent}>
      <View style={profileStyles.content}>
        {/* Заголовок */}
        <View style={profileStyles.loginHeader}>
          <Text style={profileStyles.loginTitle}>Вход в аккаунт</Text>
          <Text style={profileStyles.loginSubtitle}>Войдите, чтобы управлять заказами</Text>
        </View>

        {/* Форма входа */}
        <View style={profileStyles.loginForm}>
          <TextInput
            style={profileStyles.input}
            value={formatDisplayPhone(phone)}
            onChangeText={handlePhoneChange}
            placeholder="+7 (XXX) XXX-XX-XX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            editable={!isLoginLoading}
          />

          <TextInput
            style={profileStyles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Пароль"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!isLoginLoading}
          />

          <TouchableOpacity
            style={[
              profileStyles.loginButton,
              isLoginLoading && profileStyles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoginLoading}
          >
            {isLoginLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={profileStyles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>

          {/* Ссылка на регистрацию */}
          <View style={profileStyles.registerLinkContainer}>
            <Text style={profileStyles.registerText}>
              Нет аккаунта?{' '}
              <Text
                style={profileStyles.registerLink}
                onPress={openRegisterModal}
              >
                Зарегистрироваться
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Модальное окно регистрации */}
      <RegisterModal
        visible={registerModalVisible}
        onClose={closeRegisterModal}
        onRegister={handleRegister}
      />
    </ScrollView>
  );
}