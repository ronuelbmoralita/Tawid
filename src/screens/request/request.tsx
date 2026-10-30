// request.tsx (screen)
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../constants/colors';
import TawidCard from '../../components/tawidCard';
import {
  IMG_SIZE, GRAY, alpha, ROW, Field, BulletBox, FeatureCard, SectionLabel,
  IMG_UNLOCK, IMG_BENEFITS, NOW_PASSENGERS, NOW_STAFF, NEXT_FEATURES, LATER_FEATURES,
} from './requestFunctions';

// ============ 1. PETITION IMAGE (Para kay LGU) ============
const PetitionImage = ({ portName, userName }: { portName: string; userName: string }) => {
  const date = new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const body = { fontSize: 11, color: '#475569', lineHeight: 16, textAlign: 'justify' } as const;

  return (
    <View collapsable={false} style={{ width: IMG_SIZE, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
      <View style={{ backgroundColor: colors.brand, padding: 16, alignItems: 'center' }}>
        <Image source={require('../../../assets/tawid.svg')} style={{ width: 90, height: 25 }} tintColor={colors.white} contentFit="contain" />
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 10, letterSpacing: 0.5 }}>PETITION LETTER</Text>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>Tawid App Activation</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>To: Municipality / Port Authority</Text>
        <Text style={{ ...body, marginTop: 8 }}>
          We, the residents & passengers of <Text style={{ fontWeight: '700', color: colors.black }}>{portName || '[Port Name]'}</Text>, formally request the activation of the Tawid app. It offers real-time schedules, sea advisories, and departure notifications, free for the LGU. With full activation, we unlock:
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <BulletBox title="UNLOCK" items={IMG_UNLOCK} />
          <BulletBox title="BENEFITS" items={IMG_BENEFITS} />
        </View>

        <Text style={{ ...body, marginTop: 12 }}>
          Please help bring Tawid to our port. Your support means safer and smarter travel for everyone. Thank you!
        </Text>

        <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 10, color: GRAY }}>Sincerely,</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>{userName || '[Your Name]'}</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#94A3B8' }}>{date}</Text>
        </View>
      </View>
    </View>
  );
};

// ============ 2. ANIMATED INFO BANNER ============
const InfoBanner = () => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const step = (toValue: number) => Animated.timing(pulse, { toValue, duration: 500, useNativeDriver: true });
    const anim = Animated.sequence([
      Animated.delay(600),
      Animated.loop(Animated.sequence([step(1.2), step(1)]), { iterations: 3 }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={[ROW, { backgroundColor: colors.brand, borderRadius: 8, padding: 14, gap: 12, borderWidth: 1, borderColor: alpha(colors.brand, '30') }]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <FontAwesome6 name="lightbulb" size={24} color={colors.black} iconStyle="solid" />
      </Animated.View>
      <Text style={{ flex: 1, fontSize: 13, color: colors.black, fontWeight: '600', lineHeight: 18 }}>
        Tap “Share” and send the petition to your municipal office or post it on Facebook.
      </Text>
    </View>
  );
};

// ============ 3. FORM ============
const RequestForm = ({ portName, onPortNameChange, userName, onUserNameChange }: any) => (
  <View style={{ gap: 24, paddingBottom: 30 }}>
    {/* Hero + Intro (same card as login) */}
    <View style={{ gap: 8, alignItems: 'center' }}>
      <TawidCard
        color={colors.brand}
        style={{ width: 300, height: 300, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}>
        <Image source={require('../../../assets/onBoarding/request.svg')} style={{ width: 300, height: 300 }} contentFit="contain" />
      </TawidCard>

      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.black, letterSpacing: 0.3, textAlign: 'center', marginTop: 16 }}>
        Bring Tawid to Your Port!
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', lineHeight: 21, textAlign: 'center', paddingHorizontal: 8 }}>
        Help bring Tawid to your community. Fill out the form and share your petition with your local port authority.
      </Text>
    </View>

    <View style={{ gap: 16 }}>
      <Field label="Port Name" value={portName} onChangeText={onPortNameChange} placeholder="e.g. Real, Quezon" />
      <Field label="Your Name" value={userName} onChangeText={onUserNameChange} placeholder="Juan Dela Cruz" />
    </View>

    {/* Roadmap */}
    <View style={{ gap: 16, marginTop: 8 }}>
      <View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.black }}>What's Next for Tawid</Text>
        <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 4 }}>See what's live now and what's coming to your port.</Text>
      </View>

      <View style={{ gap: 12 }}>
        <SectionLabel text="NOW (Live Today)" />
        <View>
          <FeatureCard title="Passengers" subtitle="Available now" data={NOW_PASSENGERS} color={colors.brand} />
          <FeatureCard title="Port Staff" subtitle="Available now" data={NOW_STAFF} color={colors.brand} />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <SectionLabel text="NEXT (Coming Soon)" />
        <FeatureCard title="Unlock" subtitle="Coming soon" data={NEXT_FEATURES} color={colors.brand} dashed />
      </View>

      <View style={{ gap: 12 }}>
        <SectionLabel text="LATER (Exploring)" dot="#94A3B8" textColor={GRAY} />
        <FeatureCard title="Exploring" subtitle="Future plans" data={LATER_FEATURES} color={GRAY} />
      </View>
    </View>

    <InfoBanner />
  </View>
);

// ============ MAIN SCREEN ============
const Request = () => {
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);
  const [portName, setPortName] = useState<string>(route.params?.portName ?? '');
  const [userName, setUserName] = useState('');

  const disabled = !portName.trim() || !userName.trim() || sharing;
  const btnColor = disabled ? 'rgba(0,0,0,0.3)' : colors.black;

  const handleShare = async () => {
    if (disabled || !viewShotRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 0.9, result: 'tmpfile' });
      if (!uri) return Alert.alert('Error', 'Failed to capture image');
      if (!(await Sharing.isAvailableAsync())) return Alert.alert('Sharing not available', 'Use a dev build.');

      await Sharing.shareAsync(uri.startsWith('file://') ? uri : `file://${uri}`, {
        mimeType: 'image/png',
        dialogTitle: 'Share Petition',
        UTI: 'public.png',
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to share petition image');
    } finally {
      setSharing(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <RequestForm portName={portName} onPortNameChange={setPortName} userName={userName} onUserNameChange={setUserName} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', backgroundColor: colors.white }}>
        <TouchableOpacity
          onPress={handleShare}
          disabled={disabled}
          activeOpacity={0.8}
          style={[ROW, {
            backgroundColor: disabled ? 'rgba(0,0,0,0.05)' : colors.brand,
            paddingVertical: 14,
            borderRadius: 12,
            justifyContent: 'center',
            gap: 8,
            shadowColor: 'rgba(0,0,0,0.5)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: disabled ? 0 : 0.1,
            shadowRadius: 4,
            elevation: disabled ? 0 : 2,
          }]}>
          <FontAwesome6 name="share-nodes" size={14} color={btnColor} iconStyle="solid" />
          <Text style={{ color: btnColor, fontWeight: '700', fontSize: 15 }}>{sharing ? 'Sharing...' : 'Share Petition'}</Text>
        </TouchableOpacity>
      </View>

      {/* Hidden ViewShot */}
      <View collapsable={false} pointerEvents="none" style={{ position: 'absolute', left: -9999, top: 0, opacity: 0 }}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9, result: 'tmpfile' }} collapsable={false}>
          <PetitionImage portName={portName} userName={userName} />
        </ViewShot>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Request;