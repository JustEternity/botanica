import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import RegisterModal from '../components/RegisterModal';

const defaultAvatar = require('../../assets/default-avatar.jpg');

interface WebProfileScreenProps {
  navigation: any;
}

export default function WebProfileScreen({ navigation }: WebProfileScreenProps) {
  const { user, login, register, logout, isLoading } = useAuth();
  const [phone, setPhone] = useState('+7');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

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
      window.alert('Ошибка: Заполните все поля');
      return;
    }

    if (phone.length < 12) {
      window.alert('Ошибка: Введите корректный номер телефона');
      return;
    }

    setIsLoginLoading(true);
    try {
      const success = await login({ phone, password });
      if (!success) {
        window.alert('Ошибка входа: Неверный номер телефона или пароль. Проверьте правильность введенных данных или зарегистрируйтесь.');
      }
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      
      let errorMessage = 'Произошла ошибка при входе';
      
      if (error.message?.includes('401') || error.message?.includes('неверный')) {
        errorMessage = 'Неверный номер телефона или пароль';
      } else if (error.message?.includes('404') || error.message?.includes('не найден')) {
        errorMessage = 'Аккаунт с таким номером телефона не найден. Зарегистрируйтесь.';
      } else if (error.message?.includes('сеть') || error.message?.includes('network')) {
        errorMessage = 'Проблемы с подключением к интернету';
      }
      
      window.alert(`Ошибка входа: ${errorMessage}`);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (name: string, phone: string, password: string) => {
    return await register({ name, phone, password });
  };

  const handleLogout = () => {
    console.log('Выход из аккаунта');
    logout();
    navigation.navigate('Home');
  };

  const handleOrderHistory = () => {
    navigation.navigate('OrderHistory');
  };

  const handlePhotoPress = () => {
    window.alert('Фото профиля: В веб-версии функция изменения фото будет добавлена позже');
  };

  const openRegisterModal = () => {
    setRegisterModalVisible(true);
  };

  const closeRegisterModal = () => {
    setRegisterModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.authSection, styles.centered]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {user ? (
          <View style={styles.authSection}>
            <View style={styles.profileContainer}>
              <Text style={styles.authTitle}>Мой профиль</Text>
              
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={handlePhotoPress}
                disabled={isPhotoLoading}
              >
                <View style={styles.photoWrapper}>
                  <View style={styles.photoMainContainer}>
                    <View style={styles.photoWithOverlay}>
                      <Image
                        source={user.cloudinary_url ? { uri: user.cloudinary_url } : defaultAvatar}
                        style={styles.photo}
                        onError={() => {
                          console.log('Ошибка загрузки фото');
                        }}
                      />
                      
                      {isPhotoLoading && (
                        <View style={styles.photoLoadingOverlay}>
                          <ActivityIndicator size="large" color="#2E7D32" />
                          <Text style={styles.photoLoadingText}>Загрузка...</Text>
                        </View>
                      )}
                    </View>
                    
                    {!isPhotoLoading && (
                      <View style={styles.editPhotoIndicator}>
                        <Text style={styles.editPhotoText}>✏️</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userPhone}>{formatDisplayPhone(user.phone)}</Text>
                {user.role === 'admin' && (
                  <Text style={styles.adminBadge}>👑 Администратор</Text>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={handleOrderHistory}
                  activeOpacity={0.7}
                >
                  <Text style={styles.historyButtonText}>История заказов</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.authSection}>
            <View style={styles.authContainer}>
              <Text style={styles.authTitle}>Вход в аккаунт</Text>
              <Text style={styles.authSubtitle}>
                Войдите, чтобы управлять заказами
              </Text>
              
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Телефон</Text>
                  <TextInput
                    style={styles.input}
                    value={formatDisplayPhone(phone)}
                    onChangeText={handlePhoneChange}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    placeholderTextColor="#81C784"
                    keyboardType="phone-pad"
                    editable={!isLoginLoading}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Пароль</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Введите ваш пароль"
                    placeholderTextColor="#81C784"
                    secureTextEntry
                    editable={!isLoginLoading}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.loginButton,
                    isLoginLoading && styles.loginButtonDisabled
                  ]} 
                  onPress={handleLogin}
                  disabled={isLoginLoading}
                  activeOpacity={0.7}
                >
                  {isLoginLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Войти</Text>
                  )}
                </TouchableOpacity>
                
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Нет аккаунта? </Text>
                  <TouchableOpacity onPress={openRegisterModal} activeOpacity={0.7}>
                    <Text style={styles.registerLink}>Зарегистрироваться</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.helpTextContainer}>
                  <Text style={styles.helpText}>
                    Если забыли пароль или не можете войти, обратитесь к администратору
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>BOTANICA</Text>
          <Text style={styles.footerSubtitle}>Кафе-кальянная в Кирове</Text>
          <Text style={styles.footerCopyright}>© 2025 BOTANICA. ВСЕ ПРАВА ЗАЩИЩЕНЫ</Text>
        </View>
      </ScrollView>

      <RegisterModal
        visible={registerModalVisible}
        onClose={closeRegisterModal}
        onRegister={handleRegister}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  authSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#0a1f0a',
    minHeight: 500,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    backgroundColor: '#1a3d1a',
    padding: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2d5a2d',
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: '#1a3d1a',
    padding: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2d5a2d',
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    marginVertical: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoWrapper: {
    alignItems: 'center',
  },
  photoMainContainer: {
    position: 'relative',
  },
  photoWithOverlay: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  photoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLoadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
  },
  editPhotoIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoText: {
    fontSize: 16,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 18,
    color: '#C8E6C9',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8F5E8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0a1f0a',
    borderWidth: 1,
    borderColor: '#2d5a2d',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    color: '#E8F5E8',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#C8E6C9',
    fontSize: 16,
  },
  registerLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  helpTextContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  helpText: {
    color: '#81C784',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 18,
    color: '#C8E6C9',
    marginBottom: 12,
    textAlign: 'center',
  },
  adminBadge: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
  },
  historyButton: {
    backgroundColor: '#2d5a2d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 15,
  },
  historyButtonText: {
    color: '#E8F5E8',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#0a1f0a',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a3d1a',
  },
  footerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  footerSubtitle: {
    fontSize: 16,
    color: '#81C784',
    marginBottom: 10,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#81C784',
  },
  loadingText: {
    marginTop: 16,
    color: '#C8E6C9',
    fontSize: 18,
  },
});