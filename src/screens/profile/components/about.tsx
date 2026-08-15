// components/About.tsx
import React, { useState } from 'react';
import { View, Text, Linking, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import * as Application from 'expo-application';
import { colors } from '../../../constants/colors';
import TawidModal from '../../../components/tawidModal';
import TawidCard from '../../../components/tawidCard';
import { Image } from 'expo-image';

interface AboutProps {
  /** Optional custom trigger. Defaults to a "TawidCard" row with an info icon. */
  trigger?: (open: () => void) => React.ReactNode;
}

const About: React.FC<AboutProps> = ({ trigger }) => {
  const [visible, setVisible] = useState(false);
  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <>
      {trigger ? (
        trigger(open)
      ) : (
        <TouchableOpacity onPress={open} activeOpacity={0.7}>
          <TawidCard
            color={colors.brand}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <FontAwesome6
                name="circle-info"
                size={18}
                color={colors.brand}
                iconStyle="solid"
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>
                About Tawid
              </Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={14}
              color="#ccc"
              iconStyle="solid"
            />
          </TawidCard>
        </TouchableOpacity>
      )}

      <TawidModal visible={visible} onClose={close} title="About Us">
        {/* Brand header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image
            source={require('../../../../assets/tawid.svg')}
            style={{ width: 100, height: 40 }}
            contentFit="contain"
          />
          <View
            style={{
              marginTop: 6,
              backgroundColor: colors.brand + '15',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.brand, fontWeight: '600' }}>
              Version {Application.nativeApplicationVersion}
            </Text>
          </View>
        </View>

        <View style={{ gap: 15 }}>
          {/* About Us / Brand Story */}
          <View>
            <Text style={{ fontSize: 13, color: '#666', lineHeight: 19 }}>
              Tawid is a community-first digital port platform developed by LOOKAL.
              Built to modernize inter-island travel, Tawid bridges local port
              operations and passengers by delivering real-time vessel schedules,
              sea condition advisories, and instant trip updates.
            </Text>

            <Text
              style={{ fontSize: 13, color: '#666', lineHeight: 19, marginTop: 8 }}
            >
              Tawid connects local ports and island routes, making crossings easier to
              plan while reducing travel uncertainty, supporting tourism, and strengthening
              coastal communities.
            </Text>

            <Text
              style={{ fontSize: 13, color: '#666', lineHeight: 19, marginTop: 8 }}
            >
              By pairing modern digital updates with traditional counter ticketing,
              Tawid ensures safer, clearer, and more efficient voyages—ready to
              empower more coastal ports across the country.
            </Text>
          </View>

          {/* Contact / footer */}
          <TawidCard color={colors.brand}>
            {[
              {
                icon: 'envelope',
                iconStyle: 'solid',
                label: 'Email Us',
                value: 'tawidapp@gmail.com',
                onPress: () => Linking.openURL('mailto:tawidapp@gmail.com'),
              },
              {
                icon: 'facebook',
                iconStyle: 'brand',
                label: 'Follow us on FB',
                value: 'facebook.com/tawidApp',
                onPress: () => Linking.openURL('https://www.facebook.com/tawidApp'),
              },
            ].map((item, index) => (
              <View key={item.label} style={{ marginBottom: index === 0 ? 12 : 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <FontAwesome6
                    name={item.icon as any}
                    size={16}
                    color={colors.brand}
                    iconStyle={item.iconStyle as any}
                  />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>
                    {item.label}
                  </Text>
                </View>
                <Text
                  onPress={item.onPress}
                  style={{ fontSize: 13, color: colors.brand, fontWeight: '500' }}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </TawidCard>
          <Text
            style={{
              fontSize: 11,
              color: '#bbb',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            © {new Date().getFullYear()} Tawid by LOOKAL.
          </Text>
        </View>
      </TawidModal>
    </>
  );
};

export default About;