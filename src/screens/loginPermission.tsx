// loginPermission.tsx
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import { colors } from '../constants/colors';
import TawidCard from '../components/tawidCard';

interface LoginPermissionProps {
    hasLocation: boolean;
    hasNotif: boolean;
    isPermissionsGranted: boolean;
    requestLocationPermission: () => void;
    requestNotificationPermission: () => void;
}

export default function LoginPermission({
    hasLocation,
    hasNotif,
    isPermissionsGranted,
    requestLocationPermission,
    requestNotificationPermission,
}: LoginPermissionProps) {
    // Animation for pulse effect
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start pulse animation
        const startPulse = () => {
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => startPulse()); // Loop continuously
        };

        startPulse();

        return () => {
            pulseAnim.stopAnimation();
        };
    }, [pulseAnim]);

    // If all permissions are granted, don't render anything
    if (isPermissionsGranted) {
        return null;
    }

    // Define permission configurations
    const permissions = [
        {
            key: 'location',
            hasPermission: hasLocation,
            requestPermission: requestLocationPermission,
            icon: 'location-dot' as const,
            title: 'Allow Location Access',
            description: 'Helps find nearby ports',
        },
        {
            key: 'notification',
            hasPermission: hasNotif,
            requestPermission: requestNotificationPermission,
            icon: 'bell' as const,
            title: 'Enable Travel Alerts',
            description: 'Get real-time updates',
        },
    ] as const; // Add 'as const' to the entire array

    return (
        <View style={{ width: '100%', gap: 10, marginTop: 14 }}>
            {permissions.map(({ key, hasPermission, requestPermission, icon, title, description }) => (
                !hasPermission && (
                    <TawidCard
                        key={key}
                        color={colors.brand}
                        style={{
                            paddingHorizontal: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderWidth: 1,
                            borderColor: colors.brand + '40',
                        }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <View style={{
                                backgroundColor: colors.brand + '15',
                                padding: 6,
                                borderRadius: 8,
                            }}>
                                <FontAwesome6 
                                    name={icon} 
                                    size={18} 
                                    color={colors.brand} 
                                    iconStyle="solid" 
                                />
                            </View>
                            <View>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.black }}>
                                    {title}
                                </Text>
                                <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 1 }}>
                                    {description}
                                </Text>
                            </View>
                        </View>
                        <Animated.View
                            style={{
                                transform: [{ scale: pulseAnim }],
                            }}>
                            <TouchableOpacity
                                onPress={requestPermission}
                                activeOpacity={0.7}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    backgroundColor: colors.brand,
                                    shadowColor: colors.brand,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}>
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '700',
                                    color: colors.white,
                                }}>
                                    Tap to Allow
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TawidCard>
                )
            ))}
        </View>
    );
}