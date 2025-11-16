import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AboutScreen({ navigation }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryScrollRef = useRef<ScrollView>(null);
  
  const openPhone = () => {
    if (Platform.OS === 'web') {
      window.open('tel:+79128267200');
    } else {
      Linking.openURL('tel:+79128267200');
    }
  };

  const openVK = () => {
    if (Platform.OS === 'web') {
      window.open('https://vk.com/hp_botanica', '_blank');
    } else {
      Linking.openURL('https://vk.com/hp_botanica');
    }
  };

  const openMap = () => {
    const address = 'Кировская обл., г.Киров, улица Всесвятская 72, этаж 2';
    let url;
    
    if (Platform.OS === 'web') {
      url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    } else if (Platform.OS === 'ios') {
      url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    } else {
      url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  const galleryImages = [
    'https://avatars.mds.yandex.net/get-altay/7179902/2a00000183d8472e516bf9e59696257889b7/XXXL',
    'https://avatars.mds.yandex.net/get-altay/5473371/2a0000017f28a6bb99aa7591c16e83d47050/XXXL',
    'https://avatars.mds.yandex.net/get-altay/10636707/2a0000018b0615bf1b948c772946e9edd001/XXXL',
    'https://sun9-49.userapi.com/s/v1/ig2/KlnKqzmFNOmwiTp-oCX0hpzZRqEA-H2Gb4JdFT5eODQubeoG8EA0tH3IGC34Ow4CZIplOPgHzWUificIh9pOkqxp.jpg?quality=95&as=32x40,48x60,72x90,108x135,160x200,240x300,360x450,480x600,540x675,640x800,720x900,1080x1350,1280x1600,1440x1800,2048x2560&from=bu&cs=2048x0'
  ];

  const scrollToImage = (index: number) => {
    setCurrentImageIndex(index);
    const imageWidth = 400;
    const gap = 15;
    galleryScrollRef.current?.scrollTo({
      x: index * (imageWidth + gap),
      animated: true,
    });
  };

  const nextImage = () => {
    if (currentImageIndex < galleryImages.length - 1) {
      scrollToImage(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      scrollToImage(currentImageIndex - 1);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Компактная герой секция */}
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/8dcd5069556011.5b858725825ae.jpg' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>BOTANICA</Text>
          <Text style={styles.heroSubtitle}>УЮТ • КАЧЕСТВО • ОТДЫХ</Text>
        </View>
      </View>

      {/* Основной контент в одном блоке */}
      <View style={styles.contentSection}>
        
        {/* Приветствие с новым текстом */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.sectionTitle}>ПОГРУЗИТЕСЬ В АТМОСФЕРУ БОТАНИКИ</Text>
          <Text style={styles.welcomeText}>
            Botanica — это не просто кальянная, а целый мир комфорта и релакса. 
            Мы создали пространство, где каждая деталь продумана для вашего удовольствия: 
            от премиальных кальянов до авторских напитков и уютной атмосферы.
          </Text>
          <Text style={styles.welcomeSubtext}>
            Приходите к нам, чтобы отвлечься от городской суеты и провести время 
            в приятной компании под качественную музыку.
          </Text>
        </View>

        {/* Преимущества и скидки в одной строке */}
        <View style={styles.featuresRow}>
          <View style={styles.featuresBlock}>
            <Text style={styles.blockTitle}>ПОЧЕМУ ВЫБИРАЮТ НАС</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💨</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureText}>Премиум кальяны</Text>
                  <Text style={styles.featureDescription}>Только качественные табаки и свежие угли</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🍹</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureText}>Авторские напитки</Text>
                  <Text style={styles.featureDescription}>Уникальные коктейли и свежие лимонады</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎵</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureText}>Идеальный саунд</Text>
                  <Text style={styles.featureDescription}>Тщательно подобранные плейлисты</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎮</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureText}>Развлечения</Text>
                  <Text style={styles.featureDescription}>Настольные игры и игровая приставка</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.discountsBlock}>
            <Text style={styles.blockTitle}>ВЫГОДНЫЕ ПРЕДЛОЖЕНИЯ</Text>
            <View style={styles.discountsList}>
              <View style={styles.discountItem}>
                <Text style={styles.discountIcon}>🌞</Text>
                <View style={styles.discountInfo}>
                  <Text style={styles.discountTitle}>ДНЕВНАЯ СКИДКА 25%</Text>
                  <Text style={styles.discountDescription}>На весь ассортимент в будни с 11:00 до 17:00</Text>
                </View>
              </View>
              <View style={styles.discountItem}>
                <Text style={styles.discountIcon}>🎂</Text>
                <View style={styles.discountInfo}>
                  <Text style={styles.discountTitle}>СКИДКА В ДЕНЬ РОЖДЕНИЯ</Text>
                  <Text style={styles.discountDescription}>10% для именинника при предъявлении документа</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Галерея с увеличенными фотографиями */}
        <View style={styles.galleryBlock}>
          <Text style={styles.blockTitle}>ПОСМОТРИТЕ НАШУ АТМОСФЕРУ</Text>
          <View style={styles.galleryContainer}>
            <TouchableOpacity 
              style={[
                styles.galleryButton,
                currentImageIndex === 0 && styles.galleryButtonDisabled
              ]} 
              onPress={prevImage}
              disabled={currentImageIndex === 0}
            >
              <Text style={styles.galleryButtonText}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.galleryViewport}>
              <ScrollView 
                ref={galleryScrollRef}
                horizontal 
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.galleryContent}
              >
                {galleryImages.map((image, index) => (
                  <Image 
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.galleryButton,
                currentImageIndex === galleryImages.length - 1 && styles.galleryButtonDisabled
              ]} 
              onPress={nextImage}
              disabled={currentImageIndex === galleryImages.length - 1}
            >
              <Text style={styles.galleryButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          
          {/* Индикаторы */}
          <View style={styles.galleryDots}>
            {galleryImages.map((_, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.galleryDot,
                  index === currentImageIndex && styles.galleryDotActive
                ]}
                onPress={() => scrollToImage(index)}
              />
            ))}
          </View>
        </View>

        {/* Контакты и время работы в одной строке */}
        <View style={styles.infoRow}>
          <View style={styles.contactsBlock}>
            <Text style={styles.blockTitle}>КОНТАКТЫ ДЛЯ СВЯЗИ</Text>
            <TouchableOpacity style={styles.contactItem} onPress={openPhone}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactText}>+7 (912) 826-72-00</Text>
                <Text style={styles.contactHint}>Администратор ответит на все вопросы</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={openMap}>
              <Text style={styles.contactIcon}>📍</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactText}>ул. Всесвятская 72, 2 этаж</Text>
                <Text style={styles.contactHint}>Центр Кирова, удобная парковка</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={openVK}>
              <Text style={styles.contactIcon}>👥</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactText}>vk.com/hp_botanica</Text>
                <Text style={styles.contactHint}>Следите за акциями и событиями</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleBlock}>
            <Text style={styles.blockTitle}>МЫ РАБОТАЕМ ДЛЯ ВАС</Text>
            <View style={styles.scheduleList}>
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDay}>ПОНЕДЕЛЬНИК - ЧЕТВЕРГ</Text>
                <Text style={styles.scheduleTime}>11:00 - 01:00</Text>
              </View>
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDay}>ПЯТНИЦА</Text>
                <Text style={styles.scheduleTime}>11:00 - 03:00</Text>
              </View>
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDay}>СУББОТА - ВОСКРЕСЕНЬЕ</Text>
                <Text style={styles.scheduleTime}>12:00 - 03:00</Text>
              </View>
            </View>
            <Text style={styles.scheduleNote}>
              * Рекомендуем бронировать столики заранее, особенно в выходные
            </Text>
          </View>
        </View>

        {/* Кнопка бронирования - ИЗМЕНЕНИЕ ЗДЕСЬ */}
        <TouchableOpacity 
          style={styles.bookingButton} 
          onPress={() => navigation.navigate('HallMap')}
        >
          <Text style={styles.bookingButtonText}>🎯 ЗАБРОНИРОВАТЬ СТОЛИК СЕЙЧАС</Text>
        </TouchableOpacity>

      </View>

      {/* Футер как на главной странице */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>BOTANICA</Text>
        <Text style={styles.footerSubtitle}>Кафе-кальянная в Кирове</Text>
        <Text style={styles.footerCopyright}>© 2025 BOTANICA. ВСЕ ПРАВА ЗАЩИЩЕНЫ</Text>
      </View>
    </ScrollView>
  );
}

// Стили остаются без изменений...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f0a',
  },
  heroSection: {
    height: 300,
    position: 'relative',
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#81C784',
    fontWeight: '500',
    letterSpacing: 1,
  },
  contentSection: {
    padding: 20,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeBlock: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 18,
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 800,
    marginBottom: 15,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 700,
    fontStyle: 'italic',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 20,
  },
  featuresBlock: {
    flex: 1,
    backgroundColor: '#1a3d1a',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  discountsBlock: {
    flex: 1,
    backgroundColor: '#1a3d1a',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  blockTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  featuresList: {
    gap: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  featureIcon: {
    fontSize: 24,
    width: 30,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E8F5E8',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#81C784',
    lineHeight: 18,
  },
  discountsList: {
    gap: 20,
  },
  discountItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  discountIcon: {
    fontSize: 24,
    width: 30,
    marginTop: 2,
  },
  discountInfo: {
    flex: 1,
  },
  discountTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  discountDescription: {
    fontSize: 14,
    color: '#C8E6C9',
    lineHeight: 18,
  },
  galleryBlock: {
    marginBottom: 30,
  },
  galleryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  galleryButton: {
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonDisabled: {
    backgroundColor: '#2d5a2d',
    opacity: 0.5,
  },
  galleryButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  galleryViewport: {
    width: 400,
    height: 300,
    overflow: 'hidden',
    borderRadius: 12,
  },
  galleryContent: {
    flexDirection: 'row',
  },
  galleryImage: {
    width: 400,
    height: 300,
  },
  galleryDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  galleryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2d5a2d',
  },
  galleryDotActive: {
    backgroundColor: '#4CAF50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 20,
  },
  contactsBlock: {
    flex: 1,
    backgroundColor: '#1a3d1a',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  scheduleBlock: {
    flex: 1,
    backgroundColor: '#1a3d1a',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 20,
  },
  contactIcon: {
    fontSize: 20,
    width: 30,
    marginTop: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E8F5E8',
    marginBottom: 4,
  },
  contactHint: {
    fontSize: 14,
    color: '#81C784',
    lineHeight: 18,
  },
  scheduleList: {
    gap: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a2d',
  },
  scheduleDay: {
    fontSize: 15,
    color: '#C8E6C9',
    fontWeight: '500',
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  scheduleNote: {
    fontSize: 12,
    color: '#81C784',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
  bookingButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 300,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookingButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    backgroundColor: '#0a1f0a',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a3d1a',
  },
  footerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  footerSubtitle: {
    fontSize: 16,
    color: '#81C784',
    marginBottom: 10,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#81C784',
  },
});