import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';

interface ReplyProps {
  reply: string;
  repliedBy: string;
  repliedAt: string;
  iconName?: string;
  badgeText?: string;
  onEditPress?: () => void;
}

export function Reply({
  reply,
  repliedBy,
  repliedAt,
  iconName = 'building',
  badgeText = 'Author',
  onEditPress,
}: ReplyProps) {
  return (
    <View style={{ marginLeft: 20, marginTop: 8, flexDirection: 'row' }}>
      <View
        style={{
          width: 2,
          backgroundColor: colors.gray + 30,
          marginRight: 12,
          borderRadius: 1,
        }}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.brand + 15,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: colors.brand + 40,
            padding: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome6 name={iconName} size={12} color="#FFFFFF" iconStyle="solid" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.black }}>
                    {repliedBy}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 4,
                      backgroundColor: colors.brand + '20',
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.brand }}>
                      {badgeText}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: colors.gray }}>
                  {repliedAt}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {onEditPress && (
                <TouchableOpacity onPress={onEditPress} hitSlop={8} style={{ padding: 2 }}>
                  <FontAwesome6 name="pen" size={11} color={colors.brand} iconStyle="solid" />
                </TouchableOpacity>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: colors.red + 20,
                }}>
                <FontAwesome6 name="circle-check" size={10} color={colors.red} iconStyle="solid" />
                <Text style={{ fontSize: 10, fontWeight: '600', color: colors.red }}>
                  Closed
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ fontSize: 14, color: colors.black, lineHeight: 20 }}>
            {reply}
          </Text>
        </View>
      </View>
    </View>
  );
}