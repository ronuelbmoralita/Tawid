// components/paxSkeleton.tsx
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

export default function PaxSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header: Logo + Bell */}
        <View style={styles.header}>
          <Block width={90} height={28} borderRadius={6} />
          <Block circle width={28} height={28} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, gap: 14 }}>
          {/* Sea Advisory Card */}
          <View style={styles.advisoryCard}>
            <View style={styles.rowBetween}>
              <Block width="55%" height={14} />
              <Block width={70} height={14} />
            </View>
            <View style={[styles.rowBetween, { marginTop: 12 }]}>
              <Block width={80} height={32} borderRadius={6} />
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Block width={60} height={12} />
                <Block width={90} height={22} borderRadius={12} />
              </View>
            </View>
          </View>

          {/* Origin */}
          <Block height={52} borderRadius={14} />

          {/* Destination */}
          <Block height={52} borderRadius={14} />

          {/* Last updated */}
          <View style={[styles.rowBetween, { marginTop: 4 }]}>
            <Block width={90} height={12} />
            <Block width={140} height={12} />
          </View>

          {/* SAILING section */}
          <View style={styles.sectionCard}>
            <Block width={80} height={14} style={{ marginBottom: 16 }} />

            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.tripRow}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Block width="70%" height={15} />
                  <View style={styles.row}>
                    <Block width={70} height={20} borderRadius={10} />
                    <Block width={55} height={13} style={{ marginLeft: 10 }} />
                  </View>
                </View>
                <Block width={70} height={34} borderRadius={10} />
              </View>
            ))}
          </View>

          {/* NO SAILING section */}
          <View style={[styles.sectionCard, { backgroundColor: '#FFF5F5' }]}>
            <Block width={100} height={14} style={{ marginBottom: 16 }} />

            {[1, 2].map((i) => (
              <View key={i} style={styles.tripRow}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Block width="65%" height={15} />
                  <View style={styles.row}>
                    <Block width={70} height={20} borderRadius={10} />
                    <Block width={45} height={13} style={{ marginLeft: 10 }} />
                  </View>
                </View>
                <Block width={85} height={34} borderRadius={10} />
              </View>
            ))}
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
  advisoryCard: {
    backgroundColor: '#E8F8F0',
    borderRadius: 16,
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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