import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';
import { shadowStyles } from '../../components/shadow';
import { googleLogout } from '../../../googleAuth';
import { useLoading } from '../../../loading';

export default function Profile({ userData }) {

  const { showLoading, hideLoading } = useLoading();

  const ProfileCard = ({ children }: { children: React.ReactNode }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', ...shadowStyles.softShadow }}>
      {children}
    </View>
  );

  const InfoRow = ({ label, value, icon, color = colors.primary }: { label: string; value: string; icon: string; color?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={20} color={color} />
        <Text style={{ fontSize: 14, color: colors.dark, opacity: 0.8 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 16, color: colors.dark, fontWeight: '500' }}>{value}</Text>
    </View>
  );

  const { name, email, photo, role } = userData || {};

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.light }} contentContainerStyle={{ padding: 15, gap: 15 }}>
      <ProfileCard>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 100, height: 100, borderRadius: 60, marginBottom: 16 }} />
          ) : (
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 3, borderColor: colors.medium }}>
              <Text style={{ fontSize: 48, color: colors.white, fontWeight: '600' }}>
                {(name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dark, marginBottom: 4 }}>
            {name || 'User'}
          </Text>
          <Text style={{ fontSize: 16, color: colors.dark, opacity: 0.7 }}>{email || ''}</Text>
        </View>
        <View style={{ borderTopWidth: 0.2, borderTopColor: 'lightgray', paddingTop: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark }}>Account Details</Text>
          <InfoRow label="Role" value={role || 'Passenger'} icon="user-circle" />
          <InfoRow label="User Code" value={userData?.code || ''} icon="fingerprint" />
          <InfoRow label="Member Since" value={userData?.createdAt?.toDate?.().toLocaleDateString() || 'Recently'} icon="calendar-plus" />
          <InfoRow label="Last Login" value={userData?.lastLoginAt?.toDate?.().toLocaleDateString() || 'Today'} icon="clock" />
        </View>
      </ProfileCard>
      <TouchableOpacity style={{
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.error,
        ...shadowStyles.softShadow
      }} onPress={() => {
        googleLogout((result) => {
          if (result.start) {
            showLoading();
          } else if (result.success) {
            hideLoading();
          } else {
            hideLoading();
            console.log('Logout cancelled or failed:', result.error);
          }
        });
      }}>
        <Text style={{
          color: colors.white,
          fontSize: 16,
          fontWeight: '700',
        }}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}