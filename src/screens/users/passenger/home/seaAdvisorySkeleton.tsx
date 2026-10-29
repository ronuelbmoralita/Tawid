// screens/passenger/home/seaAdvisorySkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SeaAdvisorySkeletonProps {
    height?: number;
}

const SeaAdvisorySkeleton = ({ height = 140 }: SeaAdvisorySkeletonProps) => {
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
        <Animated.View
            style={{
                height,
                width: '100%',
                borderRadius: 20,
                overflow: 'hidden',
                paddingHorizontal: 20,
                paddingVertical: 16,
                justifyContent: 'center',
                backgroundColor: '#F1F5F9',
                opacity: pulseAnim,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Kaliwa: icon + location, tapos wave height */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#CBD5E1', marginRight: 6 }} />
                        <View style={{ width: 130, height: 12, borderRadius: 4, backgroundColor: '#E2E8F0' }} />
                    </View>
                    <View style={{ height: 48, marginTop: 2, justifyContent: 'center' }}>
                        <View style={{ width: 72, height: 32, borderRadius: 8, backgroundColor: '#CBD5E1' }} />
                    </View>
                </View>

                {/* Kanan: oras, petsa, Refresh pill */}
                <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ width: 76, height: 20, borderRadius: 4, backgroundColor: '#CBD5E1' }} />
                    <View style={{ width: 56, height: 10, borderRadius: 4, backgroundColor: '#E2E8F0', marginTop: 4 }} />
                    <View style={{ width: 84, height: 32, borderRadius: 14, backgroundColor: '#E2E8F0', marginTop: 6 }} />
                </View>
            </View>
        </Animated.View>
    );
};

export default SeaAdvisorySkeleton;