import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { colors } from '../../components/colors';
import { BlurView } from 'expo-blur';

const schedules = [
  {
    id: '1',
    boatName: 'MV Syvel 108',
    from: 'Ungos Port',
    to: 'Port of Polillo',
    price: 450,
    time: '06:00 AM',
    boatType: 'Fastcraft',
    note: 'Direct trip, no vehicles, On Time',
    status: 'Available',
    weeklySchedule: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    id: '2',
    boatName: 'MV Syvel 808',
    from: 'Ungos Port',
    to: 'Port of Burdeos',
    price: 380,
    time: '08:00 AM',
    boatType: 'RoRo',
    note: 'Accepts motorcycles, Boarding',
    status: 'Available',
    weeklySchedule: ['Mon', 'Wed', 'Fri', 'Sat'],
  },
  {
    id: '3',
    boatName: 'MV Real Transport',
    from: 'Dinahican Port',
    to: 'Port of Panukulan',
    price: 420,
    time: '09:30 AM',
    boatType: 'RoRo',
    note: 'Under maintenance, 30 mins delay, cargo included',
    status: 'Unavailable',
    weeklySchedule: ['Tue', 'Thu', 'Sat'],
  },
  {
    id: '4',
    boatName: 'MV Island Express',
    from: 'Ungos Port',
    to: 'Jomalig Port',
    price: 500,
    time: '01:00 PM',
    boatType: 'Fastcraft',
    note: 'Tourist friendly, On Time',
    status: 'Available',
    weeklySchedule: ['Sun', 'Tue', 'Thu'],
  },
];

const ScheduleItem = ({ item }: any) => (
  <BlurView
    style={{
      padding: 16,
      borderRadius: 16,
      overflow: 'hidden',
      gap: 6,
    }}
    intensity={100}
    tint="light"
  >
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.dark }}>
        {item.boatName}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: colors.primary,
            padding: 5,
            backgroundColor: colors.light,
            borderRadius: 100,
          }}
        >
          {item.boatType}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.light,
            padding: 5,
            backgroundColor: item.status === 'Available' ? colors.primary : 'red',
            borderRadius: 100,
          }}
        >
          {item.status}
        </Text>
      </View>
    </View>

    <Text style={{ fontSize: 14, color: '#555' }}>
      {item.from} → {item.to}
    </Text>

    <Text style={{ fontSize: 14, color: '#555' }}>{item.time}</Text>

    <Text style={{ fontSize: 30, fontWeight: '500', color: colors.primary }}>
      ₱{item.price}
    </Text>


    <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
      {item.note}
    </Text>

    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 4,
      }}
    >
      {item.weeklySchedule.map((day) => (
        <View
          key={day}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ fontSize: 12, color: colors.light, fontWeight: '500' }}
          >
            {day}
          </Text>
        </View>
      ))}
    </View>
  </BlurView>
);

export default function Schedule() {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={schedules}
        renderItem={ScheduleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
