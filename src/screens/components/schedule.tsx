import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';
import { shadowStyles } from '../../components/shadow';
import ScheduleFormModal, { useScheduleForm } from './scheduleForm';
import Svg, { Path } from 'react-native-svg';
import { listenSchedules, addSchedule, updateSchedule, deleteSchedule } from '../../firebase/scheduleService';
import { useLoading } from '../../../loading';
import Search, { FilterState } from './search';
import Banner from './banner';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WavyLine = ({ from, to, waveCount = 6 }) => {
  const waveWidth = 100 / waveCount;
  const amplitude = 8;

  const generateWavePath = () => {
    let path = `M0,10 Q${waveWidth / 4},${10 - amplitude} ${waveWidth / 2},10`;
    for (let i = 1; i <= waveCount * 2; i++) path += ` T${(waveWidth / 2) * (i + 1)},10`;
    return path;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View><Text style={{ fontSize: 12, color: 'lightgray' }}>From</Text><Text style={{ fontSize: 15, color: '#555' }}>{from}</Text></View>
      <Svg width={100} height={20}><Path d={generateWavePath()} stroke={colors.primary} strokeWidth={2} fill="none" /></Svg>
      <View><Text style={{ fontSize: 12, color: 'lightgray' }}>To</Text><Text style={{ fontSize: 15, color: '#555' }}>{to}</Text></View>
    </View>
  );
};

const ScheduleItem = ({ item, role, onBook, onEdit, onDelete }) => {
  const statusColor = item.status === 'Available' ? colors.success : colors.error;
  const details = [
    { key: 'status', label: 'Status', value: item.status, icon: item.status === 'Available' ? 'check-circle' : 'ban', color: statusColor },
    { key: 'boatType', label: 'Boat Type', value: item.boatType, icon: 'sailboat', color: colors.dark },
    { key: 'capacity', label: 'Capacity', value: `${item.capacity} pax`, icon: 'user-group', color: colors.dark },
  ];

  return (
    <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: 'white', ...shadowStyles.softShadow }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.2, borderBottomColor: 'lightgray', paddingBottom: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.dark }}>{item.boatName}</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.dark }}>₱{item.price}</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
        {details.map(d => (
          <View key={d.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name={d.icon} size={20} color={d.color} />
            <Text style={{ fontSize: 15, color: d.color }}>{d.value}</Text>
          </View>
        ))}
      </View>

      <WavyLine from={item.from} to={item.to} waveCount={5} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 8, gap: 4 }}>
        {DAYS.map(day => {
          const isAvailable = item.weeklySchedule.includes(day);
          return (
            <View key={day} style={{ backgroundColor: isAvailable ? colors.light : '#f5f5f5', borderWidth: 1, borderColor: isAvailable ? '#ddd' : '#eee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, color: isAvailable ? colors.dark : '#ccc', fontWeight: '500' }}>{day}</Text>
            </View>
          );
        })}
      </View>

      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Note: {item.note}</Text>

      {role === 'Customer' ? (
        <TouchableOpacity onPress={() => onBook(item)} style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 100, alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>Book</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {[
            { label: 'Edit', action: () => onEdit(item), bg: colors.primary },
            { label: 'Delete', action: () => onDelete(item), bg: colors.error }
          ].map(btn => (
            <TouchableOpacity key={btn.label} onPress={btn.action} style={{ flex: 1, backgroundColor: btn.bg, padding: 12, borderRadius: 100, alignItems: 'center' }}>
              <Text style={{ color: colors.light, fontSize: 16, fontWeight: '600' }}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function Schedule({ role }: { role: 'Admin' | 'Customer' }) {

  const { showLoading, hideLoading } = useLoading();
  useEffect(() => { const unsub = listenSchedules(setSchedules); return unsub; }, []);
  const { formVisible, editingItem, openForm, closeForm } = useScheduleForm();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    boatTypes: [],
    statuses: [],
    priceRange: { min: 0, max: 1000 },
    days: []
  });

  // Firestore realtime listener
  useEffect(() => {
    const unsub = listenSchedules(setSchedules);
    return unsub;
  }, []);

  // Apply filters whenever schedules, searchText, or activeFilters change
  useEffect(() => {
    let filtered = [...schedules];

    // Text search
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.boatName?.toLowerCase().includes(query) ||
        item.from?.toLowerCase().includes(query) ||
        item.to?.toLowerCase().includes(query)
      );
    }

    // Boat type filter
    if (activeFilters.boatTypes.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.boatTypes.includes(item.boatType)
      );
    }

    // Status filter
    if (activeFilters.statuses.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.statuses.includes(item.status)
      );
    }

    // Price range filter
    filtered = filtered.filter(item => {
      const price = Number(item.price) || 0;
      return price >= activeFilters.priceRange.min &&
        price <= activeFilters.priceRange.max;
    });

    // Days filter
    if (activeFilters.days.length > 0) {
      filtered = filtered.filter(item => {
        // Check if ANY of the selected days match the schedule's days
        return activeFilters.days.some(day =>
          item.weeklySchedule?.includes(day)
        );
      });
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchText, activeFilters]);

  // Handle search change
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  // Handle filter change
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleSubmit = (formData: any) => {
    Alert.alert(
      editingItem ? 'Update Schedule' : 'Add Schedule',
      editingItem ? 'Save changes to this schedule?' : 'Create new schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: editingItem ? 'Update' : 'Add',
          onPress: async () => {
            try {
              showLoading();
              closeForm();
              setTimeout(async () => {
                editingItem ? await updateSchedule(editingItem.id, formData) : await addSchedule(formData);
                hideLoading();
              }, 100);
            } catch {
              alert(`Failed to ${editingItem ? 'update' : 'add'} schedule`);
            }
          }
        }
      ]
    );
  };

  const handleDelete = (item: any) => {
    Alert.alert('Delete Schedule', 'This action cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try { closeForm(); await deleteSchedule(item.id); } catch { alert('Failed to delete schedule'); }
        }
      }
    ]);
  };

  const handleBook = (item: any) => console.log('Booking:', item);

  return (
    <View style={{ flex: 1, gap:20 }}>
      <Search
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />
      <Banner searchQuery={searchText} role={role} />
      <FlatList
        data={filteredSchedules}  // Use filteredSchedules instead of schedules
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ScheduleItem item={item} role={role} onBook={handleBook} onEdit={openForm} onDelete={handleDelete} />}
        contentContainerStyle={{ padding: 15, gap: 15, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
      {role === 'Admin' && !formVisible && (
        <TouchableOpacity onPress={() => openForm()} style={{ position: 'absolute', bottom: 120, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
      <ScheduleFormModal
        role={role}
        formVisible={formVisible}
        editingItem={editingItem}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}