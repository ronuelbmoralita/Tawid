import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { colors } from '../../components/colors';
import Svg, { Path } from 'react-native-svg';

const schedules = [
  { id: '1', boatName: 'MV Syvel 108', from: 'Ungos Port', to: 'Port of Polillo', price: 450, time: '06:00 AM', boatType: 'Fastcraft', note: 'Direct trip, no vehicles, On Time', status: 'Available', weeklySchedule: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: '2', boatName: 'MV Syvel 808', from: 'Ungos Port', to: 'Port of Burdeos', price: 380, time: '08:00 AM', boatType: 'RORO', note: 'Accepts motorcycles, Boarding', status: 'Available', weeklySchedule: ['Mon', 'Wed', 'Fri', 'Sat'] },
  { id: '3', boatName: 'MV Real Transport', from: 'Dinahican Port', to: 'Port of Panukulan', price: 420, time: '09:30 AM', boatType: 'RORO', note: 'Under maintenance, 30 mins delay, cargo included', status: 'Unavailable', weeklySchedule: ['Tue', 'Thu', 'Sat'] },
  { id: '4', boatName: 'MV Island Express', from: 'Ungos Port', to: 'Jomalig Port', price: 500, time: '01:00 PM', boatType: 'Fastcraft', note: 'Tourist friendly, On Time', status: 'Available', weeklySchedule: ['Sun', 'Tue', 'Thu'] },
];

export default function Schedule() {

  const WavyLine = ({ from, to, waveCount = 6 }) => {
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{ fontSize: 14, color: '#555' }}>{from}</Text>

        <Svg
          width={100}
          height={20}
          style={{ marginHorizontal: 5 }}
        >
          <Path
            d={generateWavePath()}
            stroke={colors.primary}
            strokeWidth={2}
            fill="none"
          />
        </Svg>

        <Text style={{ fontSize: 14, color: '#555' }}>{to}</Text>
      </View>
    );
  };

  const ScheduleItem = ({ item }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', elevation: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.dark }}>{item.boatName}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[{ text: item.boatType, bg: colors.primary, weight: 'bold' }, { text: item.status, bg: item.status === 'Available' ? colors.success : colors.error }].map((b, i) => (
            <Text key={i} style={{ fontSize: 14, color: colors.light, padding: 5, backgroundColor: b.bg, borderRadius: 100, fontWeight: b.weight || 'normal' }}>
              {b.text}
            </Text>
          ))}
        </View>
      </View>

      <WavyLine from={item.from} to={item.to} waveCount={5} />

      <Text style={{ fontSize: 14, color: '#555' }}>{item.time}</Text>
      <Text style={{ fontSize: 30, fontWeight: '500', color: colors.primary }}>₱{item.price}</Text>
      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{item.note}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 }}>
        {item.weeklySchedule.map(day => (
          <View key={day} style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ fontSize: 12, color: colors.light, fontWeight: '500' }}>{day}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={schedules}
        renderItem={ScheduleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15, gap: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}