// utils/animations.ts
import { useRef, useEffect } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

// ============================================
// ENTRANCE ANIMATIONS
// ============================================

/**
 * Simple fade in animation
 */
export const useFadeIn = (delay = 0, duration = 400) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
        }).start();
    }, []);
    return anim;
};

/**
 * Simple fade out animation
 */
export const useFadeOut = (delay = 0, duration = 400) => {
    const anim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
        }).start();
    }, []);
    return anim;
};

/**
 * Slide up with fade in
 */
export const useSlideUpFadeIn = (delay = 0, duration = 500, distance = 30) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(distance)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity: fade, transform: [{ translateY: slide }] };
};

/**
 * Slide down with fade in
 */
export const useSlideDownFadeIn = (delay = 0, duration = 500, distance = 30) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(-distance)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity: fade, transform: [{ translateY: slide }] };
};

/**
 * Slide left with fade in
 */
export const useSlideLeftFadeIn = (delay = 0, duration = 500, distance = 30) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(distance)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity: fade, transform: [{ translateX: slide }] };
};

/**
 * Slide right with fade in
 */
export const useSlideRightFadeIn = (delay = 0, duration = 500, distance = 30) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(-distance)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity: fade, transform: [{ translateX: slide }] };
};

/**
 * Scale with fade in
 */
export const useScaleFadeIn = (delay = 0, duration = 500, fromScale = 0.8) => {
    const fade = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(fromScale)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return {
        opacity: fade,
        transform: [{ scale }]
    };
};

/**
 * Staggered animation for list items (slide from right)
 */
export const useStaggeredItem = (index: number, baseDelay = 0, staggerDelay = 80) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        const delay = baseDelay + index * staggerDelay;
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 300,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration: 300,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return {
        opacity: fade,
        transform: [{ translateX: slide }],
    };
};

/**
 * Staggered animation with custom direction
 */
export const useStaggeredItemCustom = (
    index: number,
    baseDelay = 0,
    staggerDelay = 80,
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    distance = 20
) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(distance)).current;

    useEffect(() => {
        const delay = baseDelay + index * staggerDelay;
        const transform: any = {};

        // Set initial position based on direction
        if (direction === 'up') slide.setValue(distance);
        else if (direction === 'down') slide.setValue(-distance);
        else if (direction === 'left') slide.setValue(distance);
        else if (direction === 'right') slide.setValue(-distance);

        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 300,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration: 300,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return {
        opacity: fade,
        transform: [{
            translateX: direction === 'left' || direction === 'right' ? slide : 0,
            translateY: direction === 'up' || direction === 'down' ? slide : 0,
        }],
    };
};

// ============================================
// INTERACTION ANIMATIONS
// ============================================

/**
 * Press animation for buttons (scale down on press)
 */
export const usePressAnimation = () => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    return {
        scale,
        onPressIn,
        onPressOut,
        style: { transform: [{ scale }] },
    };
};

/**
 * Hover/Tap animation (subtle scale)
 */
export const useTapAnimation = (scaleTo = 0.97) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    return { scale, onPressIn, onPressOut };
};

// ============================================
// LOOPING ANIMATIONS
// ============================================

/**
 * Simple pulse animation for attention
 */
export const usePulse = (duration = 2000, scaleTo = 1.03) => {
    const anim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: scaleTo,
                    duration: duration / 2,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin),
                }),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: duration / 2,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin),
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return anim;
};

/**
 * Breath animation (opacity pulse)
 */
export const useBreath = (duration = 3000, minOpacity = 0.6) => {
    const anim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: minOpacity,
                    duration: duration / 2,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin),
                }),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: duration / 2,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin),
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return anim;
};

/**
 * Shake animation for error/attention
 */
export const useShake = (duration = 500, intensity = 5) => {
    const anim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(anim, {
                toValue: intensity,
                duration: duration / 4,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
            Animated.timing(anim, {
                toValue: -intensity,
                duration: duration / 4,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
            Animated.timing(anim, {
                toValue: intensity,
                duration: duration / 4,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
            Animated.timing(anim, {
                toValue: 0,
                duration: duration / 4,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
        ]).start();
    };

    return { translateX: anim, shake };
};

/**
 * Continuous rotation (for loading spinners)
 */
export const useSpin = (duration = 2000) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(anim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
                easing: Easing.linear,
            })
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
};

// ============================================
// TRANSITION ANIMATIONS
// ============================================

/**
 * Fade transition between two states
 */
export const useFadeTransition = (show: boolean, duration = 300) => {
    const anim = useRef(new Animated.Value(show ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: show ? 1 : 0,
            duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.cubic),
        }).start();
    }, [show]);

    return anim;
};

/**
 * Slide transition between two states
 */
export const useSlideTransition = (show: boolean, direction: 'up' | 'down' = 'up', distance = 30, duration = 300) => {
    const fade = useRef(new Animated.Value(show ? 1 : 0)).current;
    const slide = useRef(new Animated.Value(show ? 0 : distance)).current;

    useEffect(() => {
        const toValue = show ? 0 : direction === 'up' ? distance : -distance;
        Animated.parallel([
            Animated.timing(fade, {
                toValue: show ? 1 : 0,
                duration,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.cubic),
            }),
            Animated.timing(slide, {
                toValue,
                duration,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.cubic),
            }),
        ]).start();
    }, [show]);

    return {
        opacity: fade,
        transform: [{ translateY: slide }],
    };
};

// ============================================
// SCROLL ANIMATIONS
// ============================================

/**
 * Parallax scroll effect
 */
export const useParallax = (scrollY: Animated.Value, speed = 0.5) => {
    return scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 100 * speed],
        extrapolate: 'clamp',
    });
};

/**
 * Fade scroll effect (element fades when scrolled)
 */
export const useFadeOnScroll = (scrollY: Animated.Value, startFade = 50, endFade = 150) => {
    return scrollY.interpolate({
        inputRange: [0, startFade, endFade],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });
};

/**
 * Scale scroll effect
 */
export const useScaleOnScroll = (scrollY: Animated.Value, startScale = 0, endScale = 100) => {
    return scrollY.interpolate({
        inputRange: [0, startScale, endScale],
        outputRange: [1, 1, 0.8],
        extrapolate: 'clamp',
    });
};

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Create animated style object
 */
export const animatedStyle = (animations: Record<string, any>): ViewStyle => {
    const result: any = {};

    if (animations.opacity) result.opacity = animations.opacity;
    if (animations.transform) result.transform = animations.transform;
    if (animations.backgroundColor) result.backgroundColor = animations.backgroundColor;

    return result;
};

/**
 * Combine multiple animations into one style
 */
export const combineAnimations = (...animations: any[]): ViewStyle => {
    const combined: any = {};

    animations.forEach((anim) => {
        if (anim.opacity !== undefined) combined.opacity = anim.opacity;
        if (anim.transform) {
            if (!combined.transform) combined.transform = [];
            // Merge transforms
            if (Array.isArray(anim.transform)) {
                combined.transform = [...combined.transform, ...anim.transform];
            }
        }
    });

    return combined;
};

// ============================================
// REUSABLE ANIMATED COMPONENT HELPERS
// ============================================

export const Animations = {
    // Entrance
    fadeIn: useFadeIn,
    fadeOut: useFadeOut,
    slideUpFadeIn: useSlideUpFadeIn,
    slideDownFadeIn: useSlideDownFadeIn,
    slideLeftFadeIn: useSlideLeftFadeIn,
    slideRightFadeIn: useSlideRightFadeIn,
    scaleFadeIn: useScaleFadeIn,

    // Lists
    staggeredItem: useStaggeredItem,
    staggeredItemCustom: useStaggeredItemCustom,

    // Interactions
    press: usePressAnimation,
    tap: useTapAnimation,

    // Looping
    pulse: usePulse,
    breath: useBreath,
    shake: useShake,
    spin: useSpin,

    // Transitions
    fadeTransition: useFadeTransition,
    slideTransition: useSlideTransition,

    // Scroll
    parallax: useParallax,
    fadeOnScroll: useFadeOnScroll,
    scaleOnScroll: useScaleOnScroll,
};