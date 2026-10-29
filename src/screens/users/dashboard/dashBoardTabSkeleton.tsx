// screens/dashboard/dashBoardTabSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface DashboardTabSkeletonProps {
    rows?: number;
}

const DashboardTabSkeleton = ({ rows = 6 }: DashboardTabSkeletonProps) => {
    const pulseAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulseAnim]);

    return (
        <Animated.View style={{ gap: 12, opacity: pulseAnim }}>
            {Array.from({ length: rows }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 6,
                    }}
                >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0' }} />
                    <View style={{ flex: 1, gap: 6 }}>
                        <View style={{ width: '55%', height: 14, borderRadius: 4, backgroundColor: '#CBD5E1' }} />
                        <View style={{ width: '80%', height: 10, borderRadius: 4, backgroundColor: '#E2E8F0' }} />
                    </View>
                </View>
            ))}
        </Animated.View>
    );
};

export default DashboardTabSkeleton;