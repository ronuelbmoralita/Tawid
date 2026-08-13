import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../constants/colors';

export interface FilterOption {
  key: string;
  label: string;
  count: number;
}

interface FilterProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
}

export function Filter({
  options,
  activeFilter,
  onFilterChange,
}: FilterProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
      {options.map((option) => {
        const active = activeFilter === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onFilterChange(option.key)}
            activeOpacity={0.7}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 100,
                borderWidth: 1.5,
                borderColor: active ? colors.brand : '#E5E5EA',
                backgroundColor: active ? colors.brand : '#FFFFFF',
              }}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : '#3A3A3C',
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {option.label} ({option.count})
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}