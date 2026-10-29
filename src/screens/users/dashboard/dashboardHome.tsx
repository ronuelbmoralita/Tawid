// screens/dashboard/dashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import RoutesScreen from './components/routes';
import PortsScreen from './components/ports';
import VesselsScreen from './components/vessels';
import UsersScreen from './components/users';
import TawidHeader from '../../../header/tawidHeader';
import { subscribeToRoutes } from './dashboardFunctions';
import DashboardTab from './dashBoardTab';

interface DashboardHomeScreenProps {
  userData: any; // Replace with your actual user type
}

export default function DashboardHome({ userData }: DashboardHomeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'routes' | 'ports' | 'vessels' | 'users'>('routes');

  const tabs = [
    { key: 'routes', label: 'Routes', component: <RoutesScreen /> },
    { key: 'ports', label: 'Ports', component: <PortsScreen /> },
    { key: 'vessels', label: 'Vessels', component: <VesselsScreen /> },
    { key: 'users', label: 'Users', component: <UsersScreen /> },
  ];

  useEffect(() => {
    const unsubRoutes = subscribeToRoutes(() => {
      setLoading(false);
    });

    return () => {
      unsubRoutes();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.brand} />
        <TawidHeader userData={userData} />
        <DashboardTab
          tabs={tabs}
          activeTab={tab}
          onTabChange={(key) => setTab(key as 'routes' | 'ports' | 'vessels' | 'users')}
          loading={loading}
        />
      </SafeAreaView>
    </View>
  );
}