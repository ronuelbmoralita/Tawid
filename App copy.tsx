// App.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, TextInput, 
  Alert, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useBehavior } from './behavior';

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
  price?: string; // <-- Added
};


const SCHEDULES_KEY = 'schedules';
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const minutes = ['00', '15', '30', '45'];

export default function App() {

  const behaviour = useBehavior()

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
  const [status, setStatus] = useState<'Available' | 'Unavailable'>('Unavailable');
  const [selectedDays, setSelectedDays] = useState<string[]>(daysOfWeek);
  const [notes, setNotes] = useState('');
const [price, setPrice] = useState('');

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
  status,
  days: selectedDays,
  notes: notes.trim() || undefined,
  price: price.trim() || undefined // <-- Added
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
  setStatus(schedule?.status || 'Unavailable');
  setSelectedDays(schedule?.days || daysOfWeek);
  setNotes(schedule?.notes || '');
  setPrice(schedule?.price || ''); // <-- Added
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
  setStatus('Unavailable');
  setSelectedDays(daysOfWeek);
  setNotes('');
  setPrice(''); // <-- Reset
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
      <View style={{ flex: 1, padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: TURQUOISE, textAlign: 'center', marginBottom: 8 }}>Tawid - Passenger</Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 }}>Today: {currentDay}</Text>

        <TextInput
          style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16 }}
          placeholder="Search route or boat..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
          {(['All', 'Fastcraft', 'RORO'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                { flex: 1, padding: 8, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
                filterType === filter && { backgroundColor: TURQUOISE, borderColor: TURQUOISE }
              ]}
              onPress={() => setFilterType(filter)}
            >
              <Text style={[
                { fontSize: 12, fontWeight: '600', color: '#666' },
                filterType === filter && { color: 'white' }
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }}>
          {sortedSchedules.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 }}>No schedules for today</Text>
          ) : (
            <>
              {fastcraftSchedules.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, backgroundColor: '#E0F7FA', padding: 8, borderRadius: 6 }}>🚤 FASTCRAFT</Text>
                  {fastcraftSchedules.map(schedule => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </View>
              )}
              
              {roroSchedules.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, backgroundColor: '#E3F2FD', padding: 8, borderRadius: 6 }}>🛳️ RORO</Text>
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

  const ScheduleCard = ({ schedule }: { schedule: Schedule }) => (
    <View style={[
      { 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12, 
        borderLeftWidth: 4, 
        borderLeftColor: TURQUOISE, 
        marginBottom: 12, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3 
      },
      schedule.status === 'Unavailable' && { backgroundColor: '#FFF3CD', borderLeftColor: '#FFA500' }
    ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{schedule.boat}</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>{schedule.route}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ 
            fontSize: 12, 
            color: TURQUOISE, 
            fontWeight: '600', 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 6,
            backgroundColor: schedule.type === 'Fastcraft' ? '#E0F7FA' : '#E3F2FD'
          }}>
            {schedule.type}
          </Text>
          <Text style={{
            fontSize: 10, 
            color: 'white', 
            fontWeight: '600', 
            paddingHorizontal: 6, 
            paddingVertical: 2, 
            borderRadius: 4,
            backgroundColor: schedule.status === 'Available' ? '#4CAF50' : '#FF6B6B'
          }}>
            {schedule.status}
          </Text>
        </View>
      </View>
      {schedule.price && <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>💰 {schedule.price}</Text>}
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>🕐 {getFormattedTime(schedule)}</Text>
      <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>📅 {schedule.days.length === 7 ? 'Daily' : schedule.days.join(', ')}</Text>
      {schedule.notes && <Text style={{ fontSize: 12, color: '#FF6B6B', fontStyle: 'italic' }}>📝 {schedule.notes}</Text>}
    </View>
  );

  // Admin Screen
  const AdminScreen = () => {
    const unavailableCount = schedules.filter(s => s.status === 'Unavailable').length;
    const sortedSchedules = sortSchedulesByTime(schedules);

    return (
      <View style={{ flex: 1, padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: TURQUOISE, textAlign: 'center', marginBottom: 8 }}>Tawid - Admin</Text>

        {unavailableCount > 0 && (
          <View style={{ backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FFA500' }}>
            <Text>🚫 {unavailableCount} schedule(s) unavailable</Text>
          </View>
        )}

        <ScrollView style={{ flex: 1 }}>
          {schedules.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 }}>No schedules yet</Text>
          ) : (
            sortedSchedules.map(schedule => (
              <View key={schedule.id} style={[
                { 
                  backgroundColor: 'white', 
                  padding: 16, 
                  borderRadius: 12, 
                  borderLeftWidth: 4, 
                  borderLeftColor: TURQUOISE, 
                  marginBottom: 12, 
                  shadowColor: '#000', 
                  shadowOffset: { width: 0, height: 2 }, 
                  shadowOpacity: 0.1, 
                  shadowRadius: 4, 
                  elevation: 3 
                },
                schedule.status === 'Unavailable' && { backgroundColor: '#FFF3CD', borderLeftColor: '#FFA500' }
              ]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{schedule.boat}</Text>
                    <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>{schedule.route}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ 
                      fontSize: 12, 
                      color: TURQUOISE, 
                      fontWeight: '600', 
                      paddingHorizontal: 8, 
                      paddingVertical: 4, 
                      borderRadius: 6,
                      backgroundColor: schedule.type === 'Fastcraft' ? '#E0F7FA' : '#E3F2FD'
                    }}>
                      {schedule.type}
                    </Text>
                    <TouchableOpacity 
                      style={{
                        fontSize: 10, 
                        color: 'white', 
                        fontWeight: '600', 
                        paddingHorizontal: 6, 
                        paddingVertical: 2, 
                        borderRadius: 4,
                        backgroundColor: schedule.status === 'Available' ? '#4CAF50' : '#FF6B6B',
                        minWidth: 70,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onPress={() => openModal(schedule)}
                    >
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                        {schedule.status}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {schedule.price && <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>💰 {schedule.price}</Text>}

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>🕐 {getFormattedTime(schedule)}</Text>
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>📅 {schedule.days.length === 7 ? 'Daily' : schedule.days.join(', ')}</Text>
                {schedule.notes && <Text style={{ fontSize: 12, color: '#FF6B6B', fontStyle: 'italic' }}>📝 {schedule.notes}</Text>}
                
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                  <TouchableOpacity 
                    style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: TURQUOISE }}
                    onPress={() => openModal(schedule)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#FF6B6B' }}
                    onPress={() => deleteSchedule(schedule.id)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity 
          style={{ backgroundColor: TURQUOISE, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 }} 
          onPress={() => openModal()}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>+ Add Boat & Schedule</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Time Dropdown Component
  const TimeDropdown = () => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Departure Time *</Text>
      
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {/* Hour Dropdown */}
        <View style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#f8f9fa', 
              padding: 12, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: '#e0e0e0',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onPress={() => {
              closeAllDropdowns();
              setHourDropdown(!hourDropdown);
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>{selectedHour}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>▼</Text>
          </TouchableOpacity>
          
          {hourDropdown && (
            <View style={{ 
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
            }}>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {hours.map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
                      selectedHour === hour && { backgroundColor: TURQUOISE }
                    ]}
                    onPress={() => {
                      setSelectedHour(hour);
                      setHourDropdown(false);
                    }}
                  >
                    <Text style={[
                      { fontSize: 14, color: '#333', textAlign: 'center' },
                      selectedHour === hour && { color: 'white' }
                    ]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Minute Dropdown */}
        <View style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#f8f9fa', 
              padding: 12, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: '#e0e0e0',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onPress={() => {
              closeAllDropdowns();
              setMinuteDropdown(!minuteDropdown);
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>{selectedMinute}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>▼</Text>
          </TouchableOpacity>
          
          {minuteDropdown && (
            <View style={{ 
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
            }}>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {minutes.map(minute => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
                      selectedMinute === minute && { backgroundColor: TURQUOISE }
                    ]}
                    onPress={() => {
                      setSelectedMinute(minute);
                      setMinuteDropdown(false);
                    }}
                  >
                    <Text style={[
                      { fontSize: 14, color: '#333', textAlign: 'center' },
                      selectedMinute === minute && { color: 'white' }
                    ]}>
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* AM/PM Dropdown */}
        <View style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#f8f9fa', 
              padding: 12, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: '#e0e0e0',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onPress={() => {
              closeAllDropdowns();
              setPeriodDropdown(!periodDropdown);
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>{selectedPeriod}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>▼</Text>
          </TouchableOpacity>
          
          {periodDropdown && (
            <View style={{ 
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
            }}>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
                    selectedPeriod === 'AM' && { backgroundColor: TURQUOISE }
                  ]}
                  onPress={() => {
                    setSelectedPeriod('AM');
                    setPeriodDropdown(false);
                  }}
                >
                  <Text style={[
                    { fontSize: 14, color: '#333', textAlign: 'center' },
                    selectedPeriod === 'AM' && { color: 'white' }
                  ]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
                    selectedPeriod === 'PM' && { backgroundColor: TURQUOISE }
                  ]}
                  onPress={() => {
                    setSelectedPeriod('PM');
                    setPeriodDropdown(false);
                  }}
                >
                  <Text style={[
                    { fontSize: 14, color: '#333', textAlign: 'center' },
                    selectedPeriod === 'PM' && { color: 'white' }
                  ]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Selected Time Display */}
      <View style={{ backgroundColor: '#E0F7FA', padding: 8, borderRadius: 6, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: TURQUOISE, fontWeight: '600' }}>
          Selected: {selectedHour}:{selectedMinute} {selectedPeriod}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar backgroundColor={TURQUOISE} />
      
      {currentScreen === 'passenger' ? <PassengerScreen /> : <AdminScreen />}

      {/* Main Schedule Modal - ADDED BACK Status field */}
      <Modal statusBarTranslucent visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={behaviour} style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 12, 
            padding: 0,
            maxHeight: '70%',
            width: '100%'
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              marginBottom: 16, 
              textAlign: 'center',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#e0e0e0'
            }}>
              {editingSchedule ? 'Edit Schedule' : 'Add Boat & Schedule'}
            </Text>

            <ScrollView style={{
              paddingHorizontal: 20,
              maxHeight: '90%',
            }} showsVerticalScrollIndicator={false}>
              {/* Boat Name */}
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Boat Name *</Text>
              <TextInput 
                style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 }} 
                placeholder="e.g., M/V STARHORSE II" 
                value={boat} 
                onChangeText={setBoat} 
              />

              {/* Route */}
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Route *</Text>
              <TextInput 
                style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 }} 
                placeholder="e.g., Real - Polillo" 
                value={route} 
                onChangeText={setRoute} 
              />

              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Price *</Text>
<TextInput 
  style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 }} 
  placeholder="e.g., 500" 
  keyboardType="numeric"
  value={price} 
  onChangeText={setPrice} 
/>

              {/* Time Dropdown */}
              <TimeDropdown />

              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Boat Type *</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity 
                  style={[
                    { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
                    type === 'Fastcraft' && { backgroundColor: TURQUOISE, borderColor: TURQUOISE }
                  ]}
                  onPress={() => setType('Fastcraft')}
                >
                  <Text style={[
                    { fontSize: 14, color: '#666' },
                    type === 'Fastcraft' && { color: 'white' }
                  ]}>🚤 Fastcraft</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
                    type === 'RORO' && { backgroundColor: TURQUOISE, borderColor: TURQUOISE }
                  ]}
                  onPress={() => setType('RORO')}
                >
                  <Text style={[
                    { fontSize: 14, color: '#666' },
                    type === 'RORO' && { color: 'white' }
                  ]}>🛳️ RORO</Text>
                </TouchableOpacity>
              </View>

              {/* ADDED BACK Status field */}
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Status *</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity 
                  style={[
                    { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
                    status === 'Available' && { backgroundColor: TURQUOISE, borderColor: TURQUOISE }
                  ]}
                  onPress={() => setStatus('Available')}
                >
                  <Text style={[
                    { fontSize: 14, color: '#666' },
                    status === 'Available' && { color: 'white' }
                  ]}>✅ Available</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
                    status === 'Unavailable' && { backgroundColor: TURQUOISE, borderColor: TURQUOISE }
                  ]}
                  onPress={() => setStatus('Unavailable')}
                >
                  <Text style={[
                    { fontSize: 14, color: '#666' },
                    status === 'Unavailable' && { color: 'white' }
                  ]}>🚫 Unavailable</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Operating Days *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: 'white', minWidth: 50, alignItems: 'center' },
                      selectedDays.includes(day) && { backgroundColor: TURQUOISE, borderColor: TURQUOISE }
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      { fontSize: 12, fontWeight: '500', color: '#666' },
                      selectedDays.includes(day) && { color: 'white' }
                    ]}>
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 }} 
                placeholder="Notes (optional)" 
                value={notes} 
                onChangeText={setNotes} 
              />
            </ScrollView>

            {/* Fixed Footer Buttons */}
            <View style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              padding: 16,
              gap: 8
            }}>
              <TouchableOpacity 
                style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#e0e0e0' }} 
                onPress={closeModal}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: TURQUOISE }} 
                onPress={handleSave}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Navigation */}
      <View style={{ 
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
      }}>
        <TouchableOpacity 
          style={[
            { flex: 1, padding: 12, borderRadius: 20, alignItems: 'center' },
            currentScreen === 'passenger' && { backgroundColor: TURQUOISE }
          ]}
          onPress={() => setCurrentScreen('passenger')}
        >
          <Text style={[
            { fontSize: 14, fontWeight: '600', color: '#666' },
            currentScreen === 'passenger' && { color: 'white' }
          ]}>
            Passenger
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            { flex: 1, padding: 12, borderRadius: 20, alignItems: 'center' },
            currentScreen === 'admin' && { backgroundColor: TURQUOISE }
          ]}
          onPress={() => setCurrentScreen('admin')}
        >
          <Text style={[
            { fontSize: 14, fontWeight: '600', color: '#666' },
            currentScreen === 'admin' && { color: 'white' }
          ]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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