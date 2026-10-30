// screens/passenger/components/schedule.tsx
import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { Text, View, Animated, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import { subscribeToSuspension } from '../../dashboard/dashboardFunctions';
import { useSlideUpFadeIn, useScaleFadeIn, useStaggeredItem } from '../../../../constants/animation';
import ScheduleModal, { ScheduleModalRef } from './scheduleModal';
import TawidCard from '../../../../components/tawidCard';
import { useTabBarSpace } from '../../../tabStyle';
import ScheduleSkeleton from './scheduleSkeleton';
import BreathingDot from './scheduleBreathingDot';
import { useNavigation } from '@react-navigation/native';

interface ScheduleItem {
  vessel: string;
  vesselType: 'Fastcraft' | 'RORO' | 'Cargo';
  time: string;
  status: 'Sailing' | 'No Sailing';
}

interface ScheduleProps {
  schedule: ScheduleItem[];
  isRouteSelected: boolean | string | null;
  routeUpdatedAt?: any;
  loading?: boolean;
  children?: React.ReactNode;
}

interface SectionProps {
  title: string;
  isSailing: boolean;
  data: ScheduleItem[];
  startDelay?: number;
  isSuspended?: boolean;
}

const vesselStyles = {
  Fastcraft: { icon: 'bolt', color: '#3B82F6' },
  RORO: { icon: 'ship', color: colors.brand },
  Cargo: { icon: 'box', color: colors.orange },
} as const;

const FALLBACK_VESSEL = { icon: 'ferry', color: '#6B7280' } as const;
const getVesselStyle = (type: string) =>
  vesselStyles[type as keyof typeof vesselStyles] ?? FALLBACK_VESSEL;

const formatUpdatedAt = (timestamp: any): string => {
  if (!timestamp?.toDate) return '';
  const d = timestamp.toDate();
  return `${d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};

// Helper para malaman kung past na yung oras
const isPastTime = (timeStr: string): boolean => {
  if (!timeStr || timeStr === '00:00') return false;
  try {
    const now = new Date();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    return scheduledTime < now;
  } catch {
    return false;
  }
};

// ============ TRIP ROW ============
const TripRow = memo(function TripRow({
  trip,
  animationDelay = 0,
  isSuspended = false,
}: {
  trip: ScheduleItem;
  animationDelay?: number;
  isSuspended?: boolean;
}) {
  const { opacity, transform } = useStaggeredItem(animationDelay, 0, 50);
  const isNoSailing = trip.status === 'No Sailing' || isSuspended;
  const style = getVesselStyle(trip.vesselType);
  
  // Check kung lumipas na
  const isDeparted = !isNoSailing && isPastTime(trip.time);

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        opacity: isDeparted ? 0.45 : opacity, // faded kung departed
        transform,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontSize: 15,
            color: isDeparted ? 'rgba(0,0,0,0.6)' : colors.black,
            fontWeight: '600',
            textDecorationLine: isNoSailing ? 'line-through' : 'none',
          }}
        >
          {trip.vessel}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 4,
            backgroundColor: isDeparted ? 'rgba(0,0,0,0.05)' : style.color + '15',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: isDeparted ? 'rgba(0,0,0,0.1)' : style.color + '30',
          }}
        >
          <FontAwesome6
            name={style.icon}
            size={9}
            color={isDeparted ? 'rgba(0,0,0,0.4)' : style.color}
            iconStyle="solid"
          />
          <Text
            style={{
              fontSize: 10,
              color: isDeparted ? 'rgba(0,0,0,0.4)' : style.color,
              fontWeight: '600',
            }}
          >
            {trip.vesselType}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: isNoSailing ? colors.red : isDeparted ? 'rgba(0,0,0,0.4)' : colors.black,
          textDecorationLine: isDeparted ? 'line-through' : 'none',
        }}
      >
        {isNoSailing ? '00:00' : trip.time}
      </Text>
    </Animated.View>
  );
});

// ============ SCHEDULE SECTION ============
const ScheduleSection = memo(function ScheduleSection({
  title,
  isSailing,
  data,
  startDelay = 0,
  isSuspended = false,
}: SectionProps) {
  const { opacity, transform } = useScaleFadeIn(startDelay, 400, 0.95);
  const color = isSailing && !isSuspended ? colors.brand : colors.red;

  return (
    <TawidCard color={color} animatedStyle={{ opacity, transform }}>
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
          {isSuspended ? (
            <FontAwesome6
              name="ban"
              size={11}
              color={color}
              iconStyle="solid"
              style={{ marginRight: 8 }}
            />
          ) : (
            <BreathingDot color={color} size={10} active={isSailing} style={{ marginRight: 8 }} />
          )}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.black,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {title}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: color + '30',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
          }}
        >
          <FontAwesome6 name="route" size={12} color={colors.black} iconStyle="solid" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.black }}>
            {data.length} {data.length === 1 ? 'trip' : 'trips'}
          </Text>
        </View>
      </View>

      {data.map((item, index) => (
        <TripRow
          key={`${item.vessel}-${item.time}-${index}`}
          trip={item}
          animationDelay={index}
          isSuspended={isSuspended}
        />
      ))}
    </TawidCard>
  );
});

// ============ NOTICE CARD ============
const NoticeCard = memo(function NoticeCard({ onPress }: { onPress: () => void }) {
  const { opacity, transform } = useSlideUpFadeIn(0, 400, 30);

  const btnScale = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  // pulse ng icon: 3 beses lang, tapos titigil
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(600),
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(iconPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [iconPulse]);

  const pressBtn = (pressed: boolean) =>
    Animated.spring(btnScale, {
      toValue: pressed ? 0.92 : 1,
      useNativeDriver: true,
      stiffness: pressed ? 500 : 280,
      damping: pressed ? 30 : 8,
      mass: 1,
    }).start();

  return (
    <Animated.View
      style={{
        opacity,
        transform,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.brand,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.brand + '30',
      }}
    >
      <Animated.View style={{ transform: [{ scale: iconPulse }] }}>
        <FontAwesome6 name="circle-info" size={24} color={colors.black} iconStyle="solid" />
      </Animated.View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.black }}>
          Booking not available yet
        </Text>
        <Text style={{ fontSize: 12, color: colors.black, opacity: 0.7 }} numberOfLines={2}>
          Request activation for your port.
        </Text>
      </View>
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.black,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 6,
            // subtle drop shadow
            shadowColor: 'rgba(0,0,0,0.5)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={onPress}
          onPressIn={() => pressBtn(true)}
          onPressOut={() => pressBtn(false)}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '600' }}>Request</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

// ============ MAIN ============
const Schedule: React.FC<ScheduleProps> = ({
  schedule,
  isRouteSelected,
  routeUpdatedAt,
  loading = false,
  children,
}) => {
  const bottomSpace = useTabBarSpace();
  const [isSuspended, setIsSuspended] = useState(false);
  const petitionRef = useRef<ScheduleModalRef>(null);
  const { opacity, transform } = useSlideUpFadeIn(200, 600, 30);

  useEffect(() => {
    const unsub = subscribeToSuspension(setIsSuspended);
    return () => unsub();
  }, []);

const navigation = useNavigation<any>();
const handleRequestActivation = useCallback(() => navigation.navigate('Request'), [navigation]);

  const sections = useMemo(() => {
    const sailing = schedule.filter((t) => t.status === 'Sailing');
    const noSailing = schedule.filter((t) => t.status === 'No Sailing');
    return [
      { id: 'sailing', isSailing: true, title: isSuspended ? 'CANCELLED' : 'SAILING', data: sailing },
      { id: 'nosailing', isSailing: false, title: isSuspended ? 'CANCELLED' : 'NO SAILING', data: noSailing },
    ].filter((s) => s.data.length > 0);
  }, [schedule, isSuspended]);

  const lastUpdated = useMemo(() => formatUpdatedAt(routeUpdatedAt), [routeUpdatedAt]);

  return (
    <>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: bottomSpace }}
        style={{ opacity, transform }}
      >
        <View style={{ paddingHorizontal: 15, paddingBottom: 15, gap: 15 }}>
          {children && <View>{children}</View>}

          {loading ? (
            <ScheduleSkeleton />
          ) : !isRouteSelected ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, textAlign: 'center' }}>
                Please select both Origin and Destination ports to view the schedule
              </Text>
            </View>
          ) : schedule.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, textAlign: 'center' }}>
                No trips available for this route
              </Text>
            </View>
          ) : (
            <>
              {isSuspended ? (
                <View
                  style={{
                    backgroundColor: '#FF6B6B15',
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#FF6B6B30',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <FontAwesome6 name="ban" size={13} color={colors.red} iconStyle="solid" />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.red }}>
                      All Trips Cancelled
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.black, opacity: 0.7 }}>
                    Please check back later for updates.
                  </Text>
                </View>
              ) : (
                <NoticeCard onPress={handleRequestActivation} />
              )}

              {!!lastUpdated && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: colors.brand + '30',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 10,
                    }}
                  >
                    <FontAwesome6 name="clock" size={10} color={colors.black} iconStyle="solid" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.black }}>
                      Last updated
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: colors.brand + '30',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.black }}>
                      {lastUpdated}
                    </Text>
                  </View>
                </View>
              )}

              {sections.map((section, i) => (
                <ScheduleSection
                  key={section.id}
                  title={section.title}
                  isSailing={section.isSailing}
                  data={section.data}
                  startDelay={i * 150}
                  isSuspended={isSuspended}
                />
              ))}
            </>
          )}
        </View>
      </Animated.ScrollView>

      <ScheduleModal ref={petitionRef} />
    </>
  );
};

export default Schedule;