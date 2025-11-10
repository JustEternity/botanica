import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  photoLoadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 60,
},
photoLoadingText: {
  marginTop: 8,
  fontSize: 12,
  color: '#2E7D32',
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
  
  // Добавляем новые стили для загрузки фото
  photoLoadingContainer: {
    width: 190,
    height: 190,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 4,
    borderColor: '#2E7D32',
  },
  photoMainContainer: {
    position: 'relative',
  },
  photoWithOverlay: {
    position: 'relative',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    borderRadius: 100,
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
    width: '100%', // Добавляем полную ширину
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center', // Добавляем выравнивание по центру
    width: '100%', // Занимает всю ширину
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center', // Добавляем выравнивание по центру
    width: '100%', // Занимает всю ширину
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
    width: '100%',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    width: '100%',
  },
  registerLink: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  editPhotoIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#2E7D32',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  editPhotoText: {
    fontSize: 14,
    color: 'white',
  },

  // Стили для информации пользователя
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%', // Добавляем полную ширину
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center', // Выравнивание по центру
    width: '100%', // Занимает всю ширину
  },
  userPhone: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center', // Выравнивание по центру
    width: '100%', // Занимает всю ширину
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
    textAlign: 'center', // Выравнивание по центру
  },
  // Добавьте эти стили в profileStyles


});