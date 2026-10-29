// screens/passenger/components/selectPort.tsx
import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Animated, Alert } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import TawidModal from '../../../../components/tawidModal';
// Import ang bagong skeleton
import SelectPortSkeleton from './selectPortSkeleton';

type Field = 'origin' | 'destination';

interface SelectPortProps {
    origins: string[];
    destinations: string[];
    selectedOrigin: string | null;
    selectedDestination: string | null;
    onOriginChange: (value: string) => void;
    onDestinationChange: (value: string) => void;
    onSwap: () => void;
    canSwap: boolean;
    preferredCity?: string | null;
    loading?: boolean;
}

const SelectPort: React.FC<SelectPortProps> = ({
    origins,
    destinations,
    selectedOrigin,
    selectedDestination,
    onOriginChange,
    onDestinationChange,
    onSwap,
    canSwap,
    preferredCity = null,
    loading = false,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [activeField, setActiveField] = useState<Field>('origin');
    const [options, setOptions] = useState<string[]>([]);
    const scale = useRef(new Animated.Value(1)).current;

    // nasa parent ang Animated.Value kasi nire-remount ang Card sa bawat render
    const cardScale = useRef({ origin: new Animated.Value(1), destination: new Animated.Value(1) }).current;

    // NEW: iOS-style spring. Mabilis at walang bounce sa pindot, springy sa bitaw
    const springTo = (value: Animated.Value, pressed: boolean, depth: number) =>
        Animated.spring(value, {
            toValue: pressed ? depth : 1,
            useNativeDriver: true,
            stiffness: pressed ? 1000 : 280,
            damping: pressed ? 30 : 7,
            mass: 1,
        }).start();

    const pressCard = (field: Field, pressed: boolean) => springTo(cardScale[field], pressed, 0.95);

    const openPicker = (field: Field) => {
        const list = field === 'origin' ? origins : destinations;
        if (!list.length) {
            Alert.alert(
                'Not Available',
                field === 'origin'
                    ? 'No departure ports available.'
                    : 'No destination ports available.',
                [{ text: 'OK' }]
            );
            return;
        }
        const sorted =
            field === 'origin' && preferredCity && list.includes(preferredCity)
                ? [preferredCity, ...list.filter((o) => o !== preferredCity)]
                : list;
        setActiveField(field);
        setOptions(sorted);
        setModalVisible(true);
    };

    const handleSelect = (value: string) => {
        activeField === 'origin' ? onOriginChange(value) : onDestinationChange(value);
        setModalVisible(false);
    };

    const Card = ({ field }: { field: Field }) => {
        const isOrigin = field === 'origin';
        const value = isOrigin ? selectedOrigin : selectedDestination;
        return (
            <Animated.View style={{ flex: 1, transform: [{ scale: cardScale[field] }] }}>
                <TouchableOpacity
                    onPress={() => openPicker(field)}
                    onPressIn={() => pressCard(field, true)}
                    onPressOut={() => pressCard(field, false)}
                    activeOpacity={0.7}
                    style={{
                        width: '100%',
                        height: 50,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: colors.white,
                        borderWidth: 1.5,
                        borderColor: value ? colors.brand : colors.gray + '66',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 9,
                                fontWeight: '800',
                                color: colors.black,
                                opacity: 0.6,
                                lineHeight: 12,
                            }}
                        >
                            {isOrigin ? 'FROM' : 'TO'}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 14,
                                fontWeight: value ? '700' : '500',
                                color: value ? colors.black : colors.gray,
                                lineHeight: 18,
                                marginTop: 1,
                            }}
                        >
                            {value || (isOrigin ? 'Origin' : 'Destination')}
                        </Text>
                    </View>

                    <FontAwesome6
                        name="chevron-down"
                        size={10}
                        color={value ? colors.brand : colors.gray}
                        iconStyle="solid"
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // --- RENDER SKELETON KUNG NAGLO-LOAD ---
    if (loading) {
        return <SelectPortSkeleton />;
    }

    const activeValue = activeField === 'origin' ? selectedOrigin : selectedDestination;

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Card field="origin" />

                <Animated.View style={{ transform: [{ scale }] }}>
                    <TouchableOpacity
                        onPress={onSwap}
                        disabled={!canSwap}
                        onPressIn={() => canSwap && springTo(scale, true, 0.85)}
                        onPressOut={() => canSwap && springTo(scale, false, 0.85)}
                        activeOpacity={0.8}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: canSwap ? colors.brand : colors.gray + '33',
                        }}
                    >
                        <FontAwesome6
                            name="arrow-right-arrow-left"
                            size={12}
                            color={canSwap ? colors.black : colors.gray}
                            iconStyle="solid"
                        />
                    </TouchableOpacity>
                </Animated.View>

                <Card field="destination" />
            </View>

            <TawidModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={activeField === 'origin' ? 'Origin' : 'Destination'}
                showCloseButton
            >
                <View style={{ gap: 8 }}>
                    {options.map((item) => {
                        const isSelected = item === activeValue;
                        const isHighlight = item === preferredCity && activeField === 'origin';
                        return (
                            <TouchableOpacity
                                key={item}
                                onPress={() => handleSelect(item)}
                                activeOpacity={0.6}
                                style={{
                                    paddingVertical: 14,
                                    paddingHorizontal: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 12,
                                    borderRadius: 14,
                                    borderWidth: 1.5,
                                    borderColor: isSelected ? colors.brand : colors.gray + '33',
                                    backgroundColor: isSelected ? colors.brand + '20' : colors.white,
                                }}
                            >
                                <View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 8,
                                        borderWidth: isSelected ? 0 : 1.5,
                                        borderColor: colors.gray + '66',
                                        backgroundColor: isSelected ? colors.brand : colors.white,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {isSelected && (
                                        <FontAwesome6 name="check" size={11} color={colors.black} iconStyle="solid" />
                                    )}
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            color: colors.black,
                                            fontWeight: isSelected ? '700' : '500',
                                            flexShrink: 1,
                                        }}
                                    >
                                        {item}
                                    </Text>
                                    {isHighlight && (
                                        <View
                                            style={{
                                                paddingHorizontal: 6,
                                                paddingVertical: 2,
                                                borderRadius: 6,
                                                backgroundColor: colors.brand + '40',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: '700',
                                                    color: colors.black,
                                                    letterSpacing: 0.3,
                                                }}
                                            >
                                                NEAREST
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </TawidModal>
        </>
    );
};

export default SelectPort;