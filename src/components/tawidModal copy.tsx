// components/TawidModal.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../constants/colors';

export type ModalAction = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
};

interface TawidModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  /** Array of action buttons (like Alert.alert) */
  actions?: ModalAction[];
  /** Optional fixed height (e.g. 300, '50%', '400') */
  height?: DimensionValue;
  children: React.ReactNode;
}

const TawidModal: React.FC<TawidModalProps> = ({
  visible,
  onClose,
  title,
  showCloseButton = true,
  actions = [],
  height, // <-- kinuha natin ang height prop dito
  children,
}) => {
  const showHeader = title || showCloseButton;

  const getButtonStyle = (action: ModalAction): ViewStyle => {
    const base: ViewStyle = {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
    };

    if (action.style === 'cancel') {
      return {
        ...base,
        borderWidth: 1,
        borderColor: 'salmon',
        backgroundColor: 'transparent',
      };
    }

    if (action.style === 'destructive') {
      return {
        ...base,
        backgroundColor: action.disabled || action.loading ? '#f5a5a5' : '#FF6B6B',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: action.disabled || action.loading ? 0 : 0.2,
        shadowRadius: 10,
        elevation: action.disabled || action.loading ? 0 : 3,
      };
    }

    // default
    return {
      ...base,
      backgroundColor: action.disabled || action.loading ? '#c7c7cc' : colors.brand,
      shadowColor: colors.brand,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: action.disabled || action.loading ? 0 : 0.2,
      shadowRadius: 10,
      elevation: action.disabled || action.loading ? 0 : 3,
    };
  };

  const getTextStyle = (action: ModalAction): TextStyle => {
    if (action.style === 'cancel') {
      return { color: 'salmon', fontWeight: '600' };
    }
    return { color: 'white', fontWeight: '600' };
  };

  // Dynamic style para sa modal container
  const modalContainerStyle: ViewStyle = {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '92%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    // Kung may ipinasang height, 'yun ang gagamitin bilang fixed height.
    // Kapag wala, gagamitin ang maxHeight para mag-expand base sa content.
    ...(height ? { height } : { maxHeight: '85%' }),
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableWithoutFeedback>
            <View style={modalContainerStyle}>
              {/* ginawang contentContainerStyle para ma-stretch ang ScrollView height pag may fixed height */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View style={{ padding: 20, flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    {showHeader && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: title ? 'space-between' : 'flex-end',
                          alignItems: 'center',
                          marginBottom: 20,
                          paddingBottom: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f0f0f0',
                        }}
                      >
                        {title && (
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: '700',
                              color: colors.black,
                              letterSpacing: 0.3,
                            }}
                          >
                            {title}
                          </Text>
                        )}
                        {showCloseButton && (
                          <TouchableOpacity
                            onPress={onClose}
                            style={{
                              padding: 6,
                              borderRadius: 20,
                              backgroundColor: '#f5f5f5',
                              width: 32,
                              height: 32,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FontAwesome6 name="xmark" size={18} color="#666" iconStyle="solid" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {children}
                  </View>

                  {actions.length > 0 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        marginTop: 16,
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: '#f0f0f0',
                      }}
                    >
                      {actions.map((action, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={action.onPress}
                          disabled={action.disabled || action.loading}
                          style={getButtonStyle(action)}
                          activeOpacity={0.5}
                        >
                          <Text style={getTextStyle(action)}>
                            {action.loading ? 'Loading...' : action.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default TawidModal;