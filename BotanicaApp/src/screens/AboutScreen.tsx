import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { aboutStyles } from '../styles/aboutStyles';

export default function AboutScreen() {
  // Функции для открытия ссылок
  const openPhone = () => {
    Linking.openURL('tel:+79128267200');
  };

  const openVK = () => {
    Linking.openURL('https://vk.com/hp_botanica');
  };

  const openMap = () => {
    const address = 'Кировская обл., г.Киров, улица Всесвятская 72, этаж 2';
    const url = Platform.OS === 'ios' 
      ? `http://maps.apple.com/?q=${encodeURIComponent(address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    
    Linking.openURL(url);
  };

  return (
    <ScrollView style={aboutStyles.container} showsVerticalScrollIndicator={false}>
      {/* Основное изображение */}
      <View style={aboutStyles.imageContainer}>
        <Image 
          source={{ uri: 'https://avatars.mds.yandex.net/get-altay/13299246/2a0000018e60570e0f370fa0382d858dc5a3/XXXL' }}
          style={aboutStyles.mainImage}
          resizeMode="cover"
        />
      </View>

      {/* Приветственный текст */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>Добро пожаловать в Botanica!</Text>
        <Text style={aboutStyles.sectionText}>
          Уютная кальянная в самом сердце Кирова, где современный комфорт 
          встречается с атмосферой расслабления и качественного отдыха.
        </Text>
      </View>

      {/* Секция скидок */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>🎁 Наши скидки</Text>
        
        {/* Дневная скидка */}
        <View style={aboutStyles.discountItem}>
          <View style={aboutStyles.discountIcon}>
            <Text style={aboutStyles.icon}>🌞</Text>
          </View>
          <View style={aboutStyles.discountInfo}>
            <Text style={aboutStyles.discountTitle}>Дневная скидка 25% на бар и кальян</Text>
            <Text style={aboutStyles.discountDescription}>
              В будни, с 11:00 до 17:00
            </Text>
          </View>
        </View>

        {/* Скидка в день рождения */}
        <View style={aboutStyles.discountItem}>
          <View style={aboutStyles.discountIcon}>
            <Text style={aboutStyles.icon}>🎂</Text>
          </View>
          <View style={aboutStyles.discountInfo}>
            <Text style={aboutStyles.discountTitle}>Скидка в день рождения 10%</Text>
            <Text style={aboutStyles.discountNote}>
              *Скидка дня рождения применяется только при предъявлении документа, удостоверяющего личность
            </Text>
          </View>
        </View>
      </View>

      {/* Контактная информация */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>📞 Контакты</Text>
        
        {/* Телефон */}
        <TouchableOpacity style={aboutStyles.contactItem} onPress={openPhone}>
          <View style={aboutStyles.contactIcon}>
            <Text style={aboutStyles.icon}>📞</Text>
          </View>
          <View style={aboutStyles.contactInfo}>
            <Text style={aboutStyles.contactLabel}>Телефон администратора</Text>
            <Text style={aboutStyles.contactValue}>+7 (912) 826-72-00</Text>
            <Text style={aboutStyles.contactHint}>Нажмите для звонка</Text>
          </View>
        </TouchableOpacity>

        {/* Адрес */}
        <TouchableOpacity style={aboutStyles.contactItem} onPress={openMap}>
          <View style={aboutStyles.contactIcon}>
            <Text style={aboutStyles.icon}>📍</Text>
          </View>
          <View style={aboutStyles.contactInfo}>
            <Text style={aboutStyles.contactLabel}>Наш адрес</Text>
            <Text style={aboutStyles.contactValue}>
              г. Киров, ул. Всесвятская 72, 2 этаж
            </Text>
            <Text style={aboutStyles.contactHint}>Нажмите для открытия карты</Text>
          </View>
        </TouchableOpacity>

        {/* Социальные сети */}
        <TouchableOpacity style={aboutStyles.contactItem} onPress={openVK}>
          <View style={aboutStyles.contactIcon}>
            <Text style={aboutStyles.icon}>👥</Text>
          </View>
          <View style={aboutStyles.contactInfo}>
            <Text style={aboutStyles.contactLabel}>Мы ВКонтакте</Text>
            <Text style={aboutStyles.contactValue}>vk.com/hp_botanica</Text>
            <Text style={aboutStyles.contactHint}>Нажмите для перехода</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Галерея изображений */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>🍃 Наша атмосфера</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aboutStyles.gallery}>
          <Image 
            source={{ uri: 'https://avatars.mds.yandex.net/get-altay/7179902/2a00000183d8472e516bf9e59696257889b7/XXXL' }}
            style={aboutStyles.galleryImage}
          />
          <Image 
            source={{ uri: 'https://avatars.mds.yandex.net/get-altay/5473371/2a0000017f28a6bb99aa7591c16e83d47050/XXXL' }}
            style={aboutStyles.galleryImage}
          />
          <Image 
            source={{ uri: 'https://avatars.mds.yandex.net/get-altay/10636707/2a0000018b0615bf1b948c772946e9edd001/XXXL' }}
            style={aboutStyles.galleryImage}
          />
          <Image 
            source={{ uri: 'https://sun9-49.userapi.com/s/v1/ig2/KlnKqzmFNOmwiTp-oCX0hpzZRqEA-H2Gb4JdFT5eODQubeoG8EA0tH3IGC34Ow4CZIplOPgHzWUificIh9pOkqxp.jpg?quality=95&as=32x40,48x60,72x90,108x135,160x200,240x300,360x450,480x600,540x675,640x800,720x900,1080x1350,1280x1600,1440x1800,2048x2560&from=bu&cs=2048x0' }}
            style={aboutStyles.galleryImage}
          />
        </ScrollView>
      </View>

      {/* Услуги */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>✨ Наши услуги</Text>
        
        <View style={aboutStyles.servicesGrid}>
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>💨</Text>
            <Text style={aboutStyles.serviceTitle}>Кальяны</Text>
            <Text style={aboutStyles.serviceDescription}>
              Широкий выбор табаков и вкусов
            </Text>
          </View>
          
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>🍹</Text>
            <Text style={aboutStyles.serviceTitle}>Напитки</Text>
            <Text style={aboutStyles.serviceDescription}>
              Освежающие коктейли и чаи
            </Text>
          </View>
          
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>🎵</Text>
            <Text style={aboutStyles.serviceTitle}>Музыка</Text>
            <Text style={aboutStyles.serviceDescription}>
              Приятная атмосферная музыка
            </Text>
          </View>
          
          <View style={aboutStyles.serviceItem}>
            <Text style={aboutStyles.serviceIcon}>🎮</Text>
            <Text style={aboutStyles.serviceTitle}>Развлечения</Text>
            <Text style={aboutStyles.serviceDescription}>
              Настольные игры и приставка
            </Text>
          </View>
        </View>
      </View>

      {/* Время работы */}
      <View style={aboutStyles.section}>
        <Text style={aboutStyles.sectionTitle}>🕒 Время работы</Text>
        <View style={aboutStyles.schedule}>
          <View style={aboutStyles.scheduleItem}>
            <Text style={aboutStyles.scheduleDay}>Пн - Чт</Text>
            <Text style={aboutStyles.scheduleTime}>11:00 - 01:00</Text>
          </View>
          <View style={aboutStyles.scheduleItem}>
            <Text style={aboutStyles.scheduleDay}>Пятница</Text>
            <Text style={aboutStyles.scheduleTime}>11:00 - 03:00</Text>
          </View>
          <View style={aboutStyles.scheduleItem}>
            <Text style={aboutStyles.scheduleDay}>Сб - Вс</Text>
            <Text style={aboutStyles.scheduleTime}>12:00 - 03:00</Text>
          </View>
        </View>
      </View>

      {/* Призыв к действию */}
      <View style={aboutStyles.ctaSection}>
        <Text style={aboutStyles.ctaTitle}>Ждём в гости! 🍃</Text>
        <Text style={aboutStyles.ctaText}>
          Бронируйте столики заранее по телефону или через администратора
        </Text>
        
        <TouchableOpacity style={aboutStyles.ctaButton} onPress={openPhone}>
          <Text style={aboutStyles.ctaButtonText}>📞 Забронировать стол</Text>
        </TouchableOpacity>
      </View>

      {/* Отступ внизу */}
      <View style={aboutStyles.bottomSpace} />
    </ScrollView>
  );
}