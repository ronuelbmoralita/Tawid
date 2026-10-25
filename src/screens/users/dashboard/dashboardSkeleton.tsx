// screens/dashboard/dashboardSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';

interface BlockProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
}

function Block({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  circle = false,
}: BlockProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height: circle ? (width as number) : height,
          borderRadius: circle ? 999 : borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header: Logo + Active badge + Bell */}
        <View style={styles.header}>
          <Block width={90} height={28} borderRadius={6} />
          <View style={styles.headerRight}>
            <Block width={70} height={28} borderRadius={14} />
            <Block circle width={28} height={28} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Block width={70} height={32} borderRadius={16} />
          <Block width={60} height={32} borderRadius={16} />
          <Block width={70} height={32} borderRadius={16} />
          <Block width={60} height={32} borderRadius={16} />
        </View>

        {/* Main content area */}
        <View style={styles.content}>
          {/* Routes & Trips Card - now fills remaining height */}
          <View style={styles.sectionCard}>
            {/* Title + Add button */}
            <View style={styles.rowBetween}>
              <View style={styles.row}>
                <Block width={18} height={18} borderRadius={4} style={{ marginRight: 8 }} />
                <Block width={120} height={18} />
              </View>
              <Block width={70} height={32} borderRadius={16} />
            </View>

            {/* Inner white card */}
            <View style={styles.routeCard}>
              <View style={styles.rowBetween}>
                <View style={{ gap: 6 }}>
                  <Block width={140} height={16} />
                  <Block width={60} height={12} />
                </View>
                <Block width={50} height={14} />
              </View>

              {/* Add Trip button */}
              <Block height={40} borderRadius={12} style={{ marginTop: 14 }} />

              {/* Trip rows */}
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.tripRow}>
                  <View style={{ flex: 1, gap: 8 }}>
                    <View style={styles.row}>
                      <Block width={18} height={18} borderRadius={4} style={{ marginRight: 8 }} />
                      <Block width="55%" height={15} />
                    </View>
                    <View style={styles.row}>
                      <Block width={60} height={13} />
                      <Block width={70} height={20} borderRadius={10} style={{ marginLeft: 10 }} />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Block width={36} height={14} style={{ marginRight: 12 }} />
                    <Block width={45} height={14} />
                  </View>
                </View>
              ))}

              {/* View All */}
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Block width={110} height={14} />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionCard: {
    flex: 1,                    // ← ito ang gumagawa ng tall height
    backgroundColor: '#F0FAFA',
    borderRadius: 16,
    padding: 16,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});