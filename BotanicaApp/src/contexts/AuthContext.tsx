import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthCredentials, RegisterData } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await ApiService.getCurrentUser();
      const token = await ApiService.getAuthToken();

      if (currentUser && token) {
        try {
          // Получаем актуальные данные профиля с сервера
          const profile = await ApiService.getProfile();
          console.log('🔄 checkAuth: получен профиль с cloudinary_url:', profile.cloudinary_url);
          setUser(profile); // profile уже является User
        } catch (error) {
          console.error('Ошибка загрузки профиля:', error);
          await ApiService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const loginResponse = await ApiService.login(credentials);
      
      // После успешного логина загружаем полный профиль с фото
      const profile = await ApiService.getProfile();
      console.log('🔄 login: получен профиль с cloudinary_url:', profile.cloudinary_url);
      
      setUser(profile); // profile уже является User
      return true;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const registerResponse = await ApiService.register(data);
      
      // После успешной регистрации загружаем полный профиль с фото
      const profile = await ApiService.getProfile();
      console.log('🔄 register: получен профиль с cloudinary_url:', profile.cloudinary_url);
      
      setUser(profile); // profile уже является User
      return true;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await ApiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};