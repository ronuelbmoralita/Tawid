// screens/passenger/paxHome.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../../constants/colors';
import {
  subscribeToPorts,
  subscribeToVessels,
  subscribeToRoutes,
  subscribeToTripsForRoute,
  Port,
  Vessel,
  Route,
  Trip,
} from '../dashboard/dashboardFunctions';
import TawidHeader from '../../../header/tawidHeader';
import SeaAdvisory from './home/seaAdvisory';
import SelectPort from './home/selectPort';
import Schedule from './home/schedule';

interface PaxHomeProps {
  userData?: any;
}

// ginagawang minuto ang "4:45 PM" para maisaayos ang schedule ayon sa oras
const toMinutes = (t: string): number => {
  const m = t?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return Number.MAX_SAFE_INTEGER; // hindi mabasa → ilalagay sa dulo
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m[2], 10);
};

export default function PaxHome({ userData }: PaxHomeProps) {
  const [ports, setPorts] = useState<Port[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tripsMap, setTripsMap] = useState<Record<string, Trip[]>>({});
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  const autoSelectDoneRef = useRef(false);
  const preferredCity = userData?.nearestPort?.city ?? null;

  useEffect(() => {
    const unsubPorts = subscribeToPorts(setPorts);
    const unsubVessels = subscribeToVessels(setVessels);
    const unsubRoutes = subscribeToRoutes(setRoutes);

    return () => {
      unsubPorts();
      unsubVessels();
      unsubRoutes();
    };
  }, []);

  const getPortName = (portId: string) => {
    return ports.find((p) => p.id === portId)?.name || 'Unknown Port';
  };

  const origins = useMemo(() => {
    return ports.map((p) => p.name);
  }, [ports]);

  const destinations = useMemo(() => {
    if (!selectedOrigin) return [];
    const originPort = ports.find((p) => p.name === selectedOrigin);
    if (!originPort) return [];

    return routes
      .filter((r) => r.originPortId === originPort.id)
      .map((r) => getPortName(r.destinationPortId));
  }, [selectedOrigin, routes, ports]);

  const selectedRoute = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return null;
    const originPort = ports.find((p) => p.name === selectedOrigin);
    const destPort = ports.find((p) => p.name === selectedDestination);
    if (!originPort || !destPort) return null;

    return routes.find(
      (r) => r.originPortId === originPort.id && r.destinationPortId === destPort.id
    ) ?? null;
  }, [selectedOrigin, selectedDestination, ports, routes]);

  // NEW: isang listener lang, para sa napiling route (dating lahat ng route)
  useEffect(() => {
    if (!selectedRoute) return;
    const routeId = selectedRoute.id;
    const unsub = subscribeToTripsForRoute(routeId, (trips) => {
      setTripsMap((prev) => ({ ...prev, [routeId]: trips }));
    });
    return () => unsub();
  }, [selectedRoute?.id]);

  const schedule = useMemo(() => {
    if (!selectedRoute) return [];

    const trips = tripsMap[selectedRoute.id] || [];
    return trips
      .map((trip) => {
        const vessel = vessels.find((v) => v.id === trip.vesselId);
        return {
          vessel: vessel?.name || 'Unknown Vessel',
          vesselType: trip.type || vessel?.type || 'Fastcraft',
          time: trip.time,
          status: trip.status,
        };
      })
      // nakaayos ayon sa oras ng alis (stable ang sort kaya mananatili ang pagkakasunod ng magkaparehong oras)
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  }, [selectedRoute, tripsMap, vessels]);

  const isRouteSelected = !!selectedOrigin && !!selectedDestination;

  // loading hangga't wala pa ang ports/routes, o ang trips ng napiling route
  const scheduleLoading =
    ports.length === 0 ||
    routes.length === 0 ||
    (!!selectedRoute && tripsMap[selectedRoute.id] === undefined);

  useEffect(() => {
    if (autoSelectDoneRef.current) return;
    if (ports.length === 0 || routes.length === 0) return;

    let originPort: Port | undefined;
    let matchedRoute: Route | undefined;

    if (preferredCity) {
      originPort = ports.find((p) => p.name === preferredCity);
      if (originPort) {
        matchedRoute = routes.find((r) => r.originPortId === originPort!.id);
      }
    }

    if (!matchedRoute) {
      matchedRoute = routes[0];
      originPort = ports.find((p) => p.id === matchedRoute!.originPortId);
    }

    if (!originPort || !matchedRoute) return;

    const destPort = ports.find((p) => p.id === matchedRoute!.destinationPortId);
    if (!destPort) return;

    setSelectedOrigin(originPort.name);
    setSelectedDestination(destPort.name);
    autoSelectDoneRef.current = true;
  }, [ports, routes, preferredCity]);

  const handleSwap = () => {
    if (!selectedOrigin || !selectedDestination) return;

    const o = ports.find((p) => p.name === selectedOrigin);
    const d = ports.find((p) => p.name === selectedDestination);
    if (!o || !d) return;

    const reverseExists = routes.some(
      (r) => r.originPortId === d.id && r.destinationPortId === o.id
    );

    autoSelectDoneRef.current = true;
    setSelectedOrigin(selectedDestination);
    setSelectedDestination(reverseExists ? selectedOrigin : null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.brand} />
        <View style={{ flex: 1 }}>
          <TawidHeader userData={userData} />

          <View style={{ flex: 1, gap: 15 }}>
            <SeaAdvisory userData={userData} height={100} autoFetch />

            <View style={{ paddingHorizontal: 15 }}>
              <SelectPort
                origins={origins}
                destinations={destinations}
                selectedOrigin={selectedOrigin}
                selectedDestination={selectedDestination}
                onOriginChange={(value) => {
                  autoSelectDoneRef.current = true;
                  setSelectedOrigin(value);
                  setSelectedDestination(null);
                }}
                onDestinationChange={(value) => {
                  autoSelectDoneRef.current = true;
                  setSelectedDestination(value);
                }}
                onSwap={handleSwap}
                canSwap={isRouteSelected}
                preferredCity={preferredCity}
                loading={ports.length === 0 || routes.length === 0}
              />
            </View>

            <Schedule
              schedule={schedule}
              isRouteSelected={isRouteSelected}
              routeUpdatedAt={selectedRoute?.updatedAt}
              loading={scheduleLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}