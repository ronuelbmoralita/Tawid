// screens/dashboard/components/routes.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import { Port, Vessel, Route, Trip, subscribeToPorts, subscribeToVessels, subscribeToRoutes, subscribeToTripsForRoute, addRoute, deleteRoute, addTrip, updateTrip, deleteTrip, getTripsByRoute, getVesselName } from '../dashboardFunctions';
import TawidModal from '../../../../components/tawidModal';
import { tawidNotif } from '../../../../firebase/tawidNotification';

// Route Form Component (unchanged - already compact)
const RouteForm = ({ initial, ports, routes, formRef }: any) => {
  const [local, setLocal] = useState(initial);
  const update = (patch: any) => { const updated = { ...local, ...patch }; setLocal(updated); formRef.current = updated; };
  const used = routes.filter((r: Route) => r.originPortId === local.originPortId).map((r: Route) => r.destinationPortId);
  const available = ports.filter((p: Port) => p.id !== local.originPortId && !used.includes(p.id));
  const hasAvailable = available.length > 0;

  useEffect(() => {
    if (local.destinationPortId && !available.some((p: Port) => p.id === local.destinationPortId))
      update({ destinationPortId: '' });
  }, [local.originPortId]);

  if (!ports?.length) return <View style={{ padding: 20, alignItems: 'center' }}><Text style={{ color: '#999' }}>No ports available.</Text></View>;

  const PortChip = ({ port, type }: any) => {
    const isOrigin = type === 'origin';
    const disabled = isOrigin
      ? !ports.filter((p: Port) => p.id !== port.id).some((p: Port) => !routes.filter((r: Route) => r.originPortId === port.id).map((r: Route) => r.destinationPortId).includes(p.id))
      : port.id === local.originPortId || used.includes(port.id) || !hasAvailable;
    const active = isOrigin ? local.originPortId === port.id : local.destinationPortId === port.id;
    return (
      <TouchableOpacity key={port.id} disabled={disabled} onPress={() => update(isOrigin ? { originPortId: port.id, destinationPortId: '' } : { destinationPortId: port.id })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, opacity: disabled ? 0.4 : 1, backgroundColor: active ? colors.brand : '#e0e0e0' }}>
        <Text style={{ color: active ? 'white' : '#666', fontWeight: active ? '600' : '400' }}>{port.name}</Text>
        {disabled && <FontAwesome6 name="check" size={10} color={active ? 'white' : '#666'} iconStyle="solid" />}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>Origin Port *</Text>
      <ScrollView horizontal><View style={{ flexDirection: 'row', gap: 8 }}>{ports.map((p: Port) => <PortChip key={p.id} port={p} type="origin" />)}</View></ScrollView>
      {!hasAvailable && local.originPortId && <Text style={{ color: '#FF6B6B', fontSize: 12, marginTop: 4 }}>All destinations used</Text>}
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 }}>Destination Port *</Text>
      <ScrollView horizontal><View style={{ flexDirection: 'row', gap: 8 }}>{ports.map((p: Port) => <PortChip key={p.id} port={p} type="destination" />)}</View></ScrollView>
    </View>
  );
};

// Trip Form Component (unchanged - already compact)
const TripForm = ({ initial, vessels, formRef, isEdit = false }: any) => {
  const [local, setLocal] = useState(initial);
  const update = (patch: any) => { const updated = { ...local, ...patch }; setLocal(updated); formRef.current = updated; };
  const HOURS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const PERIODS = ['AM', 'PM'];
  const parse = (t: string) => { const m = t.match(/(\d+):(\d+)\s*(AM|PM)/); return m ? { hour: m[1], minute: m[2], period: m[3] } : { hour: '12', minute: '00', period: 'AM' }; };
  const parts = parse(local.time);
  const isNoSailing = local.status === 'No Sailing';
  const vesselName = vessels.find((v: Vessel) => v.id === local.vesselId)?.name || 'Unknown Vessel';

  const Chip = ({ label, active, onPress, disabled = false }: any) => (
    <TouchableOpacity onPress={onPress} disabled={disabled}
      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: disabled ? '#e8e8e8' : (active ? colors.brand : '#e0e0e0'), opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ color: disabled ? '#999' : (active ? 'white' : '#666'), fontWeight: active ? '600' : '400' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {isEdit ? (
        <>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>Vessel</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0' }}>
            <FontAwesome6 name="ship" size={14} color="#333" iconStyle="solid" />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>{vesselName}</Text>
              <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>* Vessel cannot be changed</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>Vessel *</Text>
          <ScrollView horizontal>
            <View style={{ flexDirection: 'row' }}>
              {vessels.map((v: Vessel) => (
                <Chip key={v.id} label={v.name} active={local.vesselId === v.id} onPress={() => update({ vesselId: v.id })} />
              ))}
            </View>
          </ScrollView>
          {vessels.length === 0 && <Text style={{ color: '#FF6B6B', fontSize: 12, marginTop: 4 }}>No vessels available</Text>}
        </>
      )}
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 }}>Status *</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['Sailing', 'No Sailing'].map(s => (
          <TouchableOpacity key={s} onPress={() => update({ status: s })}
            style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: local.status === s ? (s === 'Sailing' ? '#22C55E' : '#FF6B6B') : '#e0e0e0', alignItems: 'center' }}>
            <Text style={{ color: local.status === s ? 'white' : '#666' }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: isNoSailing ? '#999' : '#333', marginTop: 12, marginBottom: 4 }}>Hour {isNoSailing ? '(disabled)' : '*'}</Text>
      <ScrollView horizontal><View style={{ flexDirection: 'row' }}>{HOURS.map(h => <Chip key={h} label={h} active={parts.hour === h} disabled={isNoSailing} onPress={() => update({ time: `${h}:${parts.minute} ${parts.period}` })} />)}</View></ScrollView>
      <Text style={{ fontSize: 14, fontWeight: '600', color: isNoSailing ? '#999' : '#333', marginTop: 12, marginBottom: 4 }}>Minute {isNoSailing ? '(disabled)' : '*'}</Text>
      <ScrollView horizontal><View style={{ flexDirection: 'row' }}>{MINUTES.map(m => <Chip key={m} label={m} active={parts.minute === m} disabled={isNoSailing} onPress={() => update({ time: `${parts.hour}:${m} ${parts.period}` })} />)}</View></ScrollView>
      <Text style={{ fontSize: 14, fontWeight: '600', color: isNoSailing ? '#999' : '#333', marginTop: 12, marginBottom: 4 }}>Period {isNoSailing ? '(disabled)' : '*'}</Text>
      <View style={{ flexDirection: 'row' }}>{PERIODS.map(p => <Chip key={p} label={p} active={parts.period === p} disabled={isNoSailing} onPress={() => update({ time: `${parts.hour}:${parts.minute} ${p}` })} />)}</View>
      <Text style={{ textAlign: 'center', fontSize: 13, color: isNoSailing ? '#999' : '#999', marginVertical: 12 }}>
        Selected: {isNoSailing ? 'N/A (No Sailing)' : local.time}
      </Text>
    </View>
  );
};

export default function RoutesScreen() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tripsMap, setTripsMap] = useState<Record<string, Trip[]>>({});
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const subsRef = useRef<Record<string, () => void>>({});
  const [modal, setModal] = useState({ visible: false, title: '', content: null, action: null, saving: false });

  useEffect(() => {
    const unsub1 = subscribeToPorts(setPorts);
    const unsub2 = subscribeToVessels(setVessels);
    const unsub3 = subscribeToRoutes(r => { setRoutes(r); setLoading(false); });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  useEffect(() => {
    const current = new Set(routes.map(r => r.id));
    Object.keys(subsRef.current).forEach(id => {
      if (!current.has(id)) { subsRef.current[id](); delete subsRef.current[id]; setTripsMap(prev => { const { [id]: _, ...rest } = prev; return rest; }); }
    });
    routes.forEach(route => {
      if (!subsRef.current[route.id]) {
        subsRef.current[route.id] = subscribeToTripsForRoute(route.id, trips => setTripsMap(prev => ({ ...prev, [route.id]: trips })));
      }
    });
  }, [routes]);

  useEffect(() => () => { Object.values(subsRef.current).forEach(unsub => unsub()); }, []);

  const getPortName = (id: string) => ports.find((p: Port) => p.id === id)?.name || 'Unknown';
  const showAlert = (title: string, msg: string) => Alert.alert(title, msg, [{ text: 'OK' }]);
  const showModal = (title: string, content: any, action: any) => setModal({ visible: true, title, content, action, saving: false });

  const handleAddRoute = () => {
    if (ports.length < 2) return showAlert('Error', 'Need at least 2 ports');
    const avail = ports.filter((p: Port) => {
      const used = routes.filter((r: Route) => r.originPortId === p.id).map((r: Route) => r.destinationPortId);
      return ports.filter((pp: Port) => pp.id !== p.id).some((pp: Port) => !used.includes(pp.id));
    });
    if (!avail.length) return showAlert('All Used', 'All routes used');
    const formRef = { current: { originPortId: avail[0].id, destinationPortId: '' } };
    showModal('Add Route', 
      <RouteForm initial={{ originPortId: avail[0].id, destinationPortId: '' }} ports={ports} routes={routes} formRef={formRef} />,
      async () => {
        setModal(prev => ({ ...prev, saving: true }));
        const { originPortId, destinationPortId } = formRef.current;
        if (!originPortId || !destinationPortId || originPortId === destinationPortId || routes.some((r: Route) => r.originPortId === originPortId && r.destinationPortId === destinationPortId)) {
          setModal(prev => ({ ...prev, saving: false }));
          return showAlert('Error', !originPortId || !destinationPortId ? 'Select both ports' : originPortId === destinationPortId ? 'Must be different' : 'Route exists');
        }
        try { await addRoute(originPortId, destinationPortId); showAlert('Success', 'Route added!'); setModal(prev => ({ ...prev, visible: false, saving: false })); } 
        catch { showAlert('Error', 'Failed to add route'); setModal(prev => ({ ...prev, saving: false })); }
      }
    );
  };

  const handleDeleteRoute = (route: Route) => {
    Alert.alert('Delete Route', `Delete "${getPortName(route.originPortId)} → ${getPortName(route.destinationPortId)}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteRoute(route.id); showAlert('Deleted', 'Route deleted'); } catch { showAlert('Error', 'Failed to delete route'); }
      }}
    ]);
  };

  const handleAddTrip = (routeId: string) => {
    if (!vessels.length) return showAlert('Error', 'Add vessel first');
    const formRef = { current: { vesselId: vessels[0].id, time: '6:00 AM', status: 'Sailing' as const } };
    showModal('Add Trip',
      <TripForm initial={{ vesselId: vessels[0].id, time: '6:00 AM', status: 'Sailing' }} vessels={vessels} formRef={formRef} isEdit={false} />,
      async () => {
        setModal(prev => ({ ...prev, saving: true }));
        const { vesselId, time, status } = formRef.current;
        if (!vesselId || !time) { setModal(prev => ({ ...prev, saving: false })); return showAlert('Error', 'Fill all fields'); }
        const existingTrips = getTripsByRoute(tripsMap, routeId);
        if (existingTrips.some((t: Trip) => t.vesselId === vesselId && t.time === time)) {
          setModal(prev => ({ ...prev, saving: false }));
          return showAlert('Error', 'This vessel already has a trip at this time');
        }
        try { await addTrip(routeId, vesselId, time, status); showAlert('Success', 'Trip added!'); setModal(prev => ({ ...prev, visible: false, saving: false })); } 
        catch { showAlert('Error', 'Failed to add trip'); setModal(prev => ({ ...prev, saving: false })); }
      }
    );
  };

  const handleEditTrip = (routeId: string, trip: Trip) => {
    const formRef = { current: { vesselId: trip.vesselId, time: trip.time, status: trip.status } };
    showModal('Edit Trip',
      <TripForm initial={{ vesselId: trip.vesselId, time: trip.time, status: trip.status }} vessels={vessels} formRef={formRef} isEdit={true} />,
      async () => {
        setModal(prev => ({ ...prev, saving: true }));
        const { vesselId, time, status } = formRef.current;
        if (!vesselId || !time) { setModal(prev => ({ ...prev, saving: false })); return showAlert('Error', 'Fill all fields'); }
        const timeChanged = time !== trip.time;
        const statusChanged = status !== trip.status;
        try {
          await updateTrip(routeId, trip.id, { vesselId, time, status });
          showAlert('Success', 'Trip updated!');
          setModal(prev => ({ ...prev, visible: false, saving: false }));
          if (timeChanged || statusChanged) {
            const vesselName = vessels.find((v: Vessel) => v.id === vesselId)?.name ?? 'Trip';
            const route = routes.find((r: Route) => r.id === routeId);
            const routeName = route ? `${getPortName(route.originPortId)} → ${getPortName(route.destinationPortId)}` : '';
            let msg = timeChanged && statusChanged ? `Ka-Tawid, na-update ang iskedyul ng ${vesselName} (${routeName}): bagong oras "${time}", at ang status ay "${status}" na.`
              : timeChanged ? `Ka-Tawid, naiba ang oras ng iskedyul ng ${vesselName} (${routeName}) sa "${time}".`
              : status === 'Sailing' ? `Ka-Tawid, nagbago ang status ng ${vesselName} (${routeName}) sa "${status}". Tuloy na po ang biyahe.`
              : status === 'No Sailing' ? `Ka-Tawid, nagbago ang status ng ${vesselName} (${routeName}) sa "${status}". Paumanhin, pansamantalang walang biyahe. Maghintay lamang po sa abiso kung may pagbabago.`
              : `Ka-Tawid, nagbago ang status ng ${vesselName} (${routeName}) sa "${status}".`;
            tawidNotif(msg);
          }
        } catch { showAlert('Error', 'Failed to update trip'); setModal(prev => ({ ...prev, saving: false })); }
      }
    );
  };

  const handleDeleteTrip = (routeId: string, trip: Trip) => {
    Alert.alert('Delete Trip', `Delete trip at ${trip.time}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteTrip(routeId, trip.id); showAlert('Deleted', 'Trip deleted'); } catch { showAlert('Error', 'Failed to delete trip'); }
      }}
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.brand} /></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome6 name="route" size={16} color="rgba(0,0,0,0.8)" iconStyle="solid" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(0,0,0,0.8)' }}>Routes & Trips</Text>
        </View>
        <TouchableOpacity onPress={handleAddRoute} style={{ backgroundColor: colors.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <FontAwesome6 name="plus" size={12} color="white" iconStyle="solid" />
          <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>
      {!routes.length ? <Text style={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center', padding: 20 }}>No routes yet.</Text> :
        <ScrollView showsVerticalScrollIndicator={false}>
          {routes.map((route) => {
            const trips = getTripsByRoute(tripsMap, route.id);
            const showAll = expandedTrips[route.id] || false;
            const displayed = showAll ? trips : trips.slice(0, 3);
            const hasMore = trips.length > 3;
            return (
              <View key={route.id} style={{ backgroundColor: colors.white, borderRadius: 10, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.blur(0.3), padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(0,0,0,0.8)' }}>{getPortName(route.originPortId)} → {getPortName(route.destinationPortId)}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>{trips.length} trips</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteRoute(route)}><Text style={{ color: '#FF6B6B', fontWeight: '600' }}>Delete</Text></TouchableOpacity>
                </View>
                <View style={{ borderTopWidth: 1, borderTopColor: colors.blur(0.3), paddingTop: 10 }}>
                  <TouchableOpacity onPress={() => handleAddTrip(route.id)} style={{ marginBottom: 10, padding: 10, backgroundColor: colors.brand + '20', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.brand + '40', borderStyle: 'dashed' }}>
                    <Text style={{ color: colors.brand, fontWeight: '600' }}>+ Add Trip</Text>
                  </TouchableOpacity>
                  {!trips.length ? <Text style={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center', padding: 10 }}>No trips</Text> :
                    <>
                      {displayed.map((trip: Trip) => (
                        <View key={trip.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.blur(0.2) }}>
                          <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <FontAwesome6 name="ship" size={11} color="rgba(0,0,0,0.7)" iconStyle="solid" />
                              <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.7)' }}>{getVesselName(vessels, trip.vesselId)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                              <Text style={{ fontWeight: '500', color: 'rgba(0,0,0,0.8)' }}>{trip.time}</Text>
                              <View style={{ backgroundColor: trip.status === 'Sailing' ? '#22C55E' : '#FF6B6B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 10, color: 'white' }}>{trip.status}</Text>
                              </View>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={() => handleEditTrip(route.id, trip)}><Text style={{ color: colors.brand, fontWeight: '600' }}>Edit</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteTrip(route.id, trip)}><Text style={{ color: '#FF6B6B', fontWeight: '600' }}>Delete</Text></TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      {hasMore && <TouchableOpacity onPress={() => setExpandedTrips(prev => ({ ...prev, [route.id]: !prev[route.id] }))} style={{ marginTop: 10, padding: 8, alignItems: 'center' }}>
                        <Text style={{ color: colors.brand, fontWeight: '600' }}>{showAll ? 'View Less' : `View All (${trips.length - 3} more)`}</Text>
                      </TouchableOpacity>}
                    </>
                  }
                </View>
              </View>
            );
          })}
        </ScrollView>
      }

      <TawidModal
        visible={modal.visible}
        onClose={() => !modal.saving && setModal(prev => ({ ...prev, visible: false }))}
        title={modal.title}
        showCloseButton={true}
        actions={[
          { text: 'Cancel', style: 'cancel', onPress: () => !modal.saving && setModal(prev => ({ ...prev, visible: false })), disabled: modal.saving },
          { text: 'Save', style: 'default', onPress: () => modal.action?.(), disabled: modal.saving, loading: modal.saving }
        ]}
      >
        {modal.content}
      </TawidModal>
    </View>
  );
}