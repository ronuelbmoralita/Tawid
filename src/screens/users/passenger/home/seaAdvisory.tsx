// components/seaAdvisory.tsx
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSlideUpFadeIn } from '../../../../constants/animation';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

// Import ang ating standalone seaCondition helper
import { fetchSeaConditionData, SeaCondition } from './seaCondition';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SeaAdvisoryProps {
  height?: number;
  style?: any;
  onPress?: () => void;
  autoFetch?: boolean;
  condition?: SeaCondition | '';
  userData?: any;
  location?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  delay?: number;
}

const CONFIG = {
  calm: { ampRatio: 0.08, speed: 4000, icon: 'sun', label: 'Kalmado', color: '#22c55e' },
  moderate: { ampRatio: 0.22, speed: 3500, icon: 'cloud-sun', label: 'Katamtaman', color: '#eab308' },
  rough: { ampRatio: 0.38, speed: 3000, icon: 'cloud-rain', label: 'Maalon', color: '#f97316' },
  veryRough: { ampRatio: 0.55, speed: 3000, icon: 'cloud-bolt', label: 'Napakaalon', color: '#ef4444' },
} as const;

const PREVIEW_HEIGHTS: Record<SeaCondition, number> = { calm: 0.3, moderate: 1.8, rough: 3.0, veryRough: 4.5 };
const DEFAULT_LAT = 14.671;
const DEFAULT_LNG = 121.613;

const fmtTime = (d: Date) => d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-PH', { weekday: 'short', month: '2-digit', day: '2-digit', year: '2-digit' }).toUpperCase();

export default function SeaAdvisory({
  height = 140,
  style,
  onPress,
  autoFetch = false,
  condition = '',
  userData,
  location = 'Real',
  province = 'Quezon',
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  delay = 300,
}: SeaAdvisoryProps) {
  const p = userData?.nearestPort || {};
  const hasNearestPort = !!(p.city && p.latitude && p.longitude);

  const lat = p.latitude ?? latitude;
  const lng = p.longitude ?? longitude;

  // ✅ BINAGO: Location display logic
  const locationDisplay = hasNearestPort
    ? `${p.city}, ${p.province || province}`
    : `${location}, ${province}`;

  const isPreview = condition !== '';

  const [cond, setCond] = useState<SeaCondition>(isPreview ? (condition as SeaCondition) : 'calm');
  const [waveHeight, setWaveHeight] = useState(isPreview ? PREVIEW_HEIGHTS[condition as SeaCondition] : 0);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [updated, setUpdated] = useState(new Date());

  const entranceAnim = useSlideUpFadeIn(delay, 500, 30);
  const refreshScale = useRef(new Animated.Value(1)).current;
  const anim = useRef(new Animated.Value(0)).current;
  const { ampRatio, speed, icon, label, color } = CONFIG[cond];
  const [W, setW] = useState(0);
  const baseY = height * 0.78;
  const amp = height * ampRatio;

  const fetchData = async () => {
    if (!autoFetch || isPreview || loading) return;
    console.log('[SeaAdvisory Component] Triggering fetchData()...');
    setLoading(true);

    try {
      const result = await fetchSeaConditionData(lat, lng);

      console.log('[SeaAdvisory Component] Received data from seaCondition module:');
      console.log('[SeaAdvisory Component] Data Payload:', JSON.stringify(result, null, 2));

      if (result.noData) {
        console.warn('[SeaAdvisory Component] Setting UI state to noData');
        setNoData(true);
      } else {
        setNoData(false);
        setCond(result.condition);
        setWaveHeight(result.waveHeight);
        setIsWarning(result.isPAGASAWarning);
        setUpdated(new Date());

        console.log('[SeaAdvisory Component] Updated UI State:');
        console.log(` - Condition: ${result.condition} (${CONFIG[result.condition].label})`);
        console.log(` - Wave Height: ${result.waveHeight}m`);
        console.log(` - Is Warning: ${result.isPAGASAWarning}`);
        console.log(` - Source: ${result.source}`);
      }
    } catch (err) {
      console.error('[SeaAdvisory Component] Error in fetchData:', err);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    console.log('[SeaAdvisory Component] Refresh button clicked by user.');
    Animated.spring(refreshScale, { toValue: 0.7, useNativeDriver: true, tension: 300, friction: 20 }).start(() =>
      Animated.spring(refreshScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start()
    );
    fetchData();
  };

  useEffect(() => {
    if (!isPreview) return;
    console.log('[SeaAdvisory Component] Preview mode active with condition:', condition);
    const c = condition as SeaCondition;
    setCond(c);
    setWaveHeight(PREVIEW_HEIGHTS[c]);
  }, [condition]);

  useEffect(() => {
    if (autoFetch && !isPreview) {
      console.log('[SeaAdvisory Component] AutoFetch effect triggered for lat:', lat, 'lng:', lng);
      fetchData();
    }
  }, [autoFetch, isPreview, lat, lng]);

  useEffect(() => {
    anim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [speed]);

  const makeWave = (yOffset: number, ampMult: number) => {
    const a = amp * ampMult;
    const flat = (dir: number) =>
      `M0 ${baseY + yOffset} Q${W / 4} ${baseY + yOffset + a * dir} ${W / 2} ${baseY + yOffset} Q${W * 3 / 4} ${baseY + yOffset - a * dir} ${W} ${baseY + yOffset} V${height} H0Z`;
    return anim.interpolate({ inputRange: [0, 1], outputRange: [flat(-1), flat(1)] });
  };

  const dBack = useMemo(() => makeWave(-10, 0.35), [anim, amp, height, W]);
  const dMid = useMemo(() => makeWave(-5, 0.5), [anim, amp, height, W]);
  const dFront = useMemo(() => makeWave(0, 1), [anim, amp, height, W]);

  return (
    <Animated.View
      style={[entranceAnim, { paddingHorizontal: 15 }]}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
    >
      <TouchableOpacity
        style={[
          {
            height,
            width: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            paddingHorizontal: 20,
            paddingVertical: 16,
            justifyContent: 'center'
          },
          style
        ]}
        onPress={() => { autoFetch && !isPreview && fetchData(); onPress?.(); }}
        activeOpacity={0.85}
        disabled={!onPress && (!autoFetch || isPreview)}
      >
        <BlurView intensity={90} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <LinearGradient colors={[`${color}55`, `${color}33`]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        {W > 0 && (
          <Svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
            <AnimatedPath d={dBack} fill={color} fillOpacity={0.18} />
            <AnimatedPath d={dMid} fill={color} fillOpacity={0.24} />
            <AnimatedPath d={dFront} fill={color} fillOpacity={0.32} />
          </Svg>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          <View>
            {/* ✅ BINAGO: Display logic para sa location at condition */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome6 name={icon} size={20} color={color} iconStyle="solid" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: '#1f2937', fontWeight: isWarning ? '700' : '400' }}>
                {loading
                  ? 'Loading...'
                  : noData
                    ? 'Default location'  // ✅ Eto ang "Default" text
                    : isWarning
                      ? `${locationDisplay} (Gale Warning)`
                      : `${locationDisplay} (${label})`}  {/* ✅ Eto ang "(Kalmado)" */}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 }}>
              <Text style={{ fontSize: 40, fontWeight: '700', color: '#111827', lineHeight: 48 }}>
                {loading || noData ? '--' : waveHeight.toFixed(1)}
              </Text>
              {!loading && !noData && (
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginLeft: 3, marginBottom: 8 }}>
                  m
                </Text>
              )}
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{fmtTime(updated)}</Text>
            <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{fmtDate(updated)}</Text>
            {autoFetch && !isPreview && (
              <Animated.View style={{ transform: [{ scale: refreshScale }], marginTop: 6 }}>
                <TouchableOpacity
                  onPress={refresh}
                  disabled={loading}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: 'rgba(255,255,255,0.55)',
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 14,
                    minHeight: 32,
                  }}
                >
                  <FontAwesome6 name="rotate-right" size={12} color="#1f2937" iconStyle="solid" />
                  <Text style={{ fontSize: 11, color: '#1f2937', fontWeight: '600' }}>
                    {loading ? 'Loading...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}