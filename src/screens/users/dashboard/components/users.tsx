// screens/dashboard/components/users.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

import { colors } from '../../../../constants/colors';
import { firestore } from '../../../../firebase/firebaseConfig';

interface NearestPort {
    city: string;
    latitude: number;
    longitude: number;
}

interface UserData {
    uid: string;
    code: string;
    name: string;
    email: string;
    photo?: string;
    role: string;
    expoToken?: string;
    notificationsEnabled: boolean;
    nearestPort?: NearestPort;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    lastLoginAt?: Timestamp;
}

const ROLE_FILTERS = ['All', 'Company', 'Passenger', 'LGU', 'Conductor'];

function formatTimestamp(ts?: Timestamp) {
    if (!ts) return '—';
    const date = ts.toDate();
    return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export default function UsersScreen() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        const q = query(collection(firestore, 'users'), orderBy('lastLoginAt', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as UserData));
                setUsers(data);
                setLoading(false);
            },
            (error) => {
                console.error('Failed to fetch users:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesRole = roleFilter === 'All' || user.role === roleFilter;
            const matchesSearch =
                search.trim() === '' ||
                user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase()) ||
                user.code?.toLowerCase().includes(search.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [users, search, roleFilter]);

    const renderUser = (item: UserData) => (
        <View
            key={item.uid}
            style={{
                backgroundColor: colors.white,
                padding: 14,
                borderRadius: 10,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.blur(0.3),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                {item.photo ? (
                    <Image
                        source={{ uri: item.photo }}
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                        contentFit="cover"
                    />
                ) : (
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: colors.brand + '15',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <FontAwesome6 name="user" size={18} color={colors.brand} iconStyle="solid" />
                    </View>
                )}

                <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: 'rgba(0,0,0,0.8)' }} numberOfLines={1}>
                            {item.name || 'Unnamed User'}
                        </Text>
                        <View
                            style={{
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 8,
                                backgroundColor: colors.brand + '15',
                            }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand }}>{item.role}</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }} numberOfLines={1}>
                        {item.email}
                    </Text>
                    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }} numberOfLines={1}>
                        {item.code || 'Unknown code'}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <FontAwesome6 name="location-dot" size={11} color="rgba(0,0,0,0.4)" iconStyle="solid" />
                        <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>
                            {item.nearestPort?.city || 'No nearest port'}
                        </Text>
                        <View style={{ width: 1, height: 10, backgroundColor: 'rgba(0,0,0,0.15)', marginHorizontal: 2 }} />
                        <FontAwesome6
                            name="bell"
                            size={11}
                            color={item.notificationsEnabled ? colors.brand : 'rgba(0,0,0,0.3)'}
                            iconStyle="solid"
                        />
                        <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>
                            {item.notificationsEnabled ? 'On' : 'Off'}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>
                            Last login: {formatTimestamp(item.lastLoginAt)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand} />
                </View>
            );
        }

        if (filteredUsers.length === 0) {
            return (
                <Text style={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center', padding: 20 }}>No users found</Text>
            );
        }

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {filteredUsers.map((item) => renderUser(item))}
            </ScrollView>
        );
    };

    return (
        <View style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <FontAwesome6 name="users" size={16} color="rgba(0,0,0,0.8)" iconStyle="solid" />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(0,0,0,0.8)' }}>Users</Text>
                </View>
            </View>

            {/* Search */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    height: 42,
                    marginBottom: 10,
                    gap: 8,
                }}>
                <FontAwesome6 name="magnifying-glass" size={14} color="rgba(0,0,0,0.4)" iconStyle="solid" />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search name, email, or code"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    style={{ flex: 1, fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
                />
            </View>

            {/* Role filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
                style={{ flexGrow: 0 }}
            >
                {ROLE_FILTERS.map((role) => {
                    const active = roleFilter === role;
                    return (
                        <TouchableOpacity
                            key={role}
                            onPress={() => setRoleFilter(role)}
                            activeOpacity={0.7}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 10,
                                backgroundColor: active ? colors.brand : colors.blur(),
                                borderWidth: 1,
                                borderColor: active ? colors.brand : colors.blur(0.3),
                            }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: active ? 'white' : 'rgba(0,0,0,0.55)' }}>
                                {role}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={{ flex: 1 }}>{renderContent()}</View>
        </View>
    );
}