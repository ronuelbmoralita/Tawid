import { View, Text, ActivityIndicator, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, firestore } from '../../../firebaseConfig';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';
import { shadowStyles } from '../../components/shadow';
import { googleLogout } from '../../../googleAuth';
import { useLoading } from '../../../loading';

interface UserData {
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
  createdAt?: any;
  lastLoginAt?: any;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Not Logged In', 'Please log in to view your profile.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        userDoc.exists()
          ? setUserData(userDoc.data() as UserData)
          : setUserData({
            name: currentUser.displayName ?? 'User',
            email: currentUser.email ?? '',
            photo: currentUser.photoURL ?? '',
            role: 'Passenger',
          });
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (!currentUser) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.dark }}>Please log in</Text>
    </View>
  );

  const ProfileCard = ({ children }: { children: React.ReactNode }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', ...shadowStyles.softShadow }}>
      {children}
    </View>
  );

  const InfoRow = ({ label, value, icon, color = colors.dark }: { label: string; value: string; icon: string; color?: string }) => (
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.light }} contentContainerStyle={{ padding: 15, gap: 15, paddingBottom: 20 }}>

      <ProfileCard>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 3, borderColor: colors.primary }} />
          ) : (
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 3, borderColor: colors.medium }}>
              <Text style={{ fontSize: 48, color: colors.white, fontWeight: '600' }}>
                {(name || currentUser.displayName || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dark, marginBottom: 4 }}>
            {name || currentUser.displayName || 'User'}
          </Text>
          <Text style={{ fontSize: 16, color: colors.dark, opacity: 0.7 }}>{email || currentUser.email}</Text>
        </View>
        <View style={{ borderTopWidth: 0.2, borderTopColor: 'lightgray', paddingTop: 16, gap: 12 }}>
          <InfoRow label="Role" value={role || 'Passenger'} icon="user-circle" color={colors.primary} />
        </View>
      </ProfileCard>

      <ProfileCard>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 12 }}>Account Details</Text>
        <View style={{ gap: 14 }}>
          <InfoRow label="User ID" value={`${currentUser.uid.substring(0, 8)}...`} icon="fingerprint" />
          {userData?.createdAt && <InfoRow label="Member Since" value={userData.createdAt?.toDate?.().toLocaleDateString() || 'Recently'} icon="calendar-plus" />}
          {userData?.lastLoginAt && <InfoRow label="Last Login" value={userData.lastLoginAt?.toDate?.().toLocaleDateString() || 'Today'} icon="clock" />}
        </View>
      </ProfileCard>
      <TouchableOpacity style={{
        backgroundColor: colors.error,
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
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
          color: colors.light
        }}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}