// screens/passenger/components/selectPort.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import TawidModal from '../../../../components/tawidModal';
import TawidCard from '../../../../components/tawidCard';
import { useSlideUpFadeIn } from '../../../../constants/animation';
import { fetchPortOptions, savePreferredPort, PortOption } from './selectPortDB';

interface SelectPortProps {
  label: string;
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  animationDelay?: number;
  type?: 'origin' | 'destination' | 'preferred';
  options?: string[];
  highlightValue?: string | null;
  highlightLabel?: string;
}

const SelectPort: React.FC<SelectPortProps> = ({
  label,
  selectedValue,
  onValueChange,
  placeholder,
  animationDelay = 0,
  type = 'origin',
  options = [],
  highlightValue = null,
  highlightLabel = 'Nearest port',
}) => {
  const { opacity, transform } = useSlideUpFadeIn(animationDelay, 400, 20);
  const [preferredPorts, setPreferredPorts] = useState<PortOption[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [portOptions, setPortOptions] = useState<string[]>([]);
  const [hasSelected, setHasSelected] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (type === 'preferred') fetchPortOptions().then(setPreferredPorts);
  }, [type]);

  const handleSelect = async (value: string) => {
    onValueChange(value);
    setHasSelected(true);
    setModalVisible(false);
    if (type === 'preferred') {
      const chosen = preferredPorts.find((p) => p.name === value);
      if (chosen) await savePreferredPort(chosen);
    }
  };

  const openModal = () => {
    const ports = type === 'preferred' ? preferredPorts.map((p) => p.name) : options;

    if (!ports.length) {
      Alert.alert('No Options', `No ${label.toLowerCase()} available`, [{ text: 'OK' }]);
      return;
    }

    const sortedOptions =
      highlightValue && ports.includes(highlightValue)
        ? [highlightValue, ...ports.filter((o) => o !== highlightValue)]
        : ports;

    setPortOptions(sortedOptions);
    setModalVisible(true);
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const displayValue = hasSelected ? selectedValue : null;

  const handleClear = () => {
    onValueChange('');
    setHasSelected(false);
  };

  return (
    <>
      <Animated.View style={{ marginBottom: 4, opacity, transform, paddingHorizontal: 15 }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TawidCard
            color={displayValue ? colors.brand : '#94A3B8'}
            style={{ padding: 0 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
              onPress={openModal}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: displayValue ? colors.black : 'rgba(0,0,0,0.4)',
                  fontWeight: displayValue ? '500' : '400',
                }}
              >
                {displayValue || placeholder}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {displayValue && (
                  <TouchableOpacity
                    onPress={handleClear}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <FontAwesome6
                      name="xmark"
                      size={14}
                      color="#94A3B8"
                      iconStyle="solid"
                    />
                  </TouchableOpacity>
                )}
                <FontAwesome6
                  name="chevron-down"
                  size={13}
                  color={displayValue ? colors.brand : '#94A3B8'}
                  iconStyle="solid"
                />
              </View>
            </TouchableOpacity>
          </TawidCard>
        </Animated.View>
      </Animated.View>

      <TawidModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={label}
        showCloseButton={true}
      >
        <View>
          {portOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: item === displayValue ? colors.brand + '10' : colors.white,
                borderBottomWidth: 1,
                borderBottomColor: '#F0F8F8',
              }}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: item === displayValue ? colors.brand : colors.black,
                  fontWeight: item === displayValue ? '600' : '400',
                  flex: 1,
                }}
              >
                {item}
                {item === highlightValue ? ` (${highlightLabel})` : ''}
              </Text>

              {item === displayValue && (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: colors.brand,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8,
                  }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.brand,
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {highlightValue && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: '#F0F0F0',
                backgroundColor: '#FAFAFA',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <FontAwesome6
                name="circle-info"
                size={12}
                color="#888"
                iconStyle="solid"
                style={{ marginTop: 3 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: '#888',
                  textAlign: 'justify',
                  lineHeight: 18,
                  flex: 1,
                }}
              >
                <Text style={{ fontWeight: '600' }}>Nearest port</Text> ang default dahil
                ito ang pinakamalapit sa iyong lokasyon. Maaari ka pa ring pumili ng ibang
                port para makita ang schedule nito.
              </Text>
            </View>
          )}
        </View>
      </TawidModal>
    </>
  );
};

export default SelectPort;