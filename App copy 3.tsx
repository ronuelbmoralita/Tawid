// App.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, 
  SafeAreaView, StatusBar, Alert, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TURQUOISE = '#40E0D0';

// Simple Types - Boat and Route combined
type Schedule = {
  id: string;
  boat: string;
  route: string;
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
  type: 'Fastcraft' | 'RORO';
  status: 'Available' | 'Unavailable';
  days: string[];
  notes?: string;
};

const SCHEDULES_KEY = 'schedules';
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const minutes = ['00', '15', '30', '45'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'passenger' | 'admin'>('passenger');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  // Form State - Simple boat and route
  const [boat, setBoat] = useState('');
  const [route, setRoute] = useState('Real - Polillo');
  const [selectedHour, setSelectedHour] = useState('8');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [type, setType] = useState<'Fastcraft' | 'RORO'>('RORO');
  const [selectedDays, setSelectedDays] = useState<string[]>(daysOfWeek);
  const [notes, setNotes] = useState('');

  // Dropdown states
  const [hourDropdown, setHourDropdown] = useState(false);
  const [minuteDropdown, setMinuteDropdown] = useState(false);
  const [periodDropdown, setPeriodDropdown] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await AsyncStorage.getItem(SCHEDULES_KEY);
      if (data) setSchedules(JSON.parse(data));
    } catch (error) {
      console.error('Error loading:', error);
    }
  };

  const saveSchedules = async (newSchedules: Schedule[]) => {
    try {
      await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (error) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  // CRUD Operations
  const handleSave = async () => {
    if (!boat.trim() || !route.trim()) {
      Alert.alert('Error', 'Boat name and route are required');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Select at least one operating day');
      return;
    }

    const newSchedule: Schedule = {
      id: editingSchedule?.id || Date.now().toString(),
      boat: boat.trim(),
      route: route.trim(),
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod,
      type,
      status: 'Unavailable', // Default status
      days: selectedDays,
      notes: notes.trim() || undefined
    };

    const updatedSchedules = editingSchedule 
      ? schedules.map(s => s.id === editingSchedule.id ? newSchedule : s)
      : [...schedules, newSchedule];

    await saveSchedules(updatedSchedules);
    closeModal();
    Alert.alert('Success', `Schedule ${editingSchedule ? 'updated' : 'added'}`);
  };

  const deleteSchedule = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      { 
        text: 'Delete', 
        onPress: async () => {
          await saveSchedules(schedules.filter(s => s.id !== id));
        }
      }
    ]);
  };

  const toggleStatus = async (schedule: Schedule) => {
    const updatedSchedule = {
      ...schedule,
      status: schedule.status === 'Available' ? 'Unavailable' : 'Available'
    };
    
    const updatedSchedules = schedules.map(s => 
      s.id === schedule.id ? updatedSchedule : s
    );
    
    await saveSchedules(updatedSchedules);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Modal Management
  const openModal = (schedule?: Schedule) => {
    setEditingSchedule(schedule || null);
    setBoat(schedule?.boat || '');
    setRoute(schedule?.route || 'Real - Polillo');
    setSelectedHour(schedule?.hour || '8');
    setSelectedMinute(schedule?.minute || '00');
    setSelectedPeriod(schedule?.period || 'AM');
    setType(schedule?.type || 'RORO');
    setSelectedDays(schedule?.days || daysOfWeek);
    setNotes(schedule?.notes || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingSchedule(null);
    setBoat('');
    setRoute('Real - Polillo');
    setSelectedHour('8');
    setSelectedMinute('00');
    setSelectedPeriod('AM');
    setType('RORO');
    setSelectedDays(daysOfWeek);
    setNotes('');
    // Close all dropdowns
    setHourDropdown(false);
    setMinuteDropdown(false);
    setPeriodDropdown(false);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setHourDropdown(false);
    setMinuteDropdown(false);
    setPeriodDropdown(false);
  };

  // Get formatted time
  const getFormattedTime = (schedule: Schedule) => {
    return `${schedule.hour}:${schedule.minute} ${schedule.period}`;
  };

  // Sort by time
  const sortSchedulesByTime = (schedulesToSort: Schedule[]) => {
    return [...schedulesToSort].sort((a, b) => {
      const timeA = convertTimeToMinutes(getFormattedTime(a));
      const timeB = convertTimeToMinutes(getFormattedTime(b));
      return timeA - timeB;
    });
  };

  // Passenger Screen - SHOW ALL schedules including Unavailable
  const PassengerScreen = () => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Fastcraft' | 'RORO'>('All');
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // SHOW ALL schedules including Unavailable
    const todaysSchedules = schedules.filter(s => 
      s.days.includes(currentDay)
    );

    const filteredSchedules = todaysSchedules.filter(s => {
      const matchesSearch = s.route.toLowerCase().includes(search.toLowerCase()) ||
                           s.boat.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'All' || s.type === filterType;
      return matchesSearch && matchesType;
    });

    const sortedSchedules = sortSchedulesByTime(filteredSchedules);
    const fastcraftSchedules = sortedSchedules.filter(s => s.type === 'Fastcraft');
    const roroSchedules = sortedSchedules.filter(s => s.type === 'RORO');

    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Tawid - Passenger</Text>
        <Text style={styles.subtitle}>Today: {currentDay}</Text>

        <TextInput
          style={styles.search}
          placeholder="Search route or boat..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {(['All', 'Fastcraft', 'RORO'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterBtn, filterType === filter && styles.filterBtnActive]}
              onPress={() => setFilterType(filter)}
            >
              <Text style={[styles.filterText, filterType === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.list}>
          {sortedSchedules.length === 0 ? (
            <Text style={styles.empty}>No schedules for today</Text>
          ) : (
            <>
              {fastcraftSchedules.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🚤 FASTCRAFT</Text>
                  {fastcraftSchedules.map(schedule => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </View>
              )}
              
              {roroSchedules.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🛳️ RORO</Text>
                  {roroSchedules.map(schedule => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  // In the Passenger Screen - Update the ScheduleCard component
const ScheduleCard = ({ schedule }: { schedule: Schedule }) => (
  <View style={[
    styles.card,
    schedule.status === 'Unavailable' && styles.unavailableCard
  ]}>
    <View style={styles.cardHeader}>
      <View style={styles.routeInfo}>
        <Text style={styles.boat}>{schedule.boat}</Text>
        <Text style={styles.route}>{schedule.route}</Text>
      </View>
      <View style={styles.badges}>
        <Text style={[styles.type, { backgroundColor: schedule.type === 'Fastcraft' ? '#E0F7FA' : '#E3F2FD' }]}>
          {schedule.type}
        </Text>
        <Text style={[
          styles.status,
          { backgroundColor: schedule.status === 'Available' ? '#4CAF50' : '#FF6B6B' }
        ]}>
          {schedule.status}
        </Text>
      </View>
    </View>
    <Text style={styles.time}>🕐 {getFormattedTime(schedule)}</Text>
    <Text style={styles.days}>📅 {schedule.days.length === 7 ? 'Daily' : schedule.days.join(', ')}</Text>
    {schedule.notes && <Text style={styles.notes}>📝 {schedule.notes}</Text>}
  </View>
);

  // Admin Screen
  const AdminScreen = () => {
    const unavailableCount = schedules.filter(s => s.status === 'Unavailable').length;
    const sortedSchedules = sortSchedulesByTime(schedules);

    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Tawid - Admin</Text>

        {unavailableCount > 0 && (
          <View style={styles.unavailableAlert}>
            <Text>🚫 {unavailableCount} schedule(s) unavailable</Text>
          </View>
        )}

        <ScrollView style={styles.list}>
          {schedules.length === 0 ? (
            <Text style={styles.empty}>No schedules yet</Text>
          ) : (
            sortedSchedules.map(schedule => (
              <View key={schedule.id} style={[
                styles.card,
                schedule.status === 'Unavailable' && styles.unavailableCard
              ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.routeInfo}>
                    <Text style={styles.boat}>{schedule.boat}</Text>
                    <Text style={styles.route}>{schedule.route}</Text>
                    {schedule.status === 'Unavailable' && (
                      <Text style={styles.unavailableLabel}>🚫 UNAVAILABLE</Text>
                    )}
                  </View>
                  <View style={styles.badges}>
                    <Text style={[styles.type, { backgroundColor: schedule.type === 'Fastcraft' ? '#E0F7FA' : '#E3F2FD' }]}>
                      {schedule.type}
                    </Text>
                    <Text style={[
                      styles.status,
                      { backgroundColor: schedule.status === 'Available' ? '#4CAF50' : '#FF6B6B' }
                    ]}>
                      {schedule.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.time}>🕐 {getFormattedTime(schedule)}</Text>
                <Text style={styles.days}>📅 {schedule.days.length === 7 ? 'Daily' : schedule.days.join(', ')}</Text>
                {schedule.notes && <Text style={styles.notes}>📝 {schedule.notes}</Text>}
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.btn, styles.toggleBtn]}
                    onPress={() => toggleStatus(schedule)}
                  >
                    <Text style={styles.btnText}>
                      {schedule.status === 'Available' ? '🚫 Unavailable' : '✅ Available'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, styles.editBtn]}
                    onPress={() => openModal(schedule)}
                  >
                    <Text style={styles.btnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, styles.deleteBtn]}
                    onPress={() => deleteSchedule(schedule.id)}
                  >
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addBtnText}>+ Add Boat & Schedule</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Time Dropdown Component
  const TimeDropdown = () => (
    <View style={styles.timeContainer}>
      <Text style={styles.label}>Departure Time *</Text>
      
      <View style={styles.timeRow}>
        {/* Hour Dropdown */}
        <View style={styles.dropdownColumn}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              closeAllDropdowns();
              setHourDropdown(!hourDropdown);
            }}
          >
            <Text style={styles.dropdownButtonText}>{selectedHour}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          {hourDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                {hours.map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[styles.dropdownItem, selectedHour === hour && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedHour(hour);
                      setHourDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, selectedHour === hour && styles.dropdownItemTextActive]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Minute Dropdown */}
        <View style={styles.dropdownColumn}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              closeAllDropdowns();
              setMinuteDropdown(!minuteDropdown);
            }}
          >
            <Text style={styles.dropdownButtonText}>{selectedMinute}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          {minuteDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                {minutes.map(minute => (
                  <TouchableOpacity
                    key={minute}
                    style={[styles.dropdownItem, selectedMinute === minute && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedMinute(minute);
                      setMinuteDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, selectedMinute === minute && styles.dropdownItemTextActive]}>
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* AM/PM Dropdown */}
        <View style={styles.dropdownColumn}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              closeAllDropdowns();
              setPeriodDropdown(!periodDropdown);
            }}
          >
            <Text style={styles.dropdownButtonText}>{selectedPeriod}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          {periodDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.dropdownItem, selectedPeriod === 'AM' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedPeriod('AM');
                    setPeriodDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedPeriod === 'AM' && styles.dropdownItemTextActive]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dropdownItem, selectedPeriod === 'PM' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedPeriod('PM');
                    setPeriodDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedPeriod === 'PM' && styles.dropdownItemTextActive]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Selected Time Display */}
      <View style={styles.selectedTime}>
        <Text style={styles.selectedTimeText}>
          Selected: {selectedHour}:{selectedMinute} {selectedPeriod}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={TURQUOISE} />
      
      {currentScreen === 'passenger' ? <PassengerScreen /> : <AdminScreen />}

      {/* Main Schedule Modal - REMOVED Status field */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingSchedule ? 'Edit Schedule' : 'Add Boat & Schedule'}
            </Text>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Boat Name */}
              <Text style={styles.label}>Boat Name *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., M/V STARHORSE II" 
                value={boat} 
                onChangeText={setBoat} 
              />

              {/* Route */}
              <Text style={styles.label}>Route *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., Real - Polillo" 
                value={route} 
                onChangeText={setRoute} 
              />

              {/* Time Dropdown */}
              <TimeDropdown />

              <Text style={styles.label}>Boat Type *</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.option, type === 'Fastcraft' && styles.optionActive]}
                  onPress={() => setType('Fastcraft')}
                >
                  <Text style={[styles.optionText, type === 'Fastcraft' && styles.optionTextActive]}>🚤 Fastcraft</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.option, type === 'RORO' && styles.optionActive]}
                  onPress={() => setType('RORO')}
                >
                  <Text style={[styles.optionText, type === 'RORO' && styles.optionTextActive]}>🛳️ RORO</Text>
                </TouchableOpacity>
              </View>

              {/* REMOVED Status field - Default is Unavailable */}

              <Text style={styles.label}>Operating Days *</Text>
              <View style={styles.daysContainer}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayBtn, selectedDays.includes(day) && styles.dayBtnActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextActive]}>
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                style={styles.input} 
                placeholder="Notes (optional)" 
                value={notes} 
                onChangeText={setNotes} 
              />
            </ScrollView>

            {/* Fixed Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity 
          style={[styles.navBtn, currentScreen === 'passenger' && styles.navBtnActive]}
          onPress={() => setCurrentScreen('passenger')}
        >
          <Text style={[styles.navText, currentScreen === 'passenger' && styles.navTextActive]}>
            Passenger
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navBtn, currentScreen === 'admin' && styles.navBtnActive]}
          onPress={() => setCurrentScreen('admin')}
        >
          <Text style={[styles.navText, currentScreen === 'admin' && styles.navTextActive]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper function
function convertTimeToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + (minutes || 0);
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  screen: { flex: 1, padding: 16, paddingBottom: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: TURQUOISE, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  search: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16 },
  filterRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  filterBtn: { flex: 1, padding: 8, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  filterBtnActive: { backgroundColor: TURQUOISE, borderColor: TURQUOISE },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: 'white' },
  list: { flex: 1 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, backgroundColor: '#E0F7FA', padding: 8, borderRadius: 6 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  unavailableCard: { backgroundColor: '#FFF3CD', borderLeftWidth: 4, borderLeftColor: '#FFA500' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  routeInfo: { flex: 1 },
  boat: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  route: { fontSize: 14, color: '#666', marginTop: 2 },
  badges: { flexDirection: 'row', gap: 8 },
  type: { fontSize: 12, color: TURQUOISE, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  status: { fontSize: 10, color: 'white', fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  time: { fontSize: 14, color: '#666', marginBottom: 4 },
  days: { fontSize: 12, color: '#888', marginBottom: 4 },
  notes: { fontSize: 12, color: '#FF6B6B', fontStyle: 'italic' },
  unavailableLabel: { fontSize: 10, color: '#856404', fontWeight: 'bold', backgroundColor: '#FFEAA7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  btnText: { fontSize: 12, fontWeight: '600', color: 'white' },
  toggleBtn: { backgroundColor: '#FFA500' },
  editBtn: { backgroundColor: TURQUOISE },
  deleteBtn: { backgroundColor: '#FF6B6B' },
  addBtn: { backgroundColor: TURQUOISE, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  unavailableAlert: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FFA500' },
  // Modal
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modal: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 0,
    maxHeight: '70%', // Maximum height 70%
    width: '100%'
  },
  modalContent: {
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
    gap: 8
  },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  option: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  optionActive: { backgroundColor: TURQUOISE, borderColor: TURQUOISE },
  optionText: { fontSize: 14, color: '#666' },
  optionTextActive: { color: 'white' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  dayBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: 'white', minWidth: 50, alignItems: 'center' },
  dayBtnActive: { backgroundColor: TURQUOISE, borderColor: TURQUOISE },
  dayText: { fontSize: 12, fontWeight: '500', color: '#666' },
  dayTextActive: { color: 'white' },
  // Time Dropdown
  timeContainer: { marginBottom: 12 },
  timeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dropdownColumn: { flex: 1, position: 'relative' },
  dropdownButton: { 
    backgroundColor: '#f8f9fa', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdownButtonText: { fontSize: 16, color: '#333' },
  dropdownArrow: { fontSize: 12, color: '#666' },
  dropdownList: { 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    backgroundColor: 'white', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: { flex: 1 },
  dropdownItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  dropdownItemActive: { backgroundColor: TURQUOISE },
  dropdownItemText: { fontSize: 14, color: '#333', textAlign: 'center' },
  dropdownItemTextActive: { color: 'white' },
  selectedTime: { 
    backgroundColor: '#E0F7FA', 
    padding: 8, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  selectedTimeText: { 
    fontSize: 14, 
    color: TURQUOISE, 
    fontWeight: '600' 
  },
  modalBtn: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  cancelBtn: { 
    backgroundColor: '#e0e0e0' 
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600'
  },
  saveBtn: { 
    backgroundColor: TURQUOISE 
  },
  saveBtnText: { 
    color: 'white', 
    fontWeight: '600' 
  },
  // Navigation
  nav: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    margin: 16, 
    borderRadius: 25, 
    padding: 8, 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 5 
  },
  navBtn: { flex: 1, padding: 12, borderRadius: 20, alignItems: 'center' },
  navBtnActive: { backgroundColor: TURQUOISE },
  navText: { fontSize: 14, fontWeight: '600', color: '#666' },
  navTextActive: { color: 'white' },
});