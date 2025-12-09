import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { colors } from '../../components/colors';
import Svg, { Path } from 'react-native-svg';

const schedules = [
  { id: '1', boatName: 'MV Syvel 108', from: 'Ungos', to: 'Polillo', price: 450, time: '06:00 AM', boatType: 'Fastcraft', note: 'Direct trip, no vehicles, On Time', status: 'Available', weeklySchedule: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: '2', boatName: 'MV Syvel 808', from: 'Ungos', to: 'Burdeos', price: 380, time: '08:00 AM', boatType: 'RORO', note: 'Accepts motorcycles, Boarding', status: 'Available', weeklySchedule: ['Mon', 'Wed', 'Fri', 'Sat'] },
  { id: '3', boatName: 'MV Real Transport', from: 'Dinahican', to: 'Panukulan', price: 420, time: '09:30 AM', boatType: 'RORO', note: 'Under maintenance, 30 mins delay, cargo included', status: 'Unavailable', weeklySchedule: ['Tue', 'Thu', 'Sat'] },
  { id: '4', boatName: 'MV Island Express', from: 'Ungos', to: 'Jomalig', price: 500, time: '01:00 PM', boatType: 'Fastcraft', note: 'Tourist friendly, On Time', status: 'Available', weeklySchedule: ['Sun', 'Tue', 'Thu'] },
];

export default function Schedule() {

  const WavyLine = ({ from, to, waveCount = 6, time }) => {
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
          <View>
        <Text style={{ fontSize: 10, color: 'lightgray' }}>From</Text>
        <Text style={{ fontSize: 14, color: '#555' }}>{from}</Text>
        </View>
        <View style={{
          alignItems:'center',
          justifyContent:'center',
        }}>
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
        <Text style={{ fontSize: 20, color: '#555' }}>{time}</Text>
        </View>
        <View>
        <Text style={{ fontSize: 10, color: 'lightgray' }}>To</Text>
        <Text style={{ fontSize: 14, color: '#555' }}>{to}</Text>
        </View>
      </View>
    );
  };

  const ScheduleItem = ({ item }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', elevation: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.dark }}>{item.boatName}</Text>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[{ text: item.boatType, bg: colors.primary, weight: 'bold' }, { text: item.status, bg: item.status === 'Available' ? colors.success : colors.error }].map((b, i) => (
            <Text key={i} style={{ fontSize: 12, color: colors.light, padding: 10, backgroundColor: b.bg, borderRadius: 100, fontWeight: b.weight || 'normal' }}>
              {b.text}
            </Text>
          ))}
        </View>
      </View>

      <WavyLine from={item.from} to={item.to} waveCount={5} time={item.time}/>
      <Text style={{ fontSize: 30, fontWeight: '500', color: colors.primary }}>₱{item.price}</Text>
      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Note: {item.note}</Text>

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