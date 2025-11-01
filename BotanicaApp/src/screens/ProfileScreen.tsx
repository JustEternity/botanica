import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { profileStyles } from '../styles/profileStyles';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7');

  const userPhoto = {
    uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  };

  const handlePhoneChange = (text: string) => {
    // Всегда начинаем с +7
    if (!text.startsWith('+7')) {
      setPhone('+7');
      return;
    }

    // Удаляем все нецифровые символы, кроме +
    const cleaned = text.replace(/[^\d+]/g, '');

    // Ограничиваем общую длину (код страны + 10 цифр)
    if (cleaned.length > 12) { // +7 + 10 цифр
      return;
    }

    setPhone(cleaned);
  };

  const formatDisplayPhone = (phone: string) => {
    if (phone.length <= 2) return phone;

    const digits = phone.slice(2); // убираем +7

    if (digits.length <= 3) return `+7 (${digits}`;
    if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  };

  const handlePhotoPress = () => {
    Alert.alert('Смена фото', 'Функция смены фото в разработке');
  };

  const handleOrderHistory = () => {
    Alert.alert('История заказов', 'Раздел в разработке');
  };

  return (
    <ScrollView style={profileStyles.container}>


      <View style={profileStyles.content}>
        <View style={profileStyles.photoContainer}>
          <TouchableOpacity
            style={profileStyles.photoWrapper}
            onPress={handlePhotoPress}
            activeOpacity={0.7}
          >
            <Image
              source={userPhoto}
              style={profileStyles.photo}
              onError={() => console.log('Ошибка загрузки изображения')}
            />
          </TouchableOpacity>
        </View>

        <View style={profileStyles.fieldsContainer}>
          <TextInput
            style={profileStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Имя"
            placeholderTextColor="#999"
          />

          <TextInput
            style={profileStyles.input}
            value={formatDisplayPhone(phone)}
            onChangeText={handlePhoneChange}
            placeholder="+7 (XXX) XXX-XX-XX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={profileStyles.historyButton}
          onPress={handleOrderHistory}
          activeOpacity={0.7}
        >
          <Text style={profileStyles.historyButtonText}>История заказов</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}