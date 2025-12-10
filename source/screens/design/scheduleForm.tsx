import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';

const BOAT_TYPES = ['Fastcraft', 'RORO', 'Pumpboat', 'Sailboat'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function useScheduleForm() {
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const openForm = (item = null) => {
    setEditingItem(item);
    setFormVisible(true);
  };
  
  const closeForm = () => {
    setFormVisible(false);
    setEditingItem(null);
  };
  
  return { formVisible, editingItem, openForm, closeForm };
}

export default function ScheduleFormModal({ 
  role = 'Customer',
  formVisible,
  editingItem,
  onClose,
  onSubmit,
  onDelete
}: any) {
  const [form, setForm] = useState({
    boatName: '', from: '', to: '', price: '', time: '06:00 AM',
    boatType: 'Fastcraft', note: '', status: 'Available', weeklySchedule: []
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        boatName: editingItem.boatName || '',
        from: editingItem.from || '',
        to: editingItem.to || '',
        price: String(editingItem.price || ''),
        time: editingItem.time || '06:00 AM',
        boatType: editingItem.boatType || 'Fastcraft',
        note: editingItem.note || '',
        status: editingItem.status || 'Available',
        weeklySchedule: editingItem.weeklySchedule || []
      });
    } else {
      setForm({
        boatName: '', from: '', to: '', price: '', time: '06:00 AM',
        boatType: 'Fastcraft', note: '', status: 'Available', weeklySchedule: []
      });
    }
  }, [editingItem]);

  const handleSubmit = () => {
    if (!form.boatName || !form.from || !form.to || !form.price || !form.time) {
      alert('Please fill in all required fields'); return;
    }
    
    const formData = {
      ...form,
      price: parseInt(form.price) || 0
    };
    
    onSubmit(formData);
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.includes(day)
        ? prev.weeklySchedule.filter(d => d !== day)
        : [...prev.weeklySchedule, day]
    }));
  };

  // Don't render anything if form is not visible
  if (!formVisible) return null;

  return (
    <Modal animationType="slide" transparent visible={formVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>
                {editingItem ? 'Edit Schedule' : 'Add New Schedule'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Boat Name *</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.dark }}
                value={form.boatName}
                onChangeText={(text) => setForm(prev => ({ ...prev, boatName: text }))}
                placeholder="Enter boat name"
              />
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>From *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.dark }}
                  value={form.from}
                  onChangeText={(text) => setForm(prev => ({ ...prev, from: text }))}
                  placeholder="Departure"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>To *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.dark }}
                  value={form.to}
                  onChangeText={(text) => setForm(prev => ({ ...prev, to: text }))}
                  placeholder="Destination"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Price *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.dark }}
                  value={form.price}
                  onChangeText={(text) => setForm(prev => ({ ...prev, price: text }))}
                  placeholder="Enter price"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Time *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.dark }}
                  value={form.time}
                  onChangeText={(text) => setForm(prev => ({ ...prev, time: text }))}
                  placeholder="e.g., 06:00 AM"
                />
              </View>
            </View>

            <View style={{ marginBottom: 16, paddingHorizontal: 20, marginTop: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Boat Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {BOAT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
                      borderColor: form.boatType === type ? colors.primary : '#ddd',
                      backgroundColor: form.boatType === type ? colors.primary : 'white',
                    }}
                    onPress={() => setForm(prev => ({ ...prev, boatType: type }))}
                  >
                    <Text style={{ fontSize: 14, color: form.boatType === type ? 'white' : colors.dark, fontWeight: form.boatType === type ? '600' : '400' }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['Available', 'Unavailable'].map(status => {
                  const isSelected = form.status === status;
                  const bgColor = isSelected ? (status === 'Available' ? colors.success : colors.error) : 'white';
                  const borderColor = isSelected ? (status === 'Available' ? colors.success : colors.error) : '#ddd';
                  return (
                    <TouchableOpacity
                      key={status}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor, backgroundColor: bgColor }}
                      onPress={() => setForm(prev => ({ ...prev, status }))}
                    >
                      <Text style={{ fontSize: 14, color: isSelected ? 'white' : colors.dark, fontWeight: isSelected ? '600' : '400' }}>{status}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Weekly Schedule</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DAYS.map(day => {
                  const isSelected = form.weeklySchedule.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1,
                        borderColor: isSelected ? colors.primary : '#ddd',
                        backgroundColor: isSelected ? colors.primary : '#f5f5f5',
                      }}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={{ fontSize: 12, color: isSelected ? 'white' : '#666', fontWeight: '500' }}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>Note</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12, minHeight: 80, fontSize: 16, color: colors.dark }}
                value={form.note}
                onChangeText={(text) => setForm(prev => ({ ...prev, note: text }))}
                placeholder="Additional notes"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12, marginBottom: 20 }}>
              {editingItem && onDelete && (
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.error }}
                  onPress={() => onDelete(editingItem)}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary }}
                onPress={handleSubmit}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{editingItem ? 'Update' : 'Add Schedule'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}