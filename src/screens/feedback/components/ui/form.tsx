import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';

export interface CategoryOption {
  key: string;
  icon: string;
}

interface FormProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  message: string;
  onMessageChange: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  placeholder?: string;
  showCategoryLabel?: boolean;
  showMessageLabel?: boolean;
}

export function Form({
  categories,
  selectedCategory,
  onCategoryChange,
  message,
  onMessageChange,
  onSubmit,
  submitting,
  submitLabel = 'Send Feedback',
  submittingLabel = 'Sending...',
  placeholder = 'Write your feedback here...',
  showCategoryLabel = true,
  showMessageLabel = true,
}: FormProps) {
  return (
    <View>
      {/* Category */}
      {showCategoryLabel && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#8A8A8E',
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          CATEGORY
        </Text>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {categories.map((cat) => {
          const active = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => onCategoryChange(cat.key)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 100,
                  borderWidth: 1.5,
                  borderColor: active ? colors.brand : '#E5E5EA',
                  backgroundColor: active ? colors.brand : '#FFFFFF',
                }}
              >
                <FontAwesome6
                  name={cat.icon}
                  size={12}
                  color={active ? '#FFFFFF' : '#8A8A8E'}
                  iconStyle="solid"
                />
                <Text
                  style={{
                    color: active ? '#FFFFFF' : '#3A3A3C',
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {cat.key}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Message */}
      {showMessageLabel && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#8A8A8E',
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          MESSAGE
        </Text>
      )}
      <TextInput
        value={message}
        onChangeText={onMessageChange}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B5"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        style={{
          minHeight: 130,
          borderWidth: 1.5,
          borderColor: '#E5E5EA',
          borderRadius: 14,
          padding: 16,
          fontSize: 15,
          lineHeight: 21,
          color: '#1A1A1A',
          backgroundColor: '#FFFFFF',
          marginBottom: 20,
        }}
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={submitting}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.brand,
          borderRadius: 14,
          paddingVertical: 15,
          alignItems: 'center',
          opacity: submitting ? 0.6 : 1,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <FontAwesome6 name="paper-plane" iconStyle="solid" size={15} color="#FFFFFF" />
        )}
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
          {submitting ? submittingLabel : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}