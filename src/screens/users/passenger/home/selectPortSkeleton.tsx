
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const SelectPortSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <Animated.View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                opacity: pulseAnim,
            }}
        >
            {[1, 2].map((i) => (
                <React.Fragment key={i}>
                    {i === 2 && (
                        <View style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: '#E2E8F0',
                        }} />
                    )}

                    <View style={{
                        flex: 1,
                        height: 50,
                        borderRadius: 12,
                        backgroundColor: '#F1F5F9',
                        paddingHorizontal: 12,
                        justifyContent: 'center',
                        gap: 6,
                    }}>
                        <View style={{
                            width: 30,
                            height: 8,
                            backgroundColor: '#E2E8F0',
                            borderRadius: 4,
                        }} />
                        <View style={{
                            width: '60%',
                            height: 13,
                            backgroundColor: '#CBD5E1',
                            borderRadius: 4,
                        }} />
                    </View>
                </React.Fragment>
            ))}
        </Animated.View>
    );
};

export default SelectPortSkeleton;
