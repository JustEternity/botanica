import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

// Создаем компонент хедера который можно использовать на всех экранах
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
  return (
    <ScrollView style={styles.container}>
      <WebHeader navigation={navigation} currentScreen="Home" />
      
      {/* Герой секция */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>ДОБРО ПОЖАЛОВАТЬ В BOTANICA</Text>
        <Text style={styles.heroSubtitle}>Лучшие кальяны и атмосфера в городе</Text>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('HallMap')}
        >
          <Text style={styles.ctaText}>ЗАБРОНИРОВАТЬ СТОЛИК</Text>
        </TouchableOpacity>
      </View>

      {/* Инфо секция */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>ПОЧЕМУ BOTANICA?</Text>
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🎯 ПРЕМИУМ КАЛЬЯНЫ</Text>
            <Text style={styles.featureText}>Качественные табаки и свежие фрукты</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>☕ ВКУСНЫЕ НАПИТКИ</Text>
            <Text style={styles.featureText}>Кофе, чай, авторские коктейли</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>💨 УЮТНАЯ АТМОСФЕРА</Text>
            <Text style={styles.featureText}>Идеальное место для отдыха</Text>
          </View>
        </View>
      </View>

      {/* Контакты */}
      <View style={styles.contacts}>
        <Text style={styles.sectionTitle}>КОНТАКТЫ</Text>
        <Text style={styles.contact}>📍 Адрес: ул. Центральная, 123</Text>
        <Text style={styles.contact}>📞 Телефон: +7 (999) 123-45-67</Text>
        <Text style={styles.contact}>🕒 Время работы: 12:00 - 02:00</Text>
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
    backgroundColor: '#0a1f0a',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1a3d1a',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#81C784',
    letterSpacing: 2,
    marginTop: 5,
    marginBottom: 20,
  },
  nav: {
    flexDirection: 'row',
    gap: 25,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  activeNavButton: {
    backgroundColor: '#4CAF50',
  },
  navText: {
    color: '#E8F5E8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeNavText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hero: {
    height: 400,
    backgroundColor: '#1a3d1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 40,
    backgroundColor: '#0a1f0a',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 30,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  feature: {
    alignItems: 'center',
    padding: 20,
    minWidth: 200,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#81C784',
    marginBottom: 10,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#C8E6C9',
    textAlign: 'center',
  },
  contacts: {
    padding: 40,
    backgroundColor: '#1a3d1a',
    alignItems: 'center',
  },
  contact: {
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 10,
  },
});