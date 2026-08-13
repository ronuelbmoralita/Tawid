// components/SwitchRole.tsx
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../constants/colors';
import TawidCard from '../../../components/tawidCard';

interface SwitchRoleProps {
  userData: any;
  value: string;
  onValueChange: (v: string) => void;
  options?: string[];
  disabled?: boolean;
}

const SwitchRole: React.FC<SwitchRoleProps> = ({
  userData,
  value,
  onValueChange,
  options = ['Passenger', 'Company'],
  disabled = false,
}) => {
  const isCompanyOwner = userData?.roleDual === 'Company';

  const anims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(
      options.map((opt) => [opt, new Animated.Value(opt === value ? 1 : 0)])
    )
  ).current;

  const containerScale = useRef(new Animated.Value(1)).current;

  options.forEach((opt) => {
    if (!anims[opt]) {
      anims[opt] = new Animated.Value(opt === value ? 1 : 0);
    }
  });

  useEffect(() => {
    options.forEach((opt) => {
      Animated.spring(anims[opt], {
        toValue: opt === value ? 1 : 0,
        useNativeDriver: false,
        tension: 320,
        friction: 14,
        velocity: 8,
      }).start();
    });

    // Container bounce
    containerScale.setValue(1);
    Animated.sequence([
      Animated.spring(containerScale, {
        toValue: 1.04,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.spring(containerScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 12,
      }),
    ]).start();
  }, [value]);

  const handlePress = (option: string) => {
    if (!disabled && option !== value) {
      onValueChange(option);
    }
  };

  if (!isCompanyOwner) return null;

  return (
    <TawidCard color={colors.brand}>
      <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <FontAwesome6 name="arrows-rotate" size={16} color="#999" iconStyle="solid" />
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>Switch Role</Text>
          <Text style={{ fontSize: 11, color: '#999' }}>
            Toggle between Passenger and Company views
          </Text>
        </View>
      </View>

      <Animated.View
        style={{
          width: '100%',
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: containerScale }],
        }}
      >
        <TawidCard
          color={colors.blur(2)}
          style={{
            borderWidth: 2,
            borderColor: 'white',
            borderRadius: 100,
            flexDirection: 'row',
          }}>
          {options.map((option) => {
            const anim = anims[option];
            const isActive = option === value;

            const backgroundColor = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', colors.brand],
            });

            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.94, 1],
            });

            const textColor = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['#64748B', '#ffffff'],
            });

            return (
              <TouchableOpacity
                key={option}
                onPress={() => handlePress(option)}
                disabled={disabled}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <Animated.View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 100,
                    backgroundColor,
                    transform: [{ scale }],
                    elevation: isActive ? 4 : 0,
                    shadowColor: colors.brand,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.25 : 0,
                    shadowRadius: 3.5,
                    padding: 8
                  }}
                >
                  <Animated.Text
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? '600' : '500',
                      color: textColor,
                      letterSpacing: 0.2,
                    }}
                  >
                    {option}
                  </Animated.Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </TawidCard>
      </Animated.View>
    </TawidCard>
  );
};

export default SwitchRole;