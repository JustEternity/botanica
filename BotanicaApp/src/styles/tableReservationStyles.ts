import { StyleSheet } from 'react-native';

export const tableReservationStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  tableInfoSection: {
    marginBottom: 25,
  },
  tableNumberLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tableDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  tableSpecs: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  optionSection: {
    marginBottom: 25,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  timePickerButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 5,
  },
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  counterButtonDisabled: {
    color: '#ccc',
  },
  counterDisplay: {
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  counterLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  durationSection: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  addToOrderButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addToOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
    // Добавьте эти стили
  timeInfoSection: {
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  timeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  timeDetails: {
    // ...
  },
  timeDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  durationText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 5,
  },
  timeRestrictionNote: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
    timeRestrictionText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
  },
});