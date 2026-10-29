// screens/passenger/components/scheduleSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { colors } from '../../../../constants/colors';

interface ScheduleSkeletonProps {
    rows?: number;
}

const SKELETON_CARD = colors.gray + '1A';
const SKELETON_BLOCK = colors.gray + '33';
const SKELETON_BLOCK_LIGHT = colors.gray + '22';

const ScheduleSkeleton = ({ rows = 5 }: ScheduleSkeletonProps) => {
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
        <Animated.View style={{ gap: 15, opacity: pulseAnim }}>
            {/* Notice card */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    height: 60,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    backgroundColor: SKELETON_CARD,
                }}
            >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: SKELETON_BLOCK }} />
                <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ width: 140, height: 12, borderRadius: 4, backgroundColor: SKELETON_BLOCK }} />
                    <View style={{ width: 110, height: 10, borderRadius: 4, backgroundColor: SKELETON_BLOCK_LIGHT }} />
                </View>
                <View style={{ width: 66, height: 28, borderRadius: 6, backgroundColor: SKELETON_BLOCK }} />
            </View>

            {/* Last updated badges */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ width: 100, height: 22, borderRadius: 10, backgroundColor: SKELETON_BLOCK }} />
                <View style={{ width: 170, height: 22, borderRadius: 10, backgroundColor: SKELETON_BLOCK }} />
            </View>

            {/* Section card */}
            <View style={{ borderRadius: 12, backgroundColor: SKELETON_CARD, padding: 10 }}>
                {/* Section header: dot + title + trips badge */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 4,
                        paddingHorizontal: 5,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: SKELETON_BLOCK, marginRight: 8 }} />
                        <View style={{ width: 90, height: 14, borderRadius: 4, backgroundColor: SKELETON_BLOCK }} />
                    </View>
                    <View style={{ width: 62, height: 22, borderRadius: 10, backgroundColor: SKELETON_BLOCK }} />
                </View>

                {/* Trip rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 4,
                            borderTopWidth: 1,
                            borderTopColor: 'rgba(0,0,0,0.05)',
                        }}
                    >
                        <View style={{ flex: 1, gap: 6 }}>
                            {/* Vessel name */}
                            <View style={{ width: 120, height: 15, borderRadius: 4, backgroundColor: SKELETON_BLOCK }} />
                            {/* Vessel type badge */}
                            <View style={{ width: 64, height: 18, borderRadius: 4, backgroundColor: SKELETON_BLOCK_LIGHT }} />
                        </View>
                        {/* Time */}
                        <View style={{ width: 64, height: 15, borderRadius: 4, backgroundColor: SKELETON_BLOCK }} />
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

export default ScheduleSkeleton;