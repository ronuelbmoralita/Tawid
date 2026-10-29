// components/tabStyle.tsx
import * as React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../constants/colors';
import { TawidBadge } from '../components/tawidBadge';

const TAB_W = 88;
const PAD = 6;
const INNER_H = 52;
export const TAB_BAR_HEIGHT = INNER_H + PAD * 2;

const TAB_ICONS: Record<string, string> = {
  MainTab: 'house',
  Feedback: 'comment-dots',
  Profile: 'user',
};
const TAB_LABELS: Record<string, string> = {
  MainTab: 'Home',
  Feedback: 'Feedback',
  Profile: 'Profile',
};

export type BarSnapshot = Pick<BottomTabBarProps, 'state' | 'navigation'>;

// Espasyo na dapat iwan sa ilalim ng mga screen (scroll padding) dahil lumulutang ang bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 12;
}

// Ginagamit sa `tabBar` prop ng Tab.Navigator. Wala itong nire-render;
// ipinapasa lang nito ang state/navigation palabas ng navigator para
// ang tunay na bar ay maisama sa labas ng BlurTargetView.
export function TabBarBridge({
  state,
  navigation,
  onChange,
}: BarSnapshot & { onChange: (s: BarSnapshot) => void }) {
  React.useEffect(() => {
    onChange({ state, navigation });
  }, [state, navigation, onChange]);
  return null;
}

type Props = BarSnapshot & {
  blurTarget?: React.RefObject<View | null>;
  badges?: Record<string, number>;
};

export function TawidTabBar({ state, navigation, blurTarget, badges }: Props) {
  const insets = useSafeAreaInsets();

  // Local na index para agad gumalaw ang pill sa pag-tap, hindi na hinihintay
  // ang round-trip ng navigation state → bridge → re-render.
  const [visualIndex, setVisualIndex] = React.useState(state.index);
  const slide = React.useRef(new Animated.Value(state.index * TAB_W)).current;

  // Sync kapag nagbago ang tab sa ibang paraan (swipe, navigate galing sa ibang screen, atbp.)
  React.useEffect(() => {
    setVisualIndex(state.index);
  }, [state.index]);

  React.useEffect(() => {
    Animated.spring(slide, {
      toValue: visualIndex * TAB_W,
      useNativeDriver: true,
      stiffness: 420,
      damping: 32,
      mass: 0.6,
    }).start();
  }, [visualIndex, slide]);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 8) }]}
    >
      {/* Wrapper para sa anino — hindi lalabas ang anino sa BlurView dahil sa overflow: 'hidden' */}
      <View style={styles.shadow}>
        <BlurView
          intensity={20}
          tint="light"
          blurTarget={blurTarget}
          blurMethod="dimezisBlurView"
          style={styles.pill}
        >
          <View style={styles.tint} />
          <View pointerEvents="none" style={styles.rim} />

          <Animated.View style={[styles.indicator, { transform: [{ translateX: slide }] }]} />

          {state.routes.map((route, index) => {
            const focused = visualIndex === index;
            const label = TAB_LABELS[route.name] ?? route.name;
            const color = focused ? colors.brand : 'rgba(60,60,60,0.75)';
            const count = badges?.[route.name] ?? 0;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (event.defaultPrevented) return;
              setVisualIndex(index);
              if (state.index !== index) navigation.navigate(route.name, route.params);
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={label}
                style={styles.tab}
              >
                <View style={{ position: 'relative' }}>
                  <FontAwesome6
                    name={TAB_ICONS[route.name] ?? 'circle'}
                    iconStyle="solid"
                    size={focused ? 22 : 18}
                    color={color}
                  />
                  {route.name === 'Feedback' && (
                    <TawidBadge
                      count={count}
                      badgeStyle={
                        focused
                          ? { minWidth: 20, height: 20, top: -6, right: -10 }
                          : { minWidth: 15, height: 15, top: -3, right: -9 }
                      }
                      textStyle={focused ? { fontSize: 11 } : { fontSize: 9 }}
                    />
                  )}
                </View>
                <Text style={[styles.label, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  // Banayad na pop-up lang: malambot na anino, hindi malakas.
  shadow: {
    borderRadius: 999,
    // Android: kailangan ng kulay ang wrapper para lumabas ang elevation.
    // Kung may puting gilid sa mga kurba o nabawasan ang blur, ibaba ang elevation o alisin ito.
    backgroundColor: Platform.OS === 'android' ? '#FFFFFF' : 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pill: {
    flexDirection: 'row',
    padding: PAD,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.14)',
  },
  // puting wash; ang blur ang gumagawa ng frosted na itsura
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.4)' },
  // manipis na puting ring sa loob para magmukhang gilid ng salamin
  rim: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  // active pill: solid (hindi frosted) para kita ang icon at label, may manipis na border
  indicator: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    width: TAB_W,
    height: INNER_H,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.brand,
  },
  tab: { width: TAB_W, height: INNER_H, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 12 },
});