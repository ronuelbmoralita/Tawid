import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import Customer from './customer/customer'; // Your existing Customer navigator/component
import Profile from './profile/profile';

const Tab = createBottomTabNavigator();

// ──────────────────────────────────────────────────
// Custom Animated Tab Bar (pure Animated API)
// ──────────────────────────────────────────────────
function AnimatedTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icon & Label logic
        const iconName =
          route.name === 'Main' ? 'home-outline' : 'person-outline';

        const displayLabel = route.name === 'Main' ? 'Home' : 'Profile';

        // Animated values (one set per tab)
        const widthAnim = React.useRef(new Animated.Value(isFocused ? 140 : 50)).current;
        const bgAnim = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;
        const iconX = React.useRef(new Animated.Value(isFocused ? -35 : 0)).current;
        const textOpacity = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;
        const textX = React.useRef(new Animated.Value(isFocused ? 10 : 30)).current;

        React.useEffect(() => {
          Animated.parallel([
            Animated.spring(widthAnim, { toValue: isFocused ? 140 : 50, useNativeDriver: false }),
            Animated.spring(bgAnim, { toValue: isFocused ? 1 : 0, useNativeDriver: false }),
            Animated.spring(iconX, { toValue: isFocused ? 0 : 20, useNativeDriver: true }),
            Animated.spring(textOpacity, { toValue: isFocused ? 1 : 0, useNativeDriver: true }),
            Animated.spring(textX, { toValue: isFocused ? 1 : 5, useNativeDriver: true }),
          ]).start();
        }, [isFocused]);

        const backgroundColor = bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['transparent', 'rgba(0,0,0,0.1)'],
        });

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.tabButtonContainer}
          >
            <Animated.View style={[styles.pill, { width: widthAnim, backgroundColor }]}>
              {/* Icon */}
              <Animated.View style={{ transform: [{ translateX: iconX }] }}>
                <Ionicons name={iconName} size={24} color={isFocused ? '#000' : '#888'} />
              </Animated.View>

              {/* Label */}
              <Animated.Text
                style={[
                  styles.label,
                  {
                    opacity: textOpacity,
                    transform: [{ translateX: textX }],
                    color: isFocused ? '#000' : '#888',
                  },
                ]}
              >
                {displayLabel}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ──────────────────────────────────────────────────
// Profile Screen (simple example)
// ──────────────────────────────────────────────────

// ──────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(64, 224, 208, 1)', // turquoise
    marginHorizontal: 20,
    margin: 20,
    height: 80,
    borderRadius: 100,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    width: '90%'
  },
  tabButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    height: 50,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

// ──────────────────────────────────────────────────
// Main Tab Navigator (export this)
// ──────────────────────────────────────────────────
export default function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // hide default bar
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      {/* Unique name to avoid conflict */}
      <Tab.Screen name="Main" component={Customer} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}