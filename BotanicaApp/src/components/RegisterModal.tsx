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

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 4 символа');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onRegister(name.trim(), phone, password);
      if (success) {
        Alert.alert('Успех', 'Регистрация прошла успешно!');
        onClose();
        // Сброс полей
        setName('');
        setPhone('+7');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при регистрации');
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
                    placeholder="Пароль"
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