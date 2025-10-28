import { MenuSection } from '../types';

export const MENU_DATA: MenuSection[] = [
  {
    id: '1',
    title: 'Кальяны',
    data: [
      {
        id: '1',
        name: 'Кальян яблочный',
        price: 1200,
        description: 'Свежий табак на яблоке',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🍎'
      },
      {
        id: '2',
        name: 'Кальян классический',
        price: 1000,
        description: 'Классический кальян с молоком',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=💨'
      },
      {
        id: '3',
        name: 'Кальян премиум',
        price: 1500,
        description: 'Премиум табак и угли',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=⭐'
      }
    ]
  },
  {
    id: '2',
    title: 'Напитки',
    data: [
      {
        id: '4',
        name: 'Чай зеленый',
        price: 300,
        description: 'Свежезаваренный чай',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🍵'
      },
      {
        id: '5',
        name: 'Кофе латте',
        price: 350,
        description: 'Ароматный кофе с молоком',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=☕'
      },
      {
        id: '6',
        name: 'Морс клюквенный',
        price: 250,
        description: 'Освежающий морс',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🥤'
      }
    ]
  },
  {
    id: '3',
    title: 'Закуски',
    data: [
      {
        id: '7',
        name: 'Чипсы',
        price: 200,
        description: 'Хрустящие чипсы',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🥔'
      },
      {
        id: '8',
        name: 'Орешки',
        price: 180,
        description: 'Ассорти орехов',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🥜'
      }
    ]
  },
  {
    id: '4',
    title: 'Десерты',
    data: [
      {
        id: '9',
        name: 'Тирамису',
        price: 400,
        description: 'Итальянский десерт',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🍰'
      },
      {
        id: '10',
        name: 'Чизкейк',
        price: 350,
        description: 'Нежный чизкейк',
        image: 'https://via.placeholder.com/80x80/2E7D32/FFFFFF?text=🎂'
      }
    ]
  }
];