import { StyleSheet, Platform } from 'react-native';

// Определяем цвета для разных платформ
const colors = {
  mobile: {
    background: '#fff',
    headerBackground: '#fff',
    categoryButton: '#f5f5f5',
    categoryButtonActive: '#2E7D32',
    categoryText: '#666',
    categoryTextActive: '#fff',
    sectionHeader: '#f8f8f8',
    sectionTitle: '#2E7D32',
    menuItemContainer: '#f9f9f9',
    itemName: '#333',
    itemPrice: '#2E7D32',
    itemDescription: '#666',
  },
  web: {
    background: '#0a1f0a',
    headerBackground: '#0a1f0a',
    categoryButton: '#1a3d1a',
    categoryButtonActive: '#4CAF50',
    categoryText: '#81C784',
    categoryTextActive: '#ffffff',
    sectionHeader: '#1a3d1a',
    sectionTitle: '#4CAF50',
    menuItemContainer: '#1a3d1a',
    itemName: '#E8F5E8',
    itemPrice: '#4CAF50',
    itemDescription: '#C8E6C9',
  }
};

// Выбираем цвета в зависимости от платформы
const currentColors = Platform.OS === 'web' ? colors.web : colors.mobile;

export const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  headerContainer: {
    backgroundColor: currentColors.headerBackground,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingTop: 10,
    ...(Platform.OS === 'web' && {
      borderBottomWidth: 1,
      borderBottomColor: '#1a3d1a',
    }),
  },
  categoriesContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    height: 60,
  },
  categoriesList: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: currentColors.categoryButton,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: 'center',
    marginVertical: 5,
    minWidth: 100,
    ...(Platform.OS === 'web' && {
      borderWidth: 1,
      borderColor: '#2d5a2d',
    }),
  },
  categoryButtonActive: {
    backgroundColor: currentColors.categoryButtonActive,
    ...(Platform.OS === 'web' && {
      borderColor: '#4CAF50',
    }),
  },
  categoryText: {
    fontSize: 14,
    color: currentColors.categoryText,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: currentColors.categoryTextActive,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    backgroundColor: currentColors.background,
  },
  sectionHeader: {
    backgroundColor: currentColors.sectionHeader,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Platform.OS === 'web' ? '#4CAF50' : '#2E7D32',
    ...(Platform.OS === 'web' && {
      borderWidth: 1,
      borderColor: '#2d5a2d',
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: currentColors.sectionTitle,
  },
  menuItemContainer: {
    position: 'relative',
    marginBottom: 20,
    backgroundColor: currentColors.menuItemContainer,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    overflow: 'visible',
    ...(Platform.OS === 'web' && {
      borderWidth: 1,
      borderColor: '#2d5a2d',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  menuItem: {
    padding: Platform.OS === 'web' ? 16 : 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: currentColors.itemName,
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: currentColors.itemPrice,
    flexShrink: 0,
  },
  itemDescription: {
    fontSize: 14,
    color: currentColors.itemDescription,
    lineHeight: 20,
  },
  bottomSpace: {
    height: 20,
    backgroundColor: currentColors.background,
  },
});