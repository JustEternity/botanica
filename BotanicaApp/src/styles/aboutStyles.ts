import { StyleSheet, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const aboutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Новый контейнер для центрирования на вебе
  contentContainer: {
    flex: 1,
    maxWidth: isWeb ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },

  header: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  
  imageContainer: {
    padding: isWeb ? 40 : 20,
    paddingBottom: 0,
  },
  mainImage: {
    width: '100%',
    height: isWeb ? 400 : 200,
    borderRadius: 15,
    backgroundColor: '#E8F5E8',
  },
  
  section: {
    backgroundColor: '#fff',
    margin: isWeb ? 20 : 16,
    padding: isWeb ? 30 : 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    // Веб-специфичные стили
    ...(isWeb && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }),
  },
  
  sectionTitle: {
    fontSize: isWeb ? 28 : 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  
  sectionText: {
    fontSize: isWeb ? 18 : 16,
    lineHeight: isWeb ? 28 : 22,
    color: '#555',
  },

  // Контактные элементы - адаптивные
  contactItem: {
    flexDirection: isWeb ? 'row' : 'row',
    alignItems: isWeb ? 'center' : 'flex-start',
    paddingVertical: isWeb ? 16 : 12,
    paddingHorizontal: isWeb ? 0 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  contactIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  icon: {
    fontSize: 18,
  },
  
  contactInfo: {
    flex: 1,
  },
  
  contactLabel: {
    fontSize: isWeb ? 16 : 14,
    color: '#888',
    marginBottom: 2,
  },
  
  contactValue: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  contactHint: {
    fontSize: isWeb ? 14 : 12,
    color: '#2E7D32',
    fontStyle: 'italic',
  },

  // Галерея
  gallery: {
    marginHorizontal: -5,
    height: isWeb ? 300 : 200,
  },
  
  galleryImage: {
    width: isWeb ? 400 : 280,
    height: isWeb ? 250 : 180,
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: '#E8F5E8',
  },

  // Услуги - адаптивная сетка
  servicesGrid: {
    flexDirection: isWeb ? 'row' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  
  serviceItem: {
    width: isWeb ? '23%' : '48%',
    backgroundColor: '#f8f9fa',
    padding: isWeb ? 20 : 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: isWeb ? 0 : 10,
    marginHorizontal: isWeb ? 1 : 0,
  },
  
  serviceIcon: {
    fontSize: isWeb ? 32 : 24,
    marginBottom: 8,
  },
  
  serviceTitle: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  serviceDescription: {
    fontSize: isWeb ? 14 : 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: isWeb ? 20 : 16,
  },

  // Расписание - адаптивное
  schedule: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: isWeb ? 20 : 15,
  },
  
  scheduleItem: {
    flexDirection: isWeb ? 'row' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isWeb ? 12 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  scheduleDay: {
    fontSize: isWeb ? 18 : 16,
    color: '#333',
    fontWeight: '500',
  },
  
  scheduleTime: {
    fontSize: isWeb ? 18 : 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },

  // CTA секция
  ctaSection: {
    backgroundColor: '#2E7D32',
    margin: isWeb ? 20 : 16,
    padding: isWeb ? 40 : 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  
  ctaTitle: {
    fontSize: isWeb ? 32 : 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  ctaText: {
    fontSize: isWeb ? 18 : 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: isWeb ? 28 : 22,
  },
  
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: isWeb ? 40 : 30,
    paddingVertical: isWeb ? 18 : 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    // Веб-специфичные стили
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#f0f0f0',
        transform: [{ scale: 1.05 }],
      },
    }),
  },
  
  ctaButtonText: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  bottomSpace: {
    height: isWeb ? 60 : 30,
  },

  // Скидки - адаптивные
  discountItem: {
    flexDirection: isWeb ? 'row' : 'row',
    alignItems: isWeb ? 'center' : 'flex-start',
    paddingVertical: isWeb ? 16 : 12,
    paddingHorizontal: isWeb ? 0 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  discountIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  discountInfo: {
    flex: 1,
  },
  
  discountTitle: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  
  discountDescription: {
    fontSize: isWeb ? 16 : 14,
    color: '#555',
    lineHeight: isWeb ? 24 : 20,
  },
  
  discountNote: {
    fontSize: isWeb ? 14 : 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: isWeb ? 20 : 16,
    marginTop: 4,
  },
});