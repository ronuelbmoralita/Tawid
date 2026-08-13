// ============================================================
// firebase/scheduleService.ts
// ============================================================
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  writeBatch,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore, auth } from '../../../firebase/firebaseConfig';

// ============================================================
// TYPES
// ============================================================
export type Port = {
  id: string;
  name: string;
  province: string;
  latitude?: number;
  longitude?: number;
};

export type Vessel = {
  id: string;
  name: string;
  type: 'Fastcraft' | 'RORO' | 'Cargo';
};

export type Route = {
  id: string;
  originPortId: string;
  destinationPortId: string;
  updatedAt?: any; // Firestore Timestamp
};

export type Trip = {
  id: string;
  routeId: string;
  vesselId: string;
  time: string;
  status: 'Sailing' | 'No Sailing';
  type: 'Fastcraft' | 'RORO' | 'Cargo';
};

// ============================================================
// COMPANY / SUSPENSION
// ============================================================
export const subscribeToSuspension = (callback: (isSuspended: boolean) => void) => {
  return onSnapshot(doc(firestore, 'company', 'details'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().isSuspended || false);
    }
  });
};

export const toggleSuspension = async (suspend: boolean) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  await updateDoc(doc(firestore, 'company', 'details'), {
    isSuspended: suspend,
    updatedAt: new Date(),
  });
};

// ============================================================
// PORTS
// ============================================================
export const subscribeToPorts = (callback: (ports: Port[]) => void) => {
  const portsRef = collection(firestore, 'ports');
  return onSnapshot(portsRef, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Port)));
  });
};

export const addPort = async (name: string, province: string, latitude?: number, longitude?: number) => {
  const data: any = { name, province };
  if (latitude !== undefined && latitude !== null) data.latitude = latitude;
  if (longitude !== undefined && longitude !== null) data.longitude = longitude;
  return addDoc(collection(firestore, 'ports'), data);
};

export const updatePort = async (portId: string, name: string, province: string, latitude?: number, longitude?: number) => {
  const data: any = { name, province };
  if (latitude !== undefined && latitude !== null) data.latitude = latitude;
  if (longitude !== undefined && longitude !== null) data.longitude = longitude;
  return updateDoc(doc(firestore, 'ports', portId), data);
};

export const deletePort = async (portId: string) => {
  return deleteDoc(doc(firestore, 'ports', portId));
};

// ============================================================
// VESSELS
// ============================================================
export const subscribeToVessels = (callback: (vessels: Vessel[]) => void) => {
  const vesselsRef = collection(firestore, 'vessels');
  return onSnapshot(vesselsRef, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vessel)));
  });
};

export const addVessel = async (name: string, type: Vessel['type']) => {
  return addDoc(collection(firestore, 'vessels'), { name, type });
};

export const updateVessel = async (vesselId: string, patch: Partial<Omit<Vessel, 'id'>>) => {
  return updateDoc(doc(firestore, 'vessels', vesselId), patch);
};

export const deleteVessel = async (vesselId: string) => {
  return deleteDoc(doc(firestore, 'vessels', vesselId));
};

// ============================================================
// ROUTES
// ============================================================
export const subscribeToRoutes = (callback: (routes: Route[]) => void) => {
  const routesRef = collection(firestore, 'routes');
  return onSnapshot(routesRef, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Route)));
  });
};

export const addRoute = async (originPortId: string, destinationPortId: string) => {
  return addDoc(collection(firestore, 'routes'), {
    originPortId,
    destinationPortId,
    updatedAt: serverTimestamp()
  });
};

// Generic route update — call this any time the route doc itself
// needs to change (or just needs its updatedAt "touched").
// patch defaults to {} so updateRoute(routeId) alone just touches updatedAt.
export const updateRoute = async (
  routeId: string,
  patch: Partial<Omit<Route, 'id' | 'updatedAt'>> = {}
) => {
  return updateDoc(doc(firestore, 'routes', routeId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
};

export const deleteRoute = async (routeId: string) => {
  const tripsQuery = query(collection(firestore, 'routeDetails'), where('routeId', '==', routeId));
  const tripsSnap = await getDocs(tripsQuery);
  const batch = writeBatch(firestore);
  tripsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(firestore, 'routes', routeId));
  return batch.commit();
};

// ============================================================
// TRIPS
// ============================================================
export const subscribeToTripsForRoute = (
  routeId: string,
  callback: (trips: Trip[]) => void
) => {
  const tripsRef = collection(firestore, 'routeDetails');
  const tripsQuery = query(tripsRef, where('routeId', '==', routeId));
  return onSnapshot(tripsQuery, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip)));
  });
};

// Adding/updating/deleting a trip also "touches" the parent route's
// updatedAt, since routeDetails is a flat collection (not a subcollection)
// and passenger-side reads rely on routes.updatedAt to know something changed.
// Batched so the trip write and the route touch commit atomically.
export const addTrip = async (
  routeId: string,
  vesselId: string,
  time: string,
  status: Trip['status'],
  type: Trip['type'] = 'Fastcraft'
) => {
  const batch = writeBatch(firestore);
  const tripRef = doc(collection(firestore, 'routeDetails'));
  batch.set(tripRef, { routeId, vesselId, time, status, type });
  batch.update(doc(firestore, 'routes', routeId), { updatedAt: serverTimestamp() });
  return batch.commit();
};

export const updateTrip = async (
  routeId: string,
  tripId: string,
  patch: Partial<Omit<Trip, 'id'>>
) => {
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'routeDetails', tripId), patch);
  batch.update(doc(firestore, 'routes', routeId), { updatedAt: serverTimestamp() });
  return batch.commit();
};

export const deleteTrip = async (routeId: string, tripId: string) => {
  const batch = writeBatch(firestore);
  batch.delete(doc(firestore, 'routeDetails', tripId));
  batch.update(doc(firestore, 'routes', routeId), { updatedAt: serverTimestamp() });
  return batch.commit();
};

// ============================================================
// HELPERS
// ============================================================
export const getRoutesByPort = (routes: Route[], portId: string): Route[] => {
  return routes.filter(route => route.originPortId === portId || route.destinationPortId === portId);
};

export const getTripsByRoute = (tripsMap: Record<string, Trip[]>, routeId: string): Trip[] => {
  return tripsMap[routeId] || [];
};

export const getVesselName = (vessels: Vessel[], vesselId: string): string => {
  const vessel = vessels.find(v => v.id === vesselId);
  return vessel?.name || 'Unknown Vessel';
};