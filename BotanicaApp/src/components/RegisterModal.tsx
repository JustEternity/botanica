import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { registerModalStyles } from '../styles/registerModalStyles';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onRegister: (name: string, phone: string, password: string) => Promise<boolean>;
}

export default function RegisterModal({ visible, onClose, onRegister }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Функция для проверки валидности номера телефона
  const isValidPhone = (phone: string): boolean => {
    // Номер должен быть в формате +7XXXXXXXXXX (12 символов)
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Универсальная функция показа alert
  const showAlert = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Ошибка', message);
    }
  };

  // Универсальная функция показа успеха
  const showSuccess = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Успех', message);
    }
  };

  const handleRegister = async () => {
    // Проверка на пустые поля
    if (!name.trim() || !phone.trim() || !password || !confirmPassword) {
      showAlert('Некорректные данные для регистрации');
      return;
    }

    // Проверка формата телефона
    if (!isValidPhone(phone)) {
      showAlert('Некорректные данные для регистрации');
      return;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      showAlert('Некорректные данные для регистрации');
      return;
    }

    // Проверка длины пароля
    if (password.length < 6) {
      showAlert('Некорректные данные для регистрации');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onRegister(name.trim(), phone, password);
      if (success) {
        showSuccess('Регистрация прошла успешно!');
        onClose();
        // Сброс полей
        setName('');
        setPhone('+7');
        setPassword('');
        setConfirmPassword('');
      }
      // Ошибка уже обработана в onRegister, ничего не делаем
    } catch (error) {
      // Ошибка уже обработана в onRegister, ничего не делаем
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={registerModalStyles.container}
      >
        <TouchableOpacity
          style={registerModalStyles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <ScrollView
            style={registerModalStyles.scrollView}
            contentContainerStyle={registerModalStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={registerModalStyles.modalContent}>
                {/* Заголовок */}
                <View style={registerModalStyles.header}>
                  <Text style={registerModalStyles.title}>Регистрация</Text>
                  <TouchableOpacity
                    style={registerModalStyles.closeButton}
                    onPress={handleClose}
                    disabled={isLoading}
                  >
                    <Text style={registerModalStyles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Форма */}
                <View style={registerModalStyles.form}>
                  <TextInput
                    style={registerModalStyles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Имя"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                  />

                  <TextInput
                    style={registerModalStyles.input}
                    value={formatDisplayPhone(phone)}
                    onChangeText={handlePhoneChange}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />

                  <TextInput
                    style={registerModalStyles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Пароль (минимум 6 символов)"
                    placeholderTextColor="#999"
                    secureTextEntry
                    editable={!isLoading}
                  />

                  <TextInput
                    style={registerModalStyles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Подтвердите пароль"
                    placeholderTextColor="#999"
                    secureTextEntry
                    editable={!isLoading}
                  />

                  <TouchableOpacity
                    style={[
                      registerModalStyles.registerButton,
                      isLoading && registerModalStyles.registerButtonDisabled
                    ]}
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    <Text style={registerModalStyles.registerButtonText}>
                      {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}