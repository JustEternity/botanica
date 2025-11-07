import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 25,
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: '#e0e0e0',
    borderWidth: 4,
    borderColor: '#2E7D32',
  },
  fieldsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Стили для формы входа
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  loginForm: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLinkContainer: {
    marginTop: 25,
    alignItems: 'center',
    width: '100%', // Добавляем полную ширину
  },
  registerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center', // Центрируем текст
    width: '100%', // Занимает всю ширину контейнера
  },
  registerLink: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // Стили для информации пользователя
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
  },
  adminBadge: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
});