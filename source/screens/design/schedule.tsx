import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../components/colors';
import Svg, { Path } from 'react-native-svg';
import { FilterState } from './search';
import ScheduleFormModal, { useScheduleForm } from './scheduleForm';
import Icon from '../../components/icons'; // Add this import

const initialSchedules = [
  { id: '1', boatName: 'MV Syvel 108', from: 'Ungos', to: 'Polillo', price: 450, time: '06:00 AM', boatType: 'Fastcraft', note: 'Direct trip, no vehicles, On Time', status: 'Available' as const, weeklySchedule: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: '2', boatName: 'MV Syvel 808', from: 'Ungos', to: 'Burdeos', price: 380, time: '08:00 AM', boatType: 'RORO', note: 'Accepts motorcycles, Boarding', status: 'Available' as const, weeklySchedule: ['Mon', 'Wed', 'Fri', 'Sat'] },
  { id: '3', boatName: 'MV Real Transport', from: 'Dinahican', to: 'Panukulan', price: 420, time: '09:30 AM', boatType: 'RORO', note: 'Under maintenance, 30 mins delay, cargo included', status: 'Unavailable' as const, weeklySchedule: ['Tue', 'Thu', 'Sat'] },
  { id: '4', boatName: 'MV Island Express', from: 'Ungos', to: 'Jomalig', price: 500, time: '01:00 PM', boatType: 'Fastcraft', note: 'Tourist friendly, On Time', status: 'Available' as const, weeklySchedule: ['Sun', 'Tue', 'Thu'] },
];

interface ScheduleProps {
  role: string;
  searchQuery?: string;
  filters?: FilterState;
}

export default function Schedule({ role, searchQuery = '', filters }: ScheduleProps) {
  const { formVisible, editingItem, openForm, closeForm } = useScheduleForm();
  const [schedules, setSchedules] = useState(initialSchedules);

  const handleBook = (item: typeof schedules[0]) => {
    console.log('Booking:', item.boatName);
  };

  const handleSubmit = (formData: any) => {
    if (editingItem) {
      setSchedules(prev => prev.map(schedule =>
        schedule.id === editingItem.id
          ? { ...formData, id: editingItem.id, price: parseInt(formData.price) }
          : schedule
      ));
    } else {
      const newSchedule = {
        ...formData,
        id: Date.now().toString(),
        price: parseInt(formData.price)
      };
      setSchedules(prev => [...prev, newSchedule]);
    }
    closeForm();
  };

  const handleDelete = (item: any) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== item.id));
    closeForm();
  };

  const WavyLine = ({ from, to, waveCount = 6, time }: { from: string; to: string; waveCount?: number; time: string }) => {
    const waveWidth = 100 / waveCount;
    const amplitude = 8;

    const generateWavePath = () => {
      let path = `M0,10 Q${waveWidth / 4},${10 - amplitude} ${waveWidth / 2},10`;
      for (let i = 1; i <= waveCount * 2; i++) {
        path += ` T${(waveWidth / 2) * (i + 1)},10`;
      }
      return path;
    };

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 10, color: 'lightgray' }}>From</Text>
          <Text style={{ fontSize: 18, color: '#555' }}>{from}</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={100} height={20} style={{ marginHorizontal: 5 }}>
            <Path d={generateWavePath()} stroke={colors.primary} strokeWidth={2} fill="none" />
          </Svg>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: 'lightgray' }}>To</Text>
          <Text style={{ fontSize: 18, color: '#555' }}>{to}</Text>
        </View>
      </View>
    );
  };

  const ScheduleItem = ({ item }: { item: typeof schedules[0] }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', elevation: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>{item.boatName}</Text>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 13 }}>{item.boatType}</Text>
            <Text style={{
              fontSize: 13, borderRadius: 50, borderWidth: 1,
              borderColor: item.status === 'Available' ? colors.success : colors.error,
              color: item.status === 'Available' ? colors.success : colors.error,
              fontWeight: '500', paddingVertical: 2, paddingHorizontal: 10,
            }}>{item.status}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 30, textAlign: 'center', fontWeight: 'bold', color: colors.dark }}>₱{item.price}</Text>
      </View>

      <WavyLine from={item.from} to={item.to} waveCount={5} time={item.time} />
      <Text style={{ fontSize: 14, textAlign: 'center', color: '#444' }}>{item.time}</Text>

      <View style={{ flexDirection: 'row', alignSelf: 'center', flexWrap: 'wrap', marginTop: 8, gap: 4 }}>
        {item.weeklySchedule.map(day => (
          <View key={day} style={{
            backgroundColor: colors.light, borderWidth: 1, borderColor: '#ddd',
            paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
          }}>
            <Text style={{ fontSize: 12, color: colors.dark, fontWeight: '500' }}>{day}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Note: {item.note}</Text>

      {role === 'Customer' && (
        <TouchableOpacity onPress={() => handleBook(item)} style={{
          backgroundColor: colors.primary, padding: 12, borderRadius: 100,
          alignItems: 'center', marginTop: 8,
        }}>
          <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>Book</Text>
        </TouchableOpacity>
      )}

      {role === 'Admin' && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity onPress={() => openForm(item)} style={{
            flex: 1, backgroundColor: colors.primary, padding: 12,
            borderRadius: 100, alignItems: 'center',
          }}>
            <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={{
            flex: 1, backgroundColor: colors.error, padding: 12,
            borderRadius: 100, alignItems: 'center',
          }}>
            <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredSchedules = schedules.filter(schedule => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      schedule.boatName.toLowerCase().includes(searchLower) ||
      schedule.from.toLowerCase().includes(searchLower) ||
      schedule.to.toLowerCase().includes(searchLower) ||
      schedule.note.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;
    if (!filters) return true;

    if (filters.boatTypes.length > 0 && !filters.boatTypes.includes(schedule.boatType)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(schedule.status)) return false;
    if (schedule.price < filters.priceRange.min || schedule.price > filters.priceRange.max) return false;
    if (filters.days.length > 0) {
      const hasMatchingDay = filters.days.some(day => schedule.weeklySchedule.includes(day));
      if (!hasMatchingDay) return false;
    }

    return true;
  });

  return (
    <View style={{ flex: 1 }}>
      {filteredSchedules.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#888', textAlign: 'center' }}>
            No schedules found matching your criteria
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
          renderItem={({ item }) => <ScheduleItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 15, gap: 15, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Button moved here */}
      {role === 'Admin' && !formVisible && (
        <TouchableOpacity
          onPress={() => openForm()}
          style={{
            position: 'absolute',
            bottom: 120,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            zIndex: 1000,
          }}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Form Modal without floating button */}
      <ScheduleFormModal
        role={role}
        formVisible={formVisible}
        editingItem={editingItem}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}