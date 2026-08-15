// screens/passenger/passenger.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectPort from './home/selectPort';
import Schedule from './home/schedule';
import { colors } from '../../../constants/colors';
import {
  subscribeToPorts,
  subscribeToVessels,
  subscribeToRoutes,
  subscribeToTripsForRoute,
  Port,
  Vessel,
  Route,
  Trip
} from '../dashboard/dashboardFunctions';
import SeaAdvisory from './home/seaAdvisory';
import TawidHeader from '../../../components/tawidHeader';

interface PaxHomeProps {
  userData?: any;
}

export default function PaxHome({ userData }: PaxHomeProps) {
  const [loading, setLoading] = useState(true);
  const [ports, setPorts] = useState<Port[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tripsMap, setTripsMap] = useState<Record<string, Trip[]>>({});
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const autoSelectDoneRef = useRef(false);
  const preferredCity = userData?.nearestPort?.city ?? null;
  const userPhoto = userData?.photo ?? null;

  useEffect(() => {
    const unsubPorts = subscribeToPorts(setPorts);
    const unsubVessels = subscribeToVessels(setVessels);
    const unsubRoutes = subscribeToRoutes((r) => {
      setRoutes(r);
      setLoading(false);
    });
    return () => {
      unsubPorts();
      unsubVessels();
      unsubRoutes();
    };
  }, []);

  useEffect(() => {
    const subs: Record<string, () => void> = {};
    routes.forEach((route) => {
      subs[route.id] = subscribeToTripsForRoute(route.id, (trips) => {
        setTripsMap((prev) => ({ ...prev, [route.id]: trips }));
      });
    });
    return () => {
      Object.values(subs).forEach((unsub) => unsub());
    };
  }, [routes]);

  const getPortName = (portId: string) => {
    const port = ports.find((p) => p.id === portId);
    return port?.name || 'Unknown Port';
  };

  const origins = useMemo(() => {
    return ports.map((p) => p.name);
  }, [ports]);

  const destinations = useMemo(() => {
    if (!selectedOrigin) return [];
    const originPort = ports.find((p) => p.name === selectedOrigin);
    if (!originPort) return [];
    const destIds = routes
      .filter((r) => r.originPortId === originPort.id)
      .map((r) => r.destinationPortId);
    return destIds.map((id) => getPortName(id));
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

  const schedule = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return [];
    const originPort = ports.find((p) => p.name === selectedOrigin);
    const destPort = ports.find((p) => p.name === selectedDestination);
    if (!originPort || !destPort) return [];
    const route = routes.find(
      (r) => r.originPortId === originPort.id && r.destinationPortId === destPort.id
    );
    if (!route) return [];
    const trips = tripsMap[route.id] || [];
    return trips.map((trip) => {
      const vessel = vessels.find(v => v.id === trip.vesselId);
      return {
        vessel: vessel?.name || 'Unknown Vessel',
        vesselType: trip.type || vessel?.type || 'Fastcraft',
        time: trip.time,
        status: trip.status,
      };
    });
  }, [selectedOrigin, selectedDestination, ports, routes, tripsMap, vessels]);

  const isRouteSelected = selectedOrigin && selectedDestination;

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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.brand} />
        <View style={{ flex: 1 }}>
          <TawidHeader userData={userData} />
          <View style={{ flex: 1, gap: 15 }}>
            <SeaAdvisory userData={userData} height={100} autoFetch />
            <SelectPort
              label="Pinagmulan (Origin)"
              selectedValue={selectedOrigin}
              options={origins}
              onValueChange={(value) => {
                autoSelectDoneRef.current = true;
                setSelectedOrigin(value);
                setSelectedDestination(null);
              }}
              placeholder="Pinagmulan (Origin)"
              animationDelay={100}
              type="origin"
              highlightValue={preferredCity}
            />
            <SelectPort
              label="Pupuntahan (Destination)"
              selectedValue={selectedDestination}
              options={destinations}
              onValueChange={(value) => {
                autoSelectDoneRef.current = true;
                setSelectedDestination(value);
              }}
              placeholder="Pupuntahan (Destination)"
              animationDelay={250}
              type="destination"
            />
            <Schedule
              schedule={schedule}
              isRouteSelected={isRouteSelected}
              routeUpdatedAt={selectedRoute?.updatedAt}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}