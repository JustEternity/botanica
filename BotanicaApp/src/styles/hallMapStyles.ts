import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const hallMapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#0a1f0a' : '#f5f5f5', // Зеленый для веба, серый для мобилки
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: Platform.OS === 'web' ? '#0a1f0a' : 'transparent', // Зеленый фон для контента на вебе
  },
  timeSelectionColumn: {
    flexDirection: 'column',
  },
  timePickerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  timePickerButton: {
    backgroundColor: Platform.OS === 'web' ? '#1a3d1a' : '#f8f9fa', // Темно-зеленый для веба
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : '#ddd', // Зеленая граница для веба
    width: '100%',
  },
  timePickerText: {
    fontSize: 15,
    color: Platform.OS === 'web' ? '#E8F5E8' : '#333', // Светлый текст для веба
    fontWeight: '500',
    textAlign: 'center',
  },
  // Контейнер для пикера
  pickerContainer: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  timeWarning: {
    fontSize: 12,
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timeRestrictionText: {
    fontSize: 12,
    color: Platform.OS === 'web' ? '#81C784' : '#666', // Светло-зеленый для веба
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  simpleMap: {
    width: 600,
    height: 500,
    position: 'relative',
  },
  table: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tableOccupied: {
    backgroundColor: '#F44336',
  },
  tableSelected: {
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: '#1976D2',
    transform: [{ scale: 1.1 }],
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 15,
    padding: 10,
    backgroundColor: Platform.OS === 'web' ? '#1a3d1a' : 'white', // Темно-зеленый для веба
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : 'transparent',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  // Добавьте в ваш файл стилей:
  // Добавьте эти стили:

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  updatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  updatingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  tableUpdating: {
    opacity: 0.6,
  },
  tableNumberUpdating: {
    opacity: 0.7,
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  timePickerTextDisabled: {
    opacity: 0.5,
  },
  controlDisabled: {
    opacity: 0.5,
  },
  updating: {
    backgroundColor: '#999',
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  occupied: {
    backgroundColor: '#F44336',
  },
  selected: {
    backgroundColor: '#2196F3',
  },
  legendText: {
    fontSize: 12,
    color: Platform.OS === 'web' ? '#E8F5E8' : '#333', // Светлый текст для веба
  },
  mapContainerAndroid: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  tableAndroid: {
    minWidth: 55,
    minHeight: 55,
  },
  tableNumberAndroid: {
    fontSize: 18,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  zoomControlsOverlay: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  zoomButtonOverlay: {
    width: 50,
    height: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  resetButtonOverlay: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#757575',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  scaleInfoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Platform.OS === 'web' ? 'rgba(26, 61, 26, 0.9)' : 'rgba(255, 255, 255, 0.9)', // Темно-зеленый для веба
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : 'transparent',
  },
  zoomButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  resetButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  scaleText: {
    fontSize: 16,
    color: Platform.OS === 'web' ? '#81C784' : '#2E7D32', // Светло-зеленый для веба
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timeSelectionPanel: {
    backgroundColor: Platform.OS === 'web' ? '#1a3d1a' : 'white', // Темно-зеленый для веба
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    position: 'relative',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : 'transparent',
  },
  timeSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Platform.OS === 'web' ? '#4CAF50' : '#2E7D32', // Зеленый для веба
    marginBottom: 12,
    textAlign: 'center',
  },
  timeSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 0,
  },
  timePickerCompact: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 12,
    color: Platform.OS === 'web' ? '#81C784' : '#666', // Светло-зеленый для веба
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  timePickerButtonCompact: {
    backgroundColor: Platform.OS === 'web' ? '#1a3d1a' : '#f8f9fa', // Темно-зеленый для веба
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : '#ddd', // Зеленая граница для веба
    width: '90%',
    minHeight: 50,
    justifyContent: 'center',
  },
  timePickerButtonActive: {
    backgroundColor: Platform.OS === 'web' ? '#2d5a2d' : '#E8F5E8', // Темнее-зеленый для веба
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  timePickerTextCompact: {
    fontSize: 16,
    color: Platform.OS === 'web' ? '#E8F5E8' : '#333', // Светлый текст для веба
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timePickerTextActive: {
    color: Platform.OS === 'web' ? '#81C784' : '#2E7D32', // Светло-зеленый для веба
  },
  dateTextCompact: {
    fontSize: 11,
    color: Platform.OS === 'web' ? '#81C784' : '#666', // Светло-зеленый для веба
    marginTop: 2,
    textAlign: 'center',
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  timeSeparatorText: {
    fontSize: 18,
    color: Platform.OS === 'web' ? '#81C784' : '#666', // Светло-зеленый для веба
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#1a3d1a' : '#f5f5f5', // Темно-зеленый для веба
    overflow: 'hidden',
    position: 'relative',
    // Размеры контейнера карты
    width: '100%',
    height: 400, // или нужная вам высота
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : 'transparent',
    borderRadius: Platform.OS === 'web' ? 12 : 0,
  },

  transformContainer: {
    // Размеры области трансформации (должны соответствовать размеру картинки)
    width: 550, // ширина вашей картинки в пикселях
    height: 420, // высота вашей картинки в пикселях
  },

  mapBackground: {
    // Картинка занимает всю область transformContainer
    width: '100%',
    height: '100%',
  },

  tablesContainer: {
    // Контейнер столов занимает всю область
    ...StyleSheet.absoluteFillObject,
  },
  pickerCloseButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  pickerCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expoPicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
  },
  timeSelectionPanelWeb: {
    backgroundColor: '#1a3d1a', // Темно-зеленый для веба
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    position: 'relative',
    alignSelf: 'center', // Центрируем панель
    width: '90%', // Ограничиваем ширину
    maxWidth: 600, // Максимальная ширина
    minWidth: 300, // Минимальная ширина
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },

  timeSelectionRowWeb: {
    flexDirection: 'row',
    justifyContent: 'center', // Центрируем содержимое
    alignItems: 'center',
    marginBottom: 0,
    width: '100%',
  },

  timePickerCompactWeb: {
    alignItems: 'center',
    flex: 1,
    minWidth: 120, // Фиксированная минимальная ширина
    maxWidth: 350,
    marginHorizontal: 8,
  },

  timePickerButtonCompactWeb: {
    backgroundColor: '#1a3d1a', // Темно-зеленый для веба
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d5a2d', // Зеленая граница
    width: '100%', // Фиксированная ширина
    minHeight: 60, // Увеличенная высота
    justifyContent: 'center',
  },

  timePickerTextCompactWeb: {
    fontSize: 16,
    color: '#E8F5E8', // Светлый текст для веба
    fontWeight: 'bold',
    textAlign: 'center',
  },

  dateTextCompactWeb: {
    fontSize: 12,
    color: '#81C784', // Светло-зеленый для веба
    marginTop: 4,
    textAlign: 'center',
  },

  timeSeparatorWeb: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },

  // Стили для веб-пикеров
  webDatePickerContainer: {
    width: '100%', // Такая же ширина как у кнопок
    position: 'relative',
    zIndex: 1000,
  },

  webDatePickerButton: {
    width: '100%', // Фиксированная ширина
    padding: 12,
    borderWidth: 2,
    borderColor: Platform.OS === 'web' ? '#2d5a2d' : '#e2e8f0', // Зеленая граница для веба
    borderRadius: 8,
    backgroundColor: Platform.OS === 'web' ? '#1a3d1a' : 'white', // Темно-зеленый для веба
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 60, // Такая же высота как у кнопок
  },

  webDatePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Platform.OS === 'web' ? '#E8F5E8' : '#1a202c', // Светлый текст для веба
    textAlign: 'center',
  },

  webDatePickerDateText: {
    fontSize: 12,
    color: Platform.OS === 'web' ? '#81C784' : '#718096', // Светло-зеленый для веба
    marginTop: 2,
    textAlign: 'center',
  },

  contentWeb: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#0a1f0a', // Зеленый фон для веба
  },

  mapWrapperWeb: {
    width: '100%',
    alignItems: 'flex-end', // Выравниваем карту по правому краю контейнера
    justifyContent: 'center',
    paddingRight: '10%', // Смещаем карту вправо на 10% от ширины экрана
  },

  mapContainerWeb: {
    flex: 1,
    backgroundColor: '#1a3d1a', // Темно-зеленый для веба
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 'auto',
    width: '100%', // Ограничиваем ширину
    maxWidth: 600, // Максимальная ширина
    height: 600, // Немного увеличиваем высоту для веба
    marginRight: 'auto', // Автоматический отступ справа
    borderWidth: 1,
    borderColor: '#2d5a2d',
    borderRadius: 12,
  },
  mapWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    marginHorizontal: 'auto',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});