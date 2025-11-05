import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AddItemGestureIndicatorProps {
  visible: boolean;
  progress: number;
  onComplete: () => void;
}

export default function AddItemGestureIndicator({
  visible,
  progress,
  onComplete,
}: AddItemGestureIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Анимация появления
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Проверяем завершение жеста
      if (progress >= 1) {
        onComplete();
      }
    } else {
      // Анимация исчезновения
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, progress, onComplete]);

  if (!visible && progress === 0) return null;

  const radius = 60;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.circleContainer}>
          {/* Фоновый круг */}
          <View
            style={[
              styles.circle,
              {
                width: radius * 2 + strokeWidth,
                height: radius * 2 + strokeWidth,
                borderRadius: radius + strokeWidth / 2,
                borderWidth: strokeWidth,
                borderColor: 'rgba(46, 125, 50, 0.2)',
              },
            ]}
          />
          
          {/* Прогресс круг */}
          <Animated.View
            style={[
              styles.progressCircle,
              {
                width: radius * 2 + strokeWidth,
                height: radius * 2 + strokeWidth,
                borderRadius: radius + strokeWidth / 2,
                borderWidth: strokeWidth,
                borderColor: '#2E7D32',
                borderLeftColor: progress > 0 ? '#2E7D32' : 'transparent',
                borderBottomColor: progress > 0 ? '#2E7D32' : 'transparent',
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
          
          {/* Центральное содержимое */}
          <View style={styles.content}>
            <Text style={styles.icon}>➕</Text>
            <Text style={styles.text}>Добавить товар</Text>
            <Text style={styles.hint}>
              {progress >= 1 ? 'Отпустите' : 'Удерживайте...'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});