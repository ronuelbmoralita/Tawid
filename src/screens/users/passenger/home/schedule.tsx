// screens/passenger/components/schedule.tsx
import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { Text, View, Animated, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import { subscribeToSuspension } from '../../dashboard/dashboardFunctions';
import {
  useSlideUpFadeIn,
  useScaleFadeIn,
  useStaggeredItem,
} from '../../../../constants/animation';
import ScheduleModal, { ScheduleModalRef } from './scheduleModal';
import TawidCard from '../../../../components/tawidCard';
import { useTabBarSpace } from '../../../../tabStyle';

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
  children?: React.ReactNode;
}

interface SectionProps {
  title: string;
  isSailing: boolean;
  data: ScheduleItem[];
  startDelay?: number;
  isSuspended?: boolean;
  onBookPress: () => void;
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
  return `${d.toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })} at ${d.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
};

// ============ TRIP ROW ============
const TripRow = memo(function TripRow({
  trip,
  animationDelay = 0,
  isSuspended = false,
  onBookPress,
}: {
  trip: ScheduleItem;
  animationDelay?: number;
  isSuspended?: boolean;
  onBookPress: () => void;
}) {
  const { opacity, transform } = useStaggeredItem(animationDelay, 0, 50);
  const isNoSailing = trip.status === 'No Sailing' || isSuspended;
  const style = getVesselStyle(trip.vesselType);

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        opacity,
        transform,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            color: colors.black,
            fontWeight: '600',
            textDecorationLine: isNoSailing ? 'line-through' : 'none',
          }}
        >
          {trip.vessel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: style.color + '15',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: style.color + '30',
              marginRight: 8,
            }}
          >
            <FontAwesome6 name={style.icon} size={9} color={style.color} iconStyle="solid" />
            <Text style={{ fontSize: 10, color: style.color, fontWeight: '600' }}>
              {trip.vesselType}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              color: isNoSailing ? colors.red : colors.black,
              fontWeight: '500',
            }}
          >
            {isNoSailing ? '00:00' : trip.time}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: isNoSailing ? '#ccc' : colors.brand,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 6,
          opacity: isNoSailing ? 0.5 : 1,
          minWidth: 70,
          alignItems: 'center',
        }}
        onPress={onBookPress}
        disabled={isNoSailing}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: isNoSailing ? '#666' : colors.white,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {isNoSailing ? 'Unavailable' : 'Book'}
        </Text>
      </TouchableOpacity>
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
  onBookPress,
}: SectionProps) {
  const { opacity, transform } = useScaleFadeIn(startDelay, 400, 0.95);
  const color = isSailing && !isSuspended ? colors.brand : colors.red;

  return (
    <TawidCard color={color} animatedStyle={{ opacity, transform }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
          paddingHorizontal: 10,
        }}
      >
        {isSuspended ? (
          <FontAwesome6
            name="ban"
            size={11}
            color={color}
            iconStyle="solid"
            style={{ marginRight: 8 }}
          />
        ) : (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: color,
              marginRight: 8,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {title}
        </Text>
      </View>

      {data.map((item, index) => (
        <TripRow
          key={`${item.vessel}-${item.time}-${index}`}
          trip={item}
          animationDelay={index}
          isSuspended={isSuspended}
          onBookPress={onBookPress}
        />
      ))}
    </TawidCard>
  );
});

// ============ NOTICE CARD ============
const NoticeCard = memo(function NoticeCard({ onPress }: { onPress: () => void }) {
  const { opacity, transform } = useSlideUpFadeIn(300, 400, 30);

  return (
    <Animated.View
      style={{
        opacity,
        transform,
        backgroundColor: 'rgba(255, 193, 7, 0.15)',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 193, 7, 0.3)',
        gap: 5,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <FontAwesome6
          name="triangle-exclamation"
          size={13}
          color={colors.orange}
          iconStyle="solid"
        />
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.orange }}>
          Tawid Not Yet Activated
        </Text>
      </View>
      <Text style={{ fontSize: 13, color: '#666', textAlign: 'justify' }}>
        Booking and other features are unavailable. Request activation from your
        municipality.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: colors.brand,
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 6,
          alignSelf: 'flex-start',
        }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={{ color: colors.white, fontSize: 13, fontWeight: '600' }}>
          Request Activation
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============ MAIN ============
const Schedule: React.FC<ScheduleProps> = ({
  schedule,
  isRouteSelected,
  routeUpdatedAt,
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

  const handleRequestActivation = useCallback(() => petitionRef.current?.open(), []);

  const sections = useMemo(() => {
    const sailing = schedule.filter((t) => t.status === 'Sailing');
    const noSailing = schedule.filter((t) => t.status === 'No Sailing');

    return [
      {
        id: 'sailing',
        isSailing: true,
        title: isSuspended ? 'CANCELLED' : 'SAILING',
        data: sailing,
      },
      {
        id: 'nosailing',
        isSailing: false,
        title: isSuspended ? 'CANCELLED' : 'NO SAILING',
        data: noSailing,
      },
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

          {!isRouteSelected ? (
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
              {!!lastUpdated && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <FontAwesome6
                      name="clock"
                      size={10}
                      color="rgba(0,0,0,0.55)"
                      iconStyle="solid"
                    />
                    <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)', fontWeight: '500' }}>
                      Last updated
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.75)', fontWeight: '600' }}>
                    {lastUpdated}
                  </Text>
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
                  onBookPress={handleRequestActivation}
                />
              ))}

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
                  <Text style={{ fontSize: 13, color: '#666' }}>
                    Please check back later for updates.
                  </Text>
                </View>
              ) : (
                <NoticeCard onPress={handleRequestActivation} />
              )}
            </>
          )}
        </View>
      </Animated.ScrollView>

      <ScheduleModal ref={petitionRef} />
    </>
  );
};

export default Schedule;