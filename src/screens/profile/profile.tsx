// components/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Platform, Alert, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../constants/colors';
import { auth, firestore } from '../../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { googleLogout } from '../../firebase/googleAuth';
import ProfileContent from './profileContent';

interface ProfileProps {
  userData?: any;
  onRoleSwitch?: (role: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ userData, onRoleSwitch }) => {
  const navigation = useNavigation();
  const [currentRole, setCurrentRole] = useState(userData?.role || 'Passenger');
  const [displayRole, setDisplayRole] = useState(userData?.role || 'Passenger');
  const notificationsEnabled = userData?.notificationsEnabled !== false;

  useEffect(() => {
    setDisplayRole(currentRole);
  }, [currentRole]);

  const updateUserField = useCallback(async (field: string, value: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    await updateDoc(doc(firestore, 'users', currentUser.uid), { [field]: value, updatedAt: new Date() });
  }, []);

  const handleRoleSwitch = useCallback(
    (newRole: string) => {
      if (currentRole === newRole) return;

      setDisplayRole(newRole);

      Alert.alert(
        'Switch Role',
        `Switch to ${newRole}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setDisplayRole(currentRole),
          },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                await updateUserField('role', newRole);
                setCurrentRole(newRole);
                onRoleSwitch?.(newRole);
                // Navigate to Home tab after role switch
                navigation.navigate('MainTab' as never);
              } catch {
                setDisplayRole(currentRole);
                Alert.alert('Error', 'Failed to switch role');
              }
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => setDisplayRole(currentRole),
        }
      );
    },
    [currentRole, updateUserField, onRoleSwitch, navigation]
  );

  const handleToggleNotifications = useCallback(
    async (value: boolean) => {
      try {
        await updateUserField('notificationsEnabled', value);
      } catch {
        Alert.alert('Error', 'Failed to update notification settings');
      }
    },
    [updateUserField]
  );

  const handleLogout = useCallback(() => {
    googleLogout((result) => {
      if (result.start) {

      }
      else if (result.success) {

      }
      else {
        if (result.error !== 'Cancelled') Alert.alert('Error', 'Failed to logout.');
      }
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileContent
          userData={userData}
          displayRole={displayRole}
          notificationsEnabled={notificationsEnabled}
          onRoleSwitch={handleRoleSwitch}
          onToggleNotifications={handleToggleNotifications}
        />

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: colors.red,
          }}
        >
          <FontAwesome6 name="right-from-bracket" size={16} color={colors.white} iconStyle="solid" />
          <Text style={{ color: colors.white, fontSize: 15, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;