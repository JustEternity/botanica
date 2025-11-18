import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

export function WebHeader({ navigation, currentScreen }: { navigation: any, currentScreen: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>BOTANICA</Text>
        <Text style={styles.subtitle}>КАФЕ • КАЛЬЯННАЯ</Text>

        <View style={styles.nav}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'Home' && styles.activeNavButton
            ]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[
              styles.navText,
              currentScreen === 'Home' && styles.activeNavText
            ]}>ГЛАВНАЯ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'Menu' && styles.activeNavButton
            ]}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={[
              styles.navText,
              currentScreen === 'Menu' && styles.activeNavText
            ]}>МЕНЮ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'HallMap' && styles.activeNavButton
            ]}
            onPress={() => navigation.navigate('HallMap')}
          >
            <Text style={[
              styles.navText,
              currentScreen === 'HallMap' && styles.activeNavText
            ]}>БРОНЬ СТОЛИКА</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'Profile' && styles.activeNavButton
            ]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={[
              styles.navText,
              currentScreen === 'Profile' && styles.activeNavText
            ]}>ПРОФИЛЬ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'About' && styles.activeNavButton
            ]}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={[
              styles.navText,
              currentScreen === 'About' && styles.activeNavText
            ]}>О НАС</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function WebHomeScreen({ navigation }: any) {
  const openPhone = () => {
    Linking.openURL('tel:+79128267200');
  };

  const openVK = () => {
    Linking.openURL('https://vk.com/hp_botanica');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <WebHeader navigation={navigation} currentScreen="Home" />

      {/* Герой секция - компактная но с крупным текстом */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>BOTANICA</Text>
          <Text style={styles.heroSubtitle}>КАЛЬЯННАЯ В КИРОВЕ</Text>
          <Text style={styles.heroDescription}>
            Уютная кальянная в самом сердце Кирова, где современный комфорт
            встречается с атмосферой расслабления и качественного отдыха
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.ctaText}>СМОТРЕТЬ МЕНЮ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Преимущества - компактно с крупным текстом */}
      <View style={styles.featuresSection}>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💨</Text>
            <Text style={styles.featureTitle}>ЭЛИТНЫЕ КАЛЬЯНЫ</Text>
            <Text style={styles.featureDescription}>
              Широкий выбор табаков и вкусов
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🍹</Text>
            <Text style={styles.featureTitle}>НАПИТКИ</Text>
            <Text style={styles.featureDescription}>
              Освежающие коктейли и чаи
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎵</Text>
            <Text style={styles.featureTitle}>МУЗЫКА</Text>
            <Text style={styles.featureDescription}>
              Приятная атмосферная музыка
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎮</Text>
            <Text style={styles.featureTitle}>РАЗВЛЕЧЕНИЯ</Text>
            <Text style={styles.featureDescription}>
              Настольные игры и приставка
            </Text>
          </View>
        </View>
      </View>

      {/* Скидки - компактно с крупным текстом */}
      <View style={styles.discountsSection}>
        <Text style={styles.sectionTitle}>🎁 НАШИ СКИДКИ</Text>
        <View style={styles.discountsGrid}>
          <View style={styles.discountCard}>
            <Text style={styles.discountIcon}>🌞</Text>
            <Text style={styles.discountTitle}>ДНЕВНАЯ СКИДКА 25%</Text>
            <Text style={styles.discountDescription}>
              На бар и кальян в будни с 11:00 до 17:00
            </Text>
          </View>

          <View style={styles.discountCard}>
            <Text style={styles.discountIcon}>🎂</Text>
            <Text style={styles.discountTitle}>СКИДКА В ДЕНЬ РОЖДЕНИЯ 10%</Text>
            <Text style={styles.discountDescription}>
              При предъявлении документа
            </Text>
          </View>
        </View>
      </View>

      {/* Меню превью - компактно с крупным текстом */}
      <View style={styles.menuPreviewSection}>
        <Text style={styles.sectionTitle}>НАШЕ МЕНЮ</Text>
        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuCategory}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.menuCategoryIcon}>💨</Text>
            <Text style={styles.menuCategoryTitle}>КАЛЬЯНЫ</Text>
            <Text style={styles.menuCategoryPrice}>от 1300₽</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCategory}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.menuCategoryIcon}>☕</Text>
            <Text style={styles.menuCategoryTitle}>КОФЕ</Text>
            <Text style={styles.menuCategoryPrice}>от 160₽</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCategory}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.menuCategoryIcon}>🍵</Text>
            <Text style={styles.menuCategoryTitle}>ЧАИ</Text>
            <Text style={styles.menuCategoryPrice}>от 350₽</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCategory}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.menuCategoryIcon}>🍸</Text>
            <Text style={styles.menuCategoryTitle}>КОКТЕЙЛИ</Text>
            <Text style={styles.menuCategoryPrice}>от 400₽</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Бронь столика - компактно с крупным текстом */}
      <View style={styles.bookingSection}>
        <View style={styles.bookingContent}>
          <Text style={styles.bookingTitle}>ГОТОВЫ К ОТДЫХУ?</Text>
          <Text style={styles.bookingSubtitle}>
            Забронируйте столик онлайн и обеспечьте себе комфортный вечер
          </Text>
          <TouchableOpacity
            style={styles.bookingButton}
            onPress={() => navigation.navigate('HallMap')}
          >
            <Text style={styles.bookingButtonText}>ЗАБРОНИРОВАТЬ СТОЛИК</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Контакты - компактно с крупным текстом */}
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>КОНТАКТЫ</Text>
        <View style={styles.contactsGrid}>
          <TouchableOpacity style={styles.contactItem} onPress={openPhone}>
            <Text style={styles.contactIcon}>📞</Text>
            <View>
              <Text style={styles.contactTitle}>ТЕЛЕФОН</Text>
              <Text style={styles.contactText}>+7 (912) 826-72-00</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <View>
              <Text style={styles.contactTitle}>АДРЕС</Text>
              <Text style={styles.contactText}>г. Киров, ул. Всесвятская 72, 2 этаж</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>🕒</Text>
            <View>
              <Text style={styles.contactTitle}>ВРЕМЯ РАБОТЫ</Text>
              <Text style={styles.contactText}>Пн-Чт: 11:00-01:00</Text>
              <Text style={styles.contactText}>Пт-Вс: до 03:00</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.contactItem} onPress={openVK}>
            <Text style={styles.contactIcon}>👥</Text>
            <View>
              <Text style={styles.contactTitle}>VKONTAKTE</Text>
              <Text style={styles.contactText}>vk.com/hp_botanica</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Футер */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>BOTANICA</Text>
        <Text style={styles.footerSubtitle}>Кафе-кальянная в Кирове</Text>
        <Text style={styles.footerCopyright}>© 2025 BOTANICA. ВСЕ ПРАВА ЗАЩИЩЕНЫ</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f0a',
  },
  header: {
    backgroundColor: 'rgba(10, 31, 10, 0.95)',
    paddingVertical: 10, // Минимальные отступы
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a3d1a',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16, // Крупный текст
    color: '#81C784',
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 10, // Минимальный отступ
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8, // Минимальное расстояние между кнопками
    maxWidth: '100%',
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(26, 61, 26, 0.8)',
  },
  activeNavButton: {
    backgroundColor: '#4CAF50',
  },
  navText: {
    color: '#E8F5E8',
    fontSize: 14, // Крупный текст
    fontWeight: '600',
  },
  activeNavText: {
    color: 'white',
    fontWeight: 'bold',
  },
  heroSection: {
    height: 400, // Нормальная высота
    backgroundColor: '#1a3d1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 60, // Очень крупный текст
    fontWeight: 'bold',
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 22, // Крупный текст
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 18, // Крупный текст
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 8,
  },
  ctaText: {
    color: 'white',
    fontSize: 18, // Крупный текст
    fontWeight: 'bold',
  },
  featuresSection: {
    paddingVertical: 40, // Минимальные отступы между секциями
    paddingHorizontal: 20,
    backgroundColor: '#0a1f0a',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15, // Минимальное расстояние между карточками
  },
  featureCard: {
    backgroundColor: '#1a3d1a',
    padding: 20, // Нормальные внутренние отступы
    borderRadius: 10,
    alignItems: 'center',
    width: 200, // Нормальная ширина
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  featureIcon: {
    fontSize: 40, // Крупные иконки
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14, // Крупный текст
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 18,
  },
  discountsSection: {
    paddingVertical: 40, // Минимальные отступы
    paddingHorizontal: 20,
    backgroundColor: '#1a3d1a',
  },
  sectionTitle: {
    fontSize: 32, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 25,
  },
  discountsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20, // Минимальное расстояние
  },
  discountCard: {
    backgroundColor: '#0a1f0a',
    padding: 25, // Нормальные внутренние отступы
    borderRadius: 10,
    alignItems: 'center',
    width: 280, // Нормальная ширина
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  discountIcon: {
    fontSize: 42, // Крупные иконки
    marginBottom: 12,
  },
  discountTitle: {
    fontSize: 18, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  discountDescription: {
    fontSize: 15, // Крупный текст
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 20,
  },
  menuPreviewSection: {
    paddingVertical: 40, // Минимальные отступы
    paddingHorizontal: 20,
    backgroundColor: '#0a1f0a',
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15, // Минимальное расстояние
  },
  menuCategory: {
    backgroundColor: '#1a3d1a',
    padding: 20, // Нормальные внутренние отступы
    borderRadius: 10,
    alignItems: 'center',
    width: 150, // Нормальная ширина
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  menuCategoryIcon: {
    fontSize: 32, // Крупные иконки
    marginBottom: 10,
  },
  menuCategoryTitle: {
    fontSize: 16, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  menuCategoryPrice: {
    fontSize: 14, // Крупный текст
    color: '#81C784',
  },
  bookingSection: {
    paddingVertical: 50, // Минимальные отступы
    paddingHorizontal: 20,
    backgroundColor: '#1a3d1a',
    alignItems: 'center',
  },
  bookingContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  bookingTitle: {
    fontSize: 36, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'center',
  },
  bookingSubtitle: {
    fontSize: 18, // Крупный текст
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  bookingButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 8,
  },
  bookingButtonText: {
    color: 'white',
    fontSize: 18, // Крупный текст
    fontWeight: 'bold',
  },
  contactsSection: {
    paddingVertical: 40, // Минимальные отступы
    paddingHorizontal: 20,
    backgroundColor: '#0a1f0a',
  },
  contactsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20, // Минимальное расстояние
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 220, // Нормальная ширина
    padding: 15, // Нормальные внутренние отступы
    backgroundColor: '#1a3d1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  contactIcon: {
    fontSize: 28, // Крупные иконки
  },
  contactTitle: {
    fontSize: 14, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 15, // Крупный текст
    color: '#E8F5E8',
  },
  footer: {
    backgroundColor: '#0a1f0a',
    paddingVertical: 25, // Минимальные отступы
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a3d1a',
  },
  footerTitle: {
    fontSize: 28, // Крупный текст
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  footerSubtitle: {
    fontSize: 16, // Крупный текст
    color: '#81C784',
    marginBottom: 10,
  },
  footerCopyright: {
    fontSize: 14, // Крупный текст
    color: '#81C784',
  },
});