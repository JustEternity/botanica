import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const hallMapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timeSelectionColumn: {
    flexDirection: 'column',
  },
  timePickerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  timePickerButton: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  timePickerText: {
    fontSize: 15,
    color: '#333',
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
    color: '#666',
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
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    color: '#333',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
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
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timeSelectionPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
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
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  timePickerButtonCompact: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    width: '90%',
    minHeight: 50,
    justifyContent: 'center',
  },
  timePickerButtonActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  timePickerTextCompact: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timePickerTextActive: {
    color: '#2E7D32',
  },
  dateTextCompact: {
    fontSize: 11,
    color: '#666',
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
    color: '#666',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    position: 'relative',
    // Размеры контейнера карты
    width: '100%',
    height: 400, // или нужная вам высота
  },

  transformContainer: {
    // Размеры области трансформации (должны соответствовать размеру картинки)
    width: 550, // ширина вашей картинки в пикселях
    height: 250, // высота вашей картинки в пикселях
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
});