import React, { useState } from 'react';
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
import { profileStyles } from '../styles/profileStyles';
import { useAuth } from '../contexts/AuthContext';
import RegisterModal from '../components/RegisterModal';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, login, register, logout, isLoading } = useAuth();
  const [phone, setPhone] = useState('+7');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

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
          onPress: logout
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

  // Пока загружаем данные
  if (isLoading) {
    return (
      <View style={[profileStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: '#666' }}>Загрузка...</Text>
      </View>
    );
  }

  // Если пользователь авторизован
  if (user) {
    return (
      <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.scrollContent}>
        <View style={profileStyles.content}>
          {/* Фото профиля */}
          <View style={profileStyles.photoContainer}>
            <View style={profileStyles.photoWrapper}>
              <Image
                source={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
                style={profileStyles.photo}
                onError={() => console.log('Ошибка загрузки изображения')}
              />
            </View>
          </View>

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

  // Если пользователь не авторизован - форма входа
  return (
    <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.scrollContent}>
      <View style={profileStyles.content}>
        {/* Заголовок */}
        <View style={profileStyles.loginHeader}>
          <Text style={profileStyles.loginTitle}>Вход</Text>
          <Text style={profileStyles.loginSubtitle}>Войдите в свой аккаунт</Text>
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