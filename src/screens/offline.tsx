import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import NetInfo from '@react-native-community/netinfo';
import { Image } from 'expo-image';

import { colors } from '../constants/colors';
import Wave from '../components/wave';
import TawidCard from '../components/tawidCard';

export default function Offline({ onRetry }: { onRetry?: () => void }) {
  const [checking, setChecking] = React.useState(false);
  const statusBarHeight = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

  const handleRetry = async () => {
    setChecking(true);
    await NetInfo.fetch();
    onRetry?.();
    setChecking(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.red} translucent={false} />

      {/* Status bar background */}
      <View
        style={{
          height: statusBarHeight,
          backgroundColor: colors.red,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
        <Wave
          height={200}
          color={colors.red}
          opacity={0.2}
          amplitude={40}
          speed={4000}
          style={{ bottom: 20, left: 0 }}
        />

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <TawidCard
            color={colors.red}
            style={{ width: 300, height: 300, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
          >
            <Image
              style={{ width: 300, height: 300 }}
              contentFit="contain"
              source={require('../../assets/offline.svg')}
            />
          </TawidCard>

          <View style={{ alignItems: 'center', marginTop: 24, gap: 8, width: '100%' }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.black,
                textAlign: 'center',
                letterSpacing: 0.3,
              }}
            >
              No Internet Connection
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(0,0,0,0.65)',
                lineHeight: 21,
                textAlign: 'center',
                paddingHorizontal: 8,
              }}
            >
              I-check ang iyong WiFi o mobile data, at subukan ulit.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleRetry}
            disabled={checking}
            style={{ marginTop: 28 }}
          >
            <View
              style={{
                height: 56,
                borderRadius: 28,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 28,
                backgroundColor: colors.brand,
                opacity: checking ? 0.7 : 1,
                shadowColor: colors.brand,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <FontAwesome6 name="rotate-right" size={16} color={colors.white} iconStyle="solid" />
              <Text style={{ color: colors.white, fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }}>
                {checking ? 'Sinusubukan...' : 'Subukan Ulit'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}