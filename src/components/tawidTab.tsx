// screens/components/tab.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors } from '../constants/colors';
import TawidCard from './tawidCard';

interface TabItem {
  key: string;
  label: string;
  component: React.ReactNode;
}

interface TabProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  fillHeight?: boolean;
}

export default function Tab({ tabs, activeTab: externalActiveTab, onTabChange, fillHeight = true }: TabProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.key || '');
  const currentTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const contentFade = useRef(new Animated.Value(1)).current;

  const scales = useRef<{ [key: string]: Animated.Value }>(
    tabs.reduce((acc, tab) => {
      acc[tab.key] = new Animated.Value(tab.key === currentTab ? 1 : 0.92);
      return acc;
    }, {} as { [key: string]: Animated.Value })
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const switchTab = (tabKey: string) => {
    if (tabKey === currentTab) return;

    if (externalActiveTab === undefined) {
      setInternalActiveTab(tabKey);
    }
    onTabChange?.(tabKey);

    tabs.forEach((tab) => {
      Animated.spring(scales[tab.key], {
        toValue: tab.key === tabKey ? 1 : 0.92,
        useNativeDriver: true,
        tension: 150,
        friction: 6,
      }).start();
    });

    Animated.sequence([
      Animated.timing(contentFade, {
        toValue: 0.5,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.spring(contentFade, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 6
      }),
    ]).start();
  };

  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== currentTab) {
      tabs.forEach((tab) => {
        Animated.spring(scales[tab.key], {
          toValue: tab.key === externalActiveTab ? 1 : 0.92,
          useNativeDriver: true,
          tension: 150,
          friction: 6,
        }).start();
      });
    }
  }, [externalActiveTab]);

  const isActive = (tabKey: string) => tabKey === currentTab;

  return (
    <Animated.View
      style={[
        fillHeight ? { flex: 1 } : undefined,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUp }],
          paddingHorizontal: 15,
          gap: 15
        }
      ]}>
      {/* Tab Profile - Using TawidCard with brand color */}
      <TawidCard color={colors.brand}>
        <View style={{ flexDirection: 'row' }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => switchTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
              }}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scales[tab.key] }],
                  backgroundColor: isActive(tab.key) ? colors.brand : 'transparent',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isActive(tab.key) ? colors.white : 'rgba(0,0,0,0.5)',
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    letterSpacing: 0.3,
                  }}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </TawidCard>
      {/* Tab Content - Using TawidCard with subtle tint */}
      <TawidCard
        color={colors.brand}
        style={[
          fillHeight ? { flex: 1 } : undefined,
          {
            padding: 10,
            opacity: contentFade,
            transform: [
              {
                scale: contentFade.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }
        ]}
        animatedStyle={{
          opacity: contentFade,
          transform: [
            {
              scale: contentFade.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        }}>
        {tabs.find((tab) => tab.key === currentTab)?.component}
      </TawidCard>
    </Animated.View>
  );
}