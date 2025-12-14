import { View, Text, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, firestore } from '../../../firebaseConfig';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';
import { shadowStyles } from '../../components/shadow';

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

  const currentUser: User | null = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Not Logged In', 'Please log in to view your profile.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          console.log('No Firestore document found for this user');
          setUserData({
            name: currentUser.displayName ?? 'User',
            email: currentUser.email ?? '',
            photo: currentUser.photoURL ?? '',
            role: 'Passenger',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.dark }}>Please log in</Text>
      </View>
    );
  }

  const ProfileCard = ({ children }: { children: React.ReactNode }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', ...shadowStyles.softShadow }}>
      {children}
    </View>
  );

  const InfoRow = ({ label, value, icon, color = colors.dark }: { 
    label: string; 
    value: string; 
    icon: string;
    color?: string;
  }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={20} color={color} />
        <Text style={{ fontSize: 14, color: colors.dark, opacity: 0.8 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 16, color: colors.dark, fontWeight: '500' }}>{value}</Text>
    </View>
  );

  const statusColor = colors.success;
  const roleColor = colors.primary;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.light }} contentContainerStyle={{ padding: 15, gap: 15, paddingBottom: 20 }}>
      
      {/* Profile Header Card */}
      <ProfileCard>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {/* Profile Photo */}
          {userData?.photo ? (
            <Image
              source={{ uri: userData.photo }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 16,
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            />
          ) : (
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 3,
              borderColor: colors.medium,
            }}>
              <Text style={{ fontSize: 48, color: colors.white, fontWeight: '600' }}>
                {(userData?.name || currentUser.displayName || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dark, marginBottom: 4 }}>
            {userData?.name || currentUser.displayName || 'User'}
          </Text>

          {/* Email */}
          <Text style={{ fontSize: 16, color: colors.dark, opacity: 0.7 }}>
            {userData?.email || currentUser.email}
          </Text>
        </View>

        <View style={{ borderTopWidth: 0.2, borderTopColor: 'lightgray', paddingTop: 16, gap: 12 }}>
          <InfoRow 
            label="Status" 
            value="Active" 
            icon="check-circle" 
            color={statusColor}
          />
          
          <InfoRow 
            label="Role" 
            value={userData?.role || 'Passenger'} 
            icon="user-circle" 
            color={roleColor}
          />
        </View>
      </ProfileCard>

      {/* Account Details Card */}
      <ProfileCard>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 12 }}>
          Account Details
        </Text>
        
        <View style={{ gap: 14 }}>
          <InfoRow 
            label="User ID" 
            value={currentUser.uid.substring(0, 8) + '...'} 
            icon="fingerprint" 
          />
          
          {userData?.createdAt && (
            <InfoRow 
              label="Member Since" 
              value={userData.createdAt?.toDate?.().toLocaleDateString() || 'Recently'} 
              icon="calendar-plus" 
            />
          )}
          
          {userData?.lastLoginAt && (
            <InfoRow 
              label="Last Login" 
              value={userData.lastLoginAt?.toDate?.().toLocaleDateString() || 'Today'} 
              icon="clock" 
            />
          )}
          
          <InfoRow 
            label="Account Type" 
            value="Standard" 
            icon="shield-check" 
          />
        </View>
      </ProfileCard>

      {/* Stats Card (Optional) */}
      <ProfileCard>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 12 }}>
          Activity
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'Bookings', value: '12', icon: 'ticket', color: colors.primary },
            { label: 'Reviews', value: '5', icon: 'star', color: colors.warning },
            { label: 'Trips', value: '8', icon: 'sailboat', color: colors.success },
            { label: 'Favorites', value: '3', icon: 'heart', color: colors.error },
          ].map((stat) => (
            <View key={stat.label} style={{ alignItems: 'center', flex: 1, minWidth: '45%' }}>
              <View style={{ 
                width: 50, 
                height: 50, 
                borderRadius: 25, 
                backgroundColor: stat.color + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dark }}>{stat.value}</Text>
              <Text style={{ fontSize: 12, color: colors.dark, opacity: 0.7 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ProfileCard>

      {/* Actions Card */}
      <ProfileCard>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark, marginBottom: 12 }}>
          Quick Actions
        </Text>
        
        <View style={{ gap: 8 }}>
          {[
            { label: 'Edit Profile', icon: 'user-pen', action: () => {} },
            { label: 'Change Password', icon: 'key', action: () => {} },
            { label: 'Payment Methods', icon: 'credit-card', action: () => {} },
            { label: 'Help & Support', icon: 'life-ring', action: () => {} },
          ].map((action) => (
            <View key={action.label} 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingVertical: 12,
                borderBottomWidth: 0.2,
                borderBottomColor: 'lightgray',
                gap: 12
              }}>
              <Icon name={action.icon} size={20} color={colors.dark} />
              <Text style={{ flex: 1, fontSize: 16, color: colors.dark }}>{action.label}</Text>
              <Icon name="chevron-right" size={16} color={colors.dark} opacity={0.5} />
            </View>
          ))}
        </View>
      </ProfileCard>

    </ScrollView>
  );
}