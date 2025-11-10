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
        setTimeout(() => {
          onComplete();
        }, 300);
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

  const radius = 40;
  const strokeWidth = 4;

  // Вычисляем угол для прогресс-круга (от 0 до 360 градусов)
  const progressAngle = progress * 360;

  return (
    <View style={styles.overlay} pointerEvents="none">
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
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                borderWidth: strokeWidth,
                borderColor: 'rgba(46, 125, 50, 0.2)',
              },
            ]}
          />
          
          {/* Прогресс круг */}
          <View
            style={[
              styles.progressCircle,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                borderWidth: strokeWidth,
                borderColor: '#2E7D32',
                borderLeftColor: progress > 0 ? '#2E7D32' : 'transparent',
                borderBottomColor: progress > 0.25 ? '#2E7D32' : 'transparent',
                borderRightColor: progress > 0.5 ? '#2E7D32' : 'transparent',
                borderTopColor: progress > 0.75 ? '#2E7D32' : 'transparent',
                transform: [{ rotate: `${-45 + progressAngle}deg` }],
              },
            ]}
          />
          
          {/* Центральное содержимое */}
          <View style={styles.content}>
            <Text style={styles.icon}>
              {progress >= 1 ? '✅' : '➕'}
            </Text>
            <Text style={styles.text}>
              {progress >= 1 ? 'Готово!' : 'Добавить товар'}
            </Text>
            <Text style={styles.hint}>
              {progress >= 1 ? 'Отпустите' : 'Удерживайте...'}
            </Text>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    minWidth: 200,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  circle: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  progressCircle: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});