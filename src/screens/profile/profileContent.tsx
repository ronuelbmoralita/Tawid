// components/ProfileContent.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../constants/colors';
import TawidCard from '../../components/tawidCard';
import SwitchNotification from './components/switchNotification';
import SwitchRole from './components/switchRole';
import About from './components/about';

interface ProfileContentProps {
  userData: any;
  displayRole: string;
  notificationsEnabled: boolean;
  onRoleSwitch: (role: string) => void;
  onToggleNotifications: (value: boolean) => void;
}

const safe = (v: any) =>
  v == null
    ? 'N/A'
    : typeof v === 'string' || typeof v === 'number'
      ? String(v)
      : v?.toDate
        ? v.toDate().toLocaleDateString()
        : String(v);

const ProfileContent: React.FC<ProfileContentProps> = ({
  userData,
  displayRole,
  notificationsEnabled,
  onRoleSwitch,
  onToggleNotifications,
}) => {

  const name = safe(userData?.name) || 'User';
  const email = safe(userData?.email);
  const role = safe(userData?.role) || 'Passenger';
  const code = safe(userData?.code);
  const memberSince = userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently';
  const lastLogin = userData?.lastLoginAt?.toDate?.()?.toLocaleDateString() || 'Today';

  const fields: [string, string, string, string?][] = [
    ['fingerprint', 'User Code', code],
    ['user-tag', 'Role', role, colors.brand],
    ['calendar-plus', 'Member Since', memberSince],
    ['clock', 'Last Login', lastLogin],
  ];

  return (
    <View>
      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 24, paddingTop: 8 }}>
        {userData?.photo ? (
          <Image
            source={{ uri: userData.photo }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 12,
              borderWidth: 3,
              borderColor: colors.brand,
            }}
          />
        ) : (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.brand,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32, color: '#fff', fontWeight: '600' }}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a' }}>{name}</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>{email}</Text>
       
      </View>
      <View style={{ gap: 15 }}>
        {/* Account Details */}
        <TawidCard color={colors.brand}>
          {fields.map(([icon, label, value, color], i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: i < fields.length - 1 ? 1 : 0,
                borderBottomColor: '#f0f0f0',
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FontAwesome6 name={icon} size={16} color={color || '#999'} iconStyle="solid" />
                <Text style={{ fontSize: 13, color: '#666' }}>{label}</Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: color || '#1a1a1a',
                  fontWeight: color ? '600' : '500',
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </TawidCard>

        {/* Notifications */}
        <TawidCard
          color={colors.brand}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <FontAwesome6
              name={notificationsEnabled ? 'bell' : 'bell-slash'}
              size={18}
              color={notificationsEnabled ? colors.brand : '#999'}
              iconStyle="solid"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>
                {notificationsEnabled ? 'Notifications' : 'Notifications Disabled'}
              </Text>
              <Text style={{ fontSize: 11, color: '#999' }}>
                {notificationsEnabled ? 'You will receive trip alerts' : 'No trip alerts will be sent'}
              </Text>
            </View>
          </View>
          <SwitchNotification value={notificationsEnabled} onValueChange={onToggleNotifications} />
        </TawidCard>

        {/* Role Switcher — self-gated inside SwitchRole */}
        <SwitchRole
          userData={userData}
          value={displayRole}
          onValueChange={onRoleSwitch}
          options={['Passenger', 'Company']}
        />
        <About />
      </View>
    </View>
  );
};

export default ProfileContent;