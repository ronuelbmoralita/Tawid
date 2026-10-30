// screens/request/requestFunctions.tsx
import React from 'react';
import { View, Text, TextInput, Dimensions } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../constants/colors';

// ============ CONSTANTS & SHARED STYLES ============
export const { width } = Dimensions.get('window');
export const IMG_SIZE = Math.min(width * 0.88, 360);
export const GRAY = '#64748B';
export const alpha = (hex: string, a: string) => `${hex}${a}`;

export const ROW = { flexDirection: 'row', alignItems: 'center' } as const;
export const ICON_WRAP = { ...ROW, width: 28, justifyContent: 'center' } as const;
export const HEADER_ICONS: Record<string, string> = { Passengers: 'user', 'Port Staff': 'id-badge', Unlock: 'unlock' };

// ============ DATA ============
export const IMG_UNLOCK = ['Online booking', 'Cashless payment', 'Digital receipt', 'QR scanner'];
export const IMG_BENEFITS = ['Less waiting time', 'Safer travel', 'No more long lines', 'Trusted by commuters'];

export const NOW_PASSENGERS = [
  ['calendar-check', 'Live trip schedules'],
  ['water', 'Sea condition updates'],
  ['bullhorn', 'Port advisories'],
  ['bell', 'Departure reminders'],
];
export const NOW_STAFF = [
  ['list-check', 'Manage schedules'],
  ['route', 'Manage routes & boats'],
  ['users', 'View passengers'],
];
export const NEXT_FEATURES = [
  ['table-columns', 'Unified LGU dashboard for walk-in and cashless'],
  ['mobile-screen-button', 'Online seat booking'],
  ['wallet', 'Cashless payment (GCash / Maya)'],
  ['receipt', 'Digital receipt'],
  ['qrcode', 'QR code scanner for conductor'],
];
export const LATER_FEATURES = [
  ['anchor', 'More partner ports'],
  ['language', 'Multi-language support'],
  ['bullhorn', 'Promote local businesses through ads'],
  ['ticket', 'Passenger vouchers from ad revenue (lower fares)'],
  ['umbrella-beach', 'Boost coastal tourism'],
];

// ============ SMALL REUSABLE COMPONENTS ============
export const SectionLabel = ({ text, dot = colors.brand, textColor = colors.black }: any) => (
  <View style={[ROW, { gap: 6 }]}>
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
    <Text style={{ fontSize: 12, fontWeight: '800', color: textColor, letterSpacing: 0.5, textTransform: 'uppercase' }}>{text}</Text>
  </View>
);

export const Field = ({ label, ...props }: any) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.black, marginLeft: 2 }}>{label}</Text>
    <TextInput
      placeholderTextColor="rgba(0,0,0,0.35)"
      style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: 14, fontSize: 15, color: colors.black }}
      {...props}
    />
  </View>
);

export const BulletBox = ({ title, items }: { title: string; items: string[] }) => (
  <View style={{ flex: 1, backgroundColor: alpha(colors.brand, '15'), padding: 10, borderRadius: 8, borderWidth: 1, borderColor: alpha(colors.brand, '30') }}>
    <Text style={{ fontSize: 10, fontWeight: '800', color: colors.brand, marginBottom: 6 }}>{title}</Text>
    {items.map(t => (
      <Text key={t} style={{ fontSize: 9, color: '#475569', lineHeight: 14, marginBottom: 2 }}>• {t}</Text>
    ))}
  </View>
);

export const FeatureCard = ({ title, subtitle, data, color, dashed = false }: any) => {
  const gray = color === GRAY;
  return (
    <View style={{
      padding: 18, borderRadius: 12, marginBottom: 14,
      backgroundColor: dashed ? 'transparent' : gray ? '#F8FAFC' : alpha(color, '08'),
      borderWidth: dashed ? 1.5 : 1,
      borderStyle: dashed ? 'dashed' : 'solid',
      borderColor: dashed ? color : gray ? '#E2E8F0' : alpha(color, '40'),
    }}>
      <View style={[ROW, { gap: 10, marginBottom: 16 }]}>
        <View style={[ICON_WRAP, { height: 28, borderRadius: 14, backgroundColor: gray ? '#F1F5F9' : alpha(color, '15') }]}>
          <FontAwesome6 name={HEADER_ICONS[title] ?? 'compass'} size={13} color={color} iconStyle="solid" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.black, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>

      {data.map(([icon, text]: string[]) => (
        <View key={text} style={[ROW, { gap: 10, marginBottom: 12 }]}>
          <View style={ICON_WRAP}>
            <FontAwesome6 name={icon} size={12} color={color} iconStyle="solid" />
          </View>
          <Text style={{ flex: 1, fontSize: 13, color: colors.black, lineHeight: 18 }}>{text}</Text>
        </View>
      ))}
    </View>
  );
};