// App.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  SafeAreaView, 
  StatusBar, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TURQUOISE = '#40E0D0';
const TURQUOISE_DARK = '#20B2AA';

// Types - Simplified with departure time only
type Schedule = {
  id: string;
  route: string;
  boat: string;
  departure: string; // Departure time only
  type: 'Fastcraft' | 'RORO';
  status: 'Active' | 'Inactive';
  days: string[]; // Specific days like ['Wednesday', 'Saturday']
  notes?: string; // Additional notes like "Cargoes"
};

// Storage Keys
const STORAGE_KEYS = {
  SCHEDULES: 'schedules',
};

// Universal Modal Component
const UniversalModal = ({ 
  visible, 
  onClose, 
  title, 
  children,
  onSave 
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {children}
          
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            {onSave && (
              <TouchableOpacity onPress={onSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Passenger Screen Component
const PassengerScreen = ({ schedules }: { schedules: Schedule[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Fastcraft' | 'RORO'>('All');

  // Get current day
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Filter: only active schedules for today or everyday schedules
  const activeSchedules = schedules.filter(schedule => 
    schedule.status === 'Active' && 
    (schedule.days.includes('Everyday') || schedule.days.includes(currentDay))
  );
  
  const filteredSchedules = activeSchedules.filter(schedule => {
    const matchesSearch = 
      schedule.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.boat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || schedule.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Sort by departure time
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    const timeA = convertTimeToMinutes(a.departure);
    const timeB = convertTimeToMinutes(b.departure);
    return timeA - timeB;
  });

  // Group by type for better display
  const fastcraftSchedules = sortedSchedules.filter(s => s.type === 'Fastcraft');
  const roroSchedules = sortedSchedules.filter(s => s.type === 'RORO');

  // Helper function to convert time string to minutes for sorting
  function convertTimeToMinutes(timeStr: string): number {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Tawid - Passenger</Text>
      <Text style={styles.currentDay}>Today: {currentDay}</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search boat name or route..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by type:</Text>
        <View style={styles.filterButtons}>
          {(['All', 'Fastcraft', 'RORO'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.filterButtonActive
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedType === type && styles.filterButtonTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Schedule List */}
      <ScrollView style={styles.scheduleList}>
        {sortedSchedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {activeSchedules.length === 0 
                ? "No available schedules for today" 
                : "No schedules match your search"
              }
            </Text>
            <Text style={styles.emptyStateSubText}>
              {activeSchedules.length === 0 
                ? "Check back on other days" 
                : "Try different search terms or filters"
              }
            </Text>
          </View>
        ) : (
          <>
            {/* Fastcraft Section */}
            {fastcraftSchedules.length > 0 && (
              <View style={styles.scheduleSection}>
                <Text style={styles.sectionHeader}>🚤 FASTCRAFT</Text>
                {fastcraftSchedules.map(schedule => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </View>
            )}

            {/* RORO Section */}
            {roroSchedules.length > 0 && (
              <View style={styles.scheduleSection}>
                <Text style={styles.sectionHeader}>🛳️ RORO</Text>
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

// Schedule Card Component
const ScheduleCard = ({ schedule }: { schedule: Schedule }) => {
  return (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.boatInfo}>
          <Text style={styles.boatName}>{schedule.boat}</Text>
          <Text style={styles.routeText}>📍 {schedule.route}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.departureTime}>{schedule.departure}</Text>
          <Text style={styles.departureLabel}>DEPARTURE</Text>
        </View>
      </View>
      
      <View style={styles.scheduleFooter}>
        <Text style={styles.daysText}>
          📅 {schedule.days.length === 7 ? 'Daily' : schedule.days.join(', ')}
        </Text>
        {schedule.notes && (
          <Text style={styles.notesText}>📝 {schedule.notes}</Text>
        )}
      </View>
    </View>
  );
};

// Admin Screen Component
const AdminScreen = ({ 
  schedules, 
  onDataUpdate 
}: { 
  schedules: Schedule[];
  onDataUpdate: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'boats'>('schedules');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  // Form states
  const [formRoute, setFormRoute] = useState('Real - Polillo');
  const [formBoat, setFormBoat] = useState('');
  const [formDeparture, setFormDeparture] = useState('');
  const [formType, setFormType] = useState<'Fastcraft' | 'RORO'>('RORO');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formDays, setFormDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [formNotes, setFormNotes] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const openModal = (schedule?: Schedule) => {
    setEditingSchedule(schedule || null);
    
    // Reset form or populate with existing data
    setFormRoute(schedule?.route || 'Real - Polillo');
    setFormBoat(schedule?.boat || '');
    setFormDeparture(schedule?.departure || '');
    setFormType(schedule?.type || 'RORO');
    setFormStatus(schedule?.status || 'Active');
    setFormDays(schedule?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    setFormNotes(schedule?.notes || '');
    
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingSchedule(null);
  };

  const toggleDay = (day: string) => {
    setFormDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!formRoute.trim() || !formBoat.trim() || !formDeparture.trim()) {
      Alert.alert('Error', 'Route, Boat Name, and Departure Time are required');
      return;
    }

    if (formDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    try {
      const newSchedule: Schedule = {
        id: editingSchedule?.id || Date.now().toString(),
        route: formRoute,
        boat: formBoat,
        departure: formDeparture,
        type: formType,
        status: formStatus,
        days: formDays,
        notes: formNotes.trim() || undefined
      };

      const updatedSchedules = editingSchedule 
        ? schedules.map(schedule => schedule.id === editingSchedule.id ? newSchedule : schedule)
        : [...schedules, newSchedule];

      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updatedSchedules));

      Alert.alert('Success', `Schedule ${editingSchedule ? 'updated' : 'added'} successfully`);
      closeModal();
      onDataUpdate();
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule');
    }
  };

  const deleteSchedule = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
              await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updatedSchedules));
              
              Alert.alert('Success', 'Schedule deleted successfully');
              onDataUpdate();
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Error', 'Failed to delete schedule');
            }
          }
        }
      ]
    );
  };

  const toggleScheduleStatus = async (schedule: Schedule) => {
    try {
      const updatedSchedule: Schedule = {
        ...schedule,
        status: schedule.status === 'Active' ? 'Inactive' : 'Active'
      };

      const updatedSchedules = schedules.map(s => 
        s.id === schedule.id ? updatedSchedule : s
      );

      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updatedSchedules));
      onDataUpdate();
      
      Alert.alert('Success', `Schedule ${updatedSchedule.status === 'Active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating schedule status:', error);
      Alert.alert('Error', 'Failed to update schedule status');
    }
  };

  const renderSchedulesContent = () => {
    // Sort schedules by departure time
    const sortedSchedules = [...schedules].sort((a, b) => {
      const timeA = convertTimeToMinutes(a.departure);
      const timeB = convertTimeToMinutes(b.departure);
      return timeA - timeB;
    });

    // Group by type
    const fastcraftSchedules = sortedSchedules.filter(s => s.type === 'Fastcraft');
    const roroSchedules = sortedSchedules.filter(s => s.type === 'RORO');

    // Helper function to convert time string to minutes for sorting
    function convertTimeToMinutes(timeStr: string): number {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Manage Schedules</Text>
        
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No schedules yet</Text>
            <Text style={styles.emptyStateSubText}>Add your first schedule to get started</Text>
          </View>
        ) : (
          <>
            {fastcraftSchedules.length > 0 && (
              <View style={styles.adminSection}>
                <Text style={styles.sectionHeader}>🚤 FASTCRAFT SCHEDULES</Text>
                {fastcraftSchedules.map(schedule => (
                  <AdminScheduleCard 
                    key={schedule.id} 
                    schedule={schedule}
                    onEdit={openModal}
                    onDelete={deleteSchedule}
                    onToggleStatus={toggleScheduleStatus}
                  />
                ))}
              </View>
            )}

            {roroSchedules.length > 0 && (
              <View style={styles.adminSection}>
                <Text style={styles.sectionHeader}>🛳️ RORO SCHEDULES</Text>
                {roroSchedules.map(schedule => (
                  <AdminScheduleCard 
                    key={schedule.id} 
                    schedule={schedule}
                    onEdit={openModal}
                    onDelete={deleteSchedule}
                    onToggleStatus={toggleScheduleStatus}
                  />
                ))}
              </View>
            )}
          </>
        )}
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => openModal()}
        >
          <Text style={styles.addButtonText}>+ Add New Schedule</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const AdminScheduleCard = ({ 
    schedule, 
    onEdit, 
    onDelete, 
    onToggleStatus 
  }: { 
    schedule: Schedule;
    onEdit: (schedule: Schedule) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (schedule: Schedule) => void;
  }) => {
    return (
      <View style={styles.adminCard}>
        <View style={styles.scheduleHeader}>
          <View style={styles.boatInfo}>
            <Text style={styles.adminCardTitle}>{schedule.boat}</Text>
            <Text style={styles.adminCardText}>📍 {schedule.route}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.departureTime}>{schedule.departure}</Text>
            <Text style={styles.departureLabel}>DEPARTURE</Text>
            <Text style={[
              styles.statusBadge,
              { backgroundColor: schedule.status === 'Active' ? '#4CAF50' : '#FF6B6B' }
            ]}>
              {schedule.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.scheduleFooter}>
          <Text style={styles.daysText}>
            📅 {schedule.days.length === 7 ? 'Daily' : schedule.days.join(', ')}
          </Text>
          {schedule.notes && (
            <Text style={styles.notesText}>📝 {schedule.notes}</Text>
          )}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => onToggleStatus(schedule)}
          >
            <Text style={styles.statusButtonText}>
              {schedule.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => onEdit(schedule)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete(schedule.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBoatsContent = () => {
    // Extract unique boats from schedules
    const uniqueBoats = Array.from(new Set(schedules.map(s => s.boat)));
    
    return (
      <View>
        <Text style={styles.sectionTitle}>Available Boats</Text>
        <Text style={styles.sectionSubtitle}>Boats are managed through schedules</Text>
        
        {uniqueBoats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No boats yet</Text>
            <Text style={styles.emptyStateSubText}>Add a schedule to see boats here</Text>
          </View>
        ) : (
          uniqueBoats.map((boat, index) => {
            const boatSchedules = schedules.filter(s => s.boat === boat);
            const activeSchedules = boatSchedules.filter(s => s.status === 'Active');
            
            return (
              <View key={index} style={styles.adminCard}>
                <Text style={styles.adminCardTitle}>🚢 {boat}</Text>
                <Text style={styles.adminCardText}>
                  Active Schedules: {activeSchedules.length}
                </Text>
                <Text style={styles.adminCardText}>
                  Total Schedules: {boatSchedules.length}
                </Text>
                <Text style={styles.adminCardText}>
                  Types: {Array.from(new Set(boatSchedules.map(s => s.type))).join(', ')}
                </Text>
              </View>
            );
          })
        )}
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Tawid - Admin</Text>
      
      {/* Admin Tabs */}
      <View style={styles.adminTabs}>
        <TouchableOpacity 
          style={[styles.adminTab, activeTab === 'schedules' && styles.activeAdminTab]}
          onPress={() => setActiveTab('schedules')}
        >
          <Text style={[styles.adminTabText, activeTab === 'schedules' && styles.activeAdminTabText]}>
            🕐 Schedules
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.adminTab, activeTab === 'boats' && styles.activeAdminTab]}
          onPress={() => setActiveTab('boats')}
        >
          <Text style={[styles.adminTabText, activeTab === 'boats' && styles.activeAdminTabText]}>
            🚢 Boats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Admin Content */}
      <ScrollView style={styles.adminContent}>
        {activeTab === 'schedules' ? renderSchedulesContent() : renderBoatsContent()}
      </ScrollView>

      {/* Universal Modal for Schedules */}
      <UniversalModal
        visible={modalVisible}
        onClose={closeModal}
        title={`${editingSchedule ? 'Edit' : 'Add New'} Schedule`}
        onSave={handleSave}
      >
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formLabel}>Route *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g., Real - Polillo"
            value={formRoute}
            onChangeText={setFormRoute}
          />

          <Text style={styles.formLabel}>Boat Name *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g., M/V STARHORSE II"
            value={formBoat}
            onChangeText={setFormBoat}
          />

          <Text style={styles.formLabel}>Departure Time *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g., 5:30 AM"
            value={formDeparture}
            onChangeText={setFormDeparture}
          />

          <Text style={styles.formLabel}>Boat Type *</Text>
          <View style={styles.radioOptions}>
            <TouchableOpacity 
              style={[styles.radioButton, formType === 'Fastcraft' && styles.radioButtonActive]}
              onPress={() => setFormType('Fastcraft')}
            >
              <Text style={[styles.radioText, formType === 'Fastcraft' && styles.radioTextActive]}>
                🚤 Fastcraft
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radioButton, formType === 'RORO' && styles.radioButtonActive]}
              onPress={() => setFormType('RORO')}
            >
              <Text style={[styles.radioText, formType === 'RORO' && styles.radioTextActive]}>
                🛳️ RORO
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>Operating Days *</Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  formDays.includes(day) && styles.dayButtonActive
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  formDays.includes(day) && styles.dayButtonTextActive
                ]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Status</Text>
          <View style={styles.radioOptions}>
            <TouchableOpacity 
              style={[styles.radioButton, formStatus === 'Active' && styles.radioButtonActive]}
              onPress={() => setFormStatus('Active')}
            >
              <Text style={[styles.radioText, formStatus === 'Active' && styles.radioTextActive]}>
                🟢 Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radioButton, formStatus === 'Inactive' && styles.radioButtonActive]}
              onPress={() => setFormStatus('Inactive')}
            >
              <Text style={[styles.radioText, formStatus === 'Inactive' && styles.radioTextActive]}>
                🔴 Inactive
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g., Cargoes only, Special trip, etc."
            value={formNotes}
            onChangeText={setFormNotes}
          />
        </ScrollView>
      </UniversalModal>
    </View>
  );
};

// Main App Component
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'passenger' | 'admin'>('passenger');
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const schedulesData = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (schedulesData) {
        setSchedules(JSON.parse(schedulesData));
      } else {
        // Start with empty array - no preloaded data
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={TURQUOISE} barStyle="dark-content" />
      
      {/* Main Content */}
      {currentScreen === 'passenger' ? (
        <PassengerScreen schedules={schedules} />
      ) : (
        <AdminScreen 
          schedules={schedules} 
          onDataUpdate={loadData}
        />
      )}

      {/* Floating Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            currentScreen === 'passenger' && styles.activeNavButton
          ]}
          onPress={() => setCurrentScreen('passenger')}
        >
          <Text style={[
            styles.navButtonText,
            currentScreen === 'passenger' && styles.activeNavButtonText
          ]}>
            🚢 Passenger
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navButton, 
            currentScreen === 'admin' && styles.activeNavButton
          ]}
          onPress={() => setCurrentScreen('admin')}
        >
          <Text style={[
            styles.navButtonText,
            currentScreen === 'admin' && styles.activeNavButtonText
          ]}>
            ⚙️ Admin
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  screenContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TURQUOISE_DARK,
    marginBottom: 4,
    textAlign: 'center',
  },
  currentDay: {
    fontSize: 16,
    color: TURQUOISE,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: TURQUOISE,
    borderColor: TURQUOISE,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  scheduleList: {
    flex: 1,
  },
  scheduleSection: {
    marginBottom: 20,
  },
  adminSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#E0F7FA',
    padding: 8,
    borderRadius: 6,
  },
  scheduleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  boatInfo: {
    flex: 1,
    marginRight: 8,
  },
  boatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  adminCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  departureTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TURQUOISE,
    marginBottom: 2,
  },
  departureLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  scheduleFooter: {
    gap: 4,
  },
  daysText: {
    fontSize: 12,
    color: '#888',
  },
  adminCardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  adminTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adminTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeAdminTab: {
    backgroundColor: TURQUOISE,
  },
  adminTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeAdminTabText: {
    color: 'white',
    fontWeight: '600',
  },
  adminContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  statusButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: TURQUOISE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: TURQUOISE,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeNavButton: {
    backgroundColor: TURQUOISE,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeNavButtonText: {
    color: 'white',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: 500,
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 8,
  },
  radioOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioButtonActive: {
    backgroundColor: TURQUOISE,
    borderColor: TURQUOISE,
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  radioTextActive: {
    color: 'white',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  dayButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: TURQUOISE,
    borderColor: TURQUOISE,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: TURQUOISE,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});