import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native'
import React from 'react'
import Icon from '../../components/icons';
import { colors } from '../../components/colors';

interface SearchProps {
  onSearchChange: (text: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  boatTypes: string[];
  statuses: string[];
  priceRange: { min: number; max: number };
  days: string[];
}

export default function Search({ onSearchChange, onFilterChange }: SearchProps) {
  const [text, onChangeText] = React.useState('');
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>({
    boatTypes: [],
    statuses: [],
    priceRange: { min: 0, max: 1000 },
    days: []
  });

  const boatTypeOptions = ['Fastcraft', 'RORO'];
  const statusOptions = ['Available', 'Unavailable'];
  const dayOptions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSearchChange = (value: string) => {
    onChangeText(value);
    onSearchChange(value);
  };

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: (prev[category] as string[]).includes(value)
        ? (prev[category] as string[]).filter(item => item !== value)
        : [...(prev[category] as string[]), value]
    }));
  };

  const updatePrice = (field: 'min' | 'max', value: string) => {
    const num = value === '' ? (field === 'min' ? 0 : 1000) : parseInt(value) || 0;
    setFilters(prev => ({
      ...prev,
      priceRange: { ...prev.priceRange, [field]: num }
    }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setFilterVisible(false);
  };

  const resetFilters = () => {
    const resetState = {
      boatTypes: [],
      statuses: [],
      priceRange: { min: 0, max: 1000 },
      days: []
    };
    setFilters(resetState);
    onFilterChange(resetState);
  };

  const FilterChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: selected ? colors.primary : colors.light,
        borderWidth: 1,
        borderColor: selected ? colors.primary : '#ddd',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: selected ? colors.light : colors.dark, fontWeight: selected ? '600' : '400' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 15 }}>
        <View style={{ flex: 1, position: 'relative' }}>
          <Icon
            name="magnifying-glass"
            size={20}
            color={colors.primary}
            style={{ position: 'absolute', left: 18, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5 }}
          />
          <TextInput
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 100,
              paddingHorizontal: 50,
              paddingRight: text ? 50 : 20,
              elevation: 5,
              height: 60,
            }}
            placeholder='Search boat name, route...'
            placeholderTextColor={colors.primary}
            onChangeText={handleSearchChange}
            value={text}
          />
          {text.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearchChange('')}
              style={{ position: 'absolute', right: 15, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: 30 }}
            >
              <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, elevation: 5 }}
          onPress={() => setFilterVisible(true)}
        >
          <Icon name="sliders" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Modal visible={filterVisible} animationType="fade" transparent onRequestClose={() => setFilterVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'lightgray', paddingBottom: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.dark }}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Text style={{ fontSize: 18, color: colors.primary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.dark, marginBottom: 10 }}>Boat Type</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {boatTypeOptions.map(type => (
                    <FilterChip key={type} label={type} selected={filters.boatTypes.includes(type)} onPress={() => toggleFilter('boatTypes', type)} />
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.dark, marginBottom: 10 }}>Boat Status</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {statusOptions.map(status => (
                    <FilterChip key={status} label={status} selected={filters.statuses.includes(status)} onPress={() => toggleFilter('statuses', status)} />
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.dark, marginBottom: 10 }}>Available Days</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {dayOptions.map(day => (
                    <FilterChip key={day} label={day} selected={filters.days.includes(day)} onPress={() => toggleFilter('days', day)} />
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.dark, marginBottom: 10 }}>Price Range</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <TextInput
                    style={{ flex: 1, backgroundColor: colors.light, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd' }}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={filters.priceRange.min === 0 ? '' : filters.priceRange.min.toString()}
                    onChangeText={(value) => updatePrice('min', value)}
                  />
                  <Text style={{ color: colors.dark }}>-</Text>
                  <TextInput
                    style={{ flex: 1, backgroundColor: colors.light, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd' }}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={filters.priceRange.max === 1000 ? '' : filters.priceRange.max.toString()}
                    onChangeText={(value) => updatePrice('max', value)}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity onPress={resetFilters} style={{ flex: 1, backgroundColor: colors.light, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' }}>
                <Text style={{ color: colors.dark, fontSize: 16, fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={{ flex: 1, backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}