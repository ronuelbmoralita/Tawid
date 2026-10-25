import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Alert, View, Animated } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../constants/colors';
import { broadcastNotif } from '../../notifications/broadcastNotif';
import { subscribeToSuspension, toggleSuspension } from '../../screens/users/dashboard/dashboardFunctions';

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome6);

interface TawidSuspendProps {
    userData?: { role?: string; [key: string]: any };
}

export default function Suspend({ userData }: TawidSuspendProps) {
    const [isSuspended, setIsSuspended] = useState(false);
    const [loading, setLoading] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const isCompany = userData?.role === 'Company';

    useEffect(() => {
        if (!isCompany) return;
        const unsub = subscribeToSuspension((suspended) => {
            setIsSuspended(suspended);
            Animated.sequence([
                Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true, tension: 100, friction: 4 }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 4 })
            ]).start();
        });
        return () => unsub();
    }, [isCompany]);

    if (!isCompany) return null;

    const handlePress = () => {
        const next = !isSuspended;
        Alert.alert(
            next ? 'Isuspinde ang LAHAT ng Biyahe?' : 'Ibalik ang Normal na Biyahe?',
            next ? 'Ise-set nito ang lahat ng trips bilang CANCELLED.' : 'Ise-set nito ang lahat ng trips pabalik sa NORMAL.',
            [
                { text: 'Kanselahin', style: 'cancel' },
                {
                    text: next ? 'Isuspinde' : 'Ibalik',
                    style: next ? 'destructive' : 'default',
                    onPress: async () => {
                        setLoading(true);
                        Animated.timing(rotateAnim, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }).start(() => rotateAnim.setValue(0));

                        try {
                            await toggleSuspension(next);
                            await broadcastNotif(
                                next 
                                    ? 'Ka-Tawid, pansamantalang "WALANG BYAHE" sa LAHAT ng ruta.'
                                    : 'Ka-Tawid, "BUMALIK NA SA NORMAL" ang LAHAT ng iskedyul.'
                            );
                        } catch (error) {
                            console.error('Suspension Error:', error);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const isActive = !isSuspended;
    const bgColor = isActive ? '#DCFCE7' : '#FEE2E2';
    const color = isActive ? '#22C55E' : '#EF4444';
    const icon = isActive ? 'circle-check' : 'circle-xmark';
    const label = isActive ? 'Active' : 'Inactive';

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={loading}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: bgColor,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 100,
                marginRight: 15,
                gap: 6,
                opacity: loading ? 0.5 : 1,
            }}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
                <AnimatedIcon name={icon} size={12} color={color} iconStyle="solid" />
            </Animated.View>
            <Text style={{ fontSize: 12, fontWeight: '700', color }}>{label}</Text>
        </TouchableOpacity>
    );
}