// components/SwitchNotification.tsx
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, ToastAndroid, Platform, Alert } from 'react-native';
import { colors } from '../../../constants/colors';

interface SwitchNotificationProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

const SwitchNotification: React.FC<SwitchNotificationProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      tension: 380,
      friction: 12,
      velocity: 12,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23],
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', colors.brand],
  });

  const thumbScale = anim.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [1, 1.2, 0.95, 1],
  });

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Notification', message);
    }
  };

  const handlePress = () => {
    if (disabled) return;
    const newValue = !value;
    onValueChange(newValue);
    
    showToast(newValue ? 'Notifications enabled' : 'Notifications disabled');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      onPress={handlePress}
      style={{ padding: 4 }}
    >
      <Animated.View
        style={{
          width: 52,
          height: 32,
          borderRadius: 16,
          backgroundColor: trackColor,
          justifyContent: 'center',
          paddingHorizontal: 3,
          opacity: disabled ? 0.5 : 1,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 2,
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#fff',
            transform: [
              { translateX },
              { scale: thumbScale },
            ],
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.5,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default SwitchNotification;