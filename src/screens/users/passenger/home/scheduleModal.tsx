// components/ScheduleModal.tsx
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Dimensions, Alert, TextInput, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import TawidModal from '../../../../components/tawidModal';

const { width } = Dimensions.get('window');
const IMG_SIZE = Math.min(width * 0.88, 360);
const alpha = (hex: string, a: string) => `${hex}${a}`;

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  fontSize: 15,
  color: '#333',
};

export type ScheduleModalRef = {
  open: () => void;
};

const ScheduleImageContent = ({
  portName,
  userName,
}: {
  portName: string;
  userName: string;
}) => {
  const date = new Date().toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View
      collapsable={false}
      style={{
        width: IMG_SIZE,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header with branding */}
      <View
        style={{
          backgroundColor: colors.brand,
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../../../../assets/tawid.svg')}
          style={{ width: 90, height: 25, borderRadius: 100 }}
          tintColor={colors.white}
          contentFit="contain"
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
            marginTop: 8,
          }}
        >
          PETITION LETTER
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
          Tawid App Activation
        </Text>
      </View>

      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>
          To: Municipality / Port Authority
        </Text>

        <Text style={{ fontSize: 11, color: '#555', lineHeight: 16, marginTop: 6 }}>
          We, the residents & passengers of {portName || '[Port Name]'}, formally request the
          activation of the Tawid app for our port. Developed to help communities like ours travel
          safer and smarter, Tawid already offers real-time schedules, sea condition advisory, and
          departure notifications — free for the LGU to use, with no cost or budget required. With
          full activation, our community can unlock even more:
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#F0F8F8',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: alpha(colors.brand, '25'),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <FontAwesome6 name="unlock" size={11} color={colors.brand} iconStyle="solid" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand }}>Unlock</Text>
            </View>
            {['Cashless booking', 'Digital tickets', 'Paperless travel', 'Modern & faster'].map(
              (t, i) => (
                <Text key={i} style={{ fontSize: 10, color: '#555', lineHeight: 15 }}>
                  • {t}
                </Text>
              )
            )}
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#E8F5E9',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: alpha('#4CAF50', '25'),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <FontAwesome6 name="star" size={11} color="#2E7D32" iconStyle="solid" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#2E7D32' }}>Benefits</Text>
            </View>
            {['Less waiting time', 'Safer travel', 'No more long lines', 'Trusted by riders'].map(
              (t, i) => (
                <Text key={i} style={{ fontSize: 10, color: '#555', lineHeight: 15 }}>
                  • {t}
                </Text>
              )
            )}
          </View>
        </View>

        <Text style={{ fontSize: 11, color: '#555', lineHeight: 16, marginTop: 10 }}>
          Please help bring Tawid to our port. Thank you!
        </Text>

        <View
          style={{
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            paddingTop: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#333' }}>Sincerely,</Text>
            <Text style={{ fontSize: 11, color: '#555' }}>
              {userName || '[Your Name / Community]'}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: '#888' }}>{date}</Text>
        </View>

        <View
          style={{
            marginTop: 10,
            backgroundColor: alpha(colors.brand, '12'),
            paddingVertical: 6,
            borderRadius: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FontAwesome6 name="mobile-screen-button" size={11} color={colors.brand} iconStyle="solid" />
          <Text style={{ fontSize: 10, color: colors.brand, fontWeight: '600' }}>
            Download Tawid App to support this petition
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============ MODAL BODY (inputs) ============
const ScheduleModalBody = ({
  portName,
  onPortNameChange,
  userName,
  onUserNameChange,
}: {
  portName: string;
  onPortNameChange: (v: string) => void;
  userName: string;
  onUserNameChange: (v: string) => void;
}) => (
  <View style={{ gap: 12 }}>
    <Text style={{ fontSize: 14, color: '#666', textAlign: 'justify', lineHeight: 22 }}>
      Right now you can only view advisories and schedules. Booking is not available yet.
      Would you like to request activation for your port?
    </Text>

    <View style={{ gap: 8 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.black }}>
          Port Name
        </Text>
        <TextInput
          value={portName}
          onChangeText={onPortNameChange}
          placeholder="e.g. Real, Quezon"
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={inputStyle}
        />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.black }}>
          Your Name
        </Text>
        <TextInput
          value={userName}
          onChangeText={onUserNameChange}
          placeholder="Juan Dela Cruz"
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={inputStyle}
        />
      </View>
    </View>

    <View
      style={{
        backgroundColor: 'rgba(64,224,208,0.08)',
        borderRadius: 8,
        padding: 12,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.black }}>
        Unlock with Tawid:
      </Text>
      {[
        ['mobile-screen-button', 'Online Booking'],
        ['ticket', 'Digital Tickets'],
        ['receipt', 'Transaction History'],
      ].map(([icon, text], i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome6 name={icon} size={13} color={colors.brand} iconStyle="solid" />
          <Text style={{ fontSize: 13, color: '#444' }}>{text}</Text>
        </View>
      ))}
    </View>

    <View
      style={{
        backgroundColor: alpha(colors.brand, '15'),
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.brand,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <FontAwesome6 name="lightbulb" size={12} color={colors.brand} iconStyle="solid" />
      <Text
        style={{
          fontSize: 12,
          color: colors.brand,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        Tap "Share" to send the petition
      </Text>
    </View>
  </View>
);

// ============ MAIN ============
const ScheduleModal = forwardRef<ScheduleModalRef>((_, ref) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const [portName, setPortName] = useState('');
  const [userName, setUserName] = useState('');

  useImperativeHandle(ref, () => ({
    open: () => setModalVisible(true),
  }));

  const isFormValid = portName.trim().length > 0 && userName.trim().length > 0;

  const handleShare = async () => {
    if (!isFormValid) return;

    if (!viewShotRef.current) {
      Alert.alert('Error', 'Unable to capture image');
      return;
    }

    setSharingImage(true);
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.9,
        result: 'tmpfile',
      });

      if (!uri) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }

      const shareUri = uri.startsWith('file://') ? uri : `file://${uri}`;

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available', 'Use a development build (not Expo Go).');
        return;
      }

      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Petition Letter',
        UTI: 'public.png',
      });

      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to share petition image');
    } finally {
      setSharingImage(false);
    }
  };

  return (
    <>
      {/* MODAL - direct actions array inside TawidModal */}
      <TawidModal
        visible={modalVisible}
        onClose={() => !sharingImage && setModalVisible(false)}
        title="Tawid Not Activated"
        icon={<FontAwesome6 name="bullhorn" size={16} color={colors.brand} iconStyle="solid" />}
        showCloseButton={true}
        actions={[
          {
            text: 'Close',
            style: 'cancel',
            onPress: () => setModalVisible(false),
            disabled: sharingImage,
          },
          {
            text: sharingImage ? 'Sharing...' : 'Share',
            style: 'default',
            onPress: handleShare,
            disabled: !isFormValid || sharingImage,
            loading: sharingImage,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScheduleModalBody
            portName={portName}
            onPortNameChange={setPortName}
            userName={userName}
            onUserNameChange={setUserName}
          />
        </ScrollView>
      </TawidModal>

      {/* Hidden ViewShot for capturing image */}
      <View
        collapsable={false}
        pointerEvents="none"
        style={{ position: 'absolute', left: -9999, top: 0, opacity: 0 }}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 0.9, result: 'tmpfile' }}
          collapsable={false}
        >
          <View collapsable={false}>
            <ScheduleImageContent portName={portName} userName={userName} />
          </View>
        </ViewShot>
      </View>
    </>
  );
});

export default ScheduleModal;