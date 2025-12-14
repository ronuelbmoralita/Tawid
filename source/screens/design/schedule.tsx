import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../components/colors';
import Svg, { Path } from 'react-native-svg';
import { FilterState } from './search';
import ScheduleFormModal, { useScheduleForm } from './scheduleForm';
import Icon from '../../components/icons'; // Add this import
import { shadowStyles } from '../../components/shadow';

const initialSchedules = [
  { id: '1', capacity: 100, boatName: 'MV Syvel 108', from: 'Ungos', to: 'Polillo', price: 450, time: '06:00 AM', boatType: 'Fastcraft', note: 'Direct trip, no vehicles, On Time', status: 'Available' as const, weeklySchedule: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: '2', capacity: 200, boatName: 'MV Syvel 808', from: 'Ungos', to: 'Burdeos', price: 380, time: '08:00 AM', boatType: 'RORO', note: 'Accepts motorcycles, Boarding', status: 'Available' as const, weeklySchedule: ['Mon', 'Wed', 'Fri', 'Sat'] },
  { id: '3', capacity: 150, boatName: 'MV Real Transport', from: 'Dinahican', to: 'Panukulan', price: 420, time: '09:30 AM', boatType: 'RORO', note: 'Under maintenance, 30 mins delay, cargo included', status: 'Unavailable' as const, weeklySchedule: ['Tue', 'Thu', 'Sat'] },
  { id: '4', capacity: 300, boatName: 'MV Island Express', from: 'Ungos', to: 'Jomalig', price: 500, time: '01:00 PM', boatType: 'Fastcraft', note: 'Tourist friendly, On Time', status: 'Available' as const, weeklySchedule: ['Sun', 'Tue', 'Thu'] },
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
          <Text style={{ fontSize: 12, color: 'lightgray' }}>From</Text>
          <Text style={{ fontSize: 15, color: '#555' }}>{from}</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={100} height={20} style={{ marginHorizontal: 5 }}>
            <Path d={generateWavePath()} stroke={colors.primary} strokeWidth={2} fill="none" />
          </Svg>
        </View>
        <View>
          <Text style={{ fontSize: 12, color: 'lightgray' }}>To</Text>
          <Text style={{ fontSize: 15, color: '#555' }}>{to}</Text>
        </View>
      </View>
    );
  };

  const ScheduleItem = ({ item }: { item: typeof schedules[0] }) => {

    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const statusColor = item.status === 'Available' ? colors.success : colors.error;
    const statusIcon = item.status === 'Available' ? 'check-circle' : 'ban';

    return (
      <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', ...shadowStyles.softShadow }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 0.2, borderBottomColor: 'lightgray', paddingBottom: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.dark }}>{item.boatName}</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.dark }}>₱{item.price}</Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginVertical: 10,
        }}>
          {[
            {
              key: 'status',
              label: 'Status',
              value: item.status,
              icon: statusIcon, // Replace with actual icon name
              color: statusColor,
            },
            {
              key: 'boatType',
              label: 'Boat Type',
              value: item.boatType,
              icon: 'sailboat', // Replace with actual icon name
              color: colors.dark,
            },
            {
              key: 'capacity',
              label: 'Capacity',
              value: `${item.capacity} pax`,
              icon: 'user-group', // Replace with actual icon name
              color: colors.dark,
            },
          ].map((rowItem) => (
            <View
              key={rowItem.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5
              }}>
              <Icon name={rowItem.icon} size={20} color={rowItem.color} />
              <Text style={{ fontSize: 15, color: rowItem.color }}>
                {rowItem.value}
              </Text>

            </View>
          ))}
        </View>
        {/* Wave Line */}
        <WavyLine from={item.from} to={item.to} waveCount={5} time={item.time} />

        {/* Day Pills */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 8, gap: 4 }}>
          {allDays.map(day => {
            const isAvailable = item.weeklySchedule.includes(day);
            return (
              <View key={day} style={{
                backgroundColor: isAvailable ? colors.light : '#f5f5f5',
                borderWidth: 1,
                borderColor: isAvailable ? '#ddd' : '#eee',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6
              }}>
                <Text style={{ fontSize: 12, color: isAvailable ? colors.dark : '#ccc', fontWeight: '500' }}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Note */}
        <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Note: {item.note}</Text>

        {/* Buttons */}
        {role === 'Customer' && (
          <TouchableOpacity
            onPress={() => handleBook(item)}
            style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 100, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>Book</Text>
          </TouchableOpacity>
        )}

        {role === 'Admin' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {[
              { label: 'Edit', action: () => openForm(item), bg: colors.primary },
              { label: 'Delete', action: () => handleDelete(item), bg: colors.error }
            ].map(btn => (
              <TouchableOpacity
                key={btn.label}
                onPress={btn.action}
                style={{ flex: 1, backgroundColor: btn.bg, padding: 12, borderRadius: 100, alignItems: 'center' }}
              >
                <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
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