import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';
import { shadowStyles } from '../../components/shadow';
import { googleLogout } from '../../../googleAuth';
import { useLoading } from '../../../loading';
import { useState, useRef } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebaseConfig';

export default function Profile({ userData }) {
  const { showLoading, hideLoading } = useLoading();
  const [isAdmin, setIsAdmin] = useState(userData?.role === 'Admin');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleRole = async () => {
    const newRole = isAdmin ? 'Customer' : 'Admin';
    Alert.alert('Change Role', `Are you sure you want to change your role to ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          showLoading();
          // Animate icon rotation
          Animated.sequence([
            Animated.timing(rotateAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true })
          ]).start();

          try {
            const currentUser = auth.currentUser;
            if (!currentUser) return alert('User not authenticated');

            await updateDoc(doc(firestore, 'users', currentUser.uid), {
              role: newRole,
              updatedAt: serverTimestamp()
            });

            setIsAdmin(!isAdmin);
            //alert(`Role successfully changed to ${newRole}`);
          } catch (error) {
            console.error('Error updating role:', error);
            //alert('Failed to update role. Please try again.');
          } finally {
            hideLoading();
          }
        }
      }
    ]);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const Card = ({ children }) => (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', ...shadowStyles.softShadow }}>
      {children}
    </View>
  );

  const Row = ({ label, value, icon, color = colors.primary }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={20} color={color} />
        <Text style={{ fontSize: 14, color: colors.dark, opacity: 0.8 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 16, color: colors.dark, fontWeight: '500' }}>{value}</Text>
    </View>
  );

  const { name = 'User', email = '', photo, code = '', createdAt, lastLoginAt } = userData || {};

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.light }} contentContainerStyle={{ padding: 15, gap: 15 }}>
      <Card>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 100, height: 100, borderRadius: 60, marginBottom: 16 }} />
          ) : (
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 3, borderColor: colors.medium }}>
              <Text style={{ fontSize: 48, color: colors.white, fontWeight: '600' }}>{name[0].toUpperCase()}</Text>
            </View>
          )}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dark, marginBottom: 4 }}>{name}</Text>
          <Text style={{ fontSize: 16, color: colors.dark, opacity: 0.7 }}>{email}</Text>
        </View>
        <View style={{ borderTopWidth: 0.2, borderTopColor: 'lightgray', paddingTop: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark }}>Account Details</Text>
          <Row label="User Code" value={code} icon="fingerprint" />
          <Row label="Member Since" value={createdAt?.toDate?.().toLocaleDateString() || 'Recently'} icon="calendar-plus" />
          <Row label="Last Login" value={lastLoginAt?.toDate?.().toLocaleDateString() || 'Today'} icon="clock" />
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="user-shield" size={24} color={colors.primary} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.dark }}>Switch Role</Text>
              <Text style={{ fontSize: 14, color: colors.dark, opacity: 0.7 }}>
                Current: {isAdmin ? 'Admin' : 'Customer'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleRole} activeOpacity={0.8} style={{
            borderRadius: 20, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 5, justifyContent: isAdmin ? 'flex-end' : 'flex-start', padding: 5, gap: 10
          }}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon name="arrows-rotate" size={20} color="white" />
            </Animated.View>
            <View style={{
              padding: 5, borderRadius: 16, backgroundColor: colors.light, justifyContent: 'center',
              alignItems: 'center', ...shadowStyles.softShadow
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                {isAdmin ? 'Admin' : 'Customer'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: colors.dark, opacity: 0.6, marginTop: 8 }}>
          {isAdmin ? 'Admin role allows managing schedules and user data' : 'Customer role allows booking and viewing schedules'}
        </Text>
      </Card>

      <TouchableOpacity style={{
        height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        backgroundColor: colors.error, ...shadowStyles.softShadow
      }} onPress={() => googleLogout((result) => {
        if (result.start) showLoading();
        else if (result.success) hideLoading();
        else { hideLoading(); console.log('Logout cancelled or failed:', result.error); }
      })}>
        <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}