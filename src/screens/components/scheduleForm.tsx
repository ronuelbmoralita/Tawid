import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { colors } from '../../components/colors';
import Icon from '../../components/icons';

const BOAT_TYPES = ['Fastcraft', 'RORO'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function useScheduleForm() {
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  return {
    formVisible, editingItem,
    openForm: (item = null) => { setEditingItem(item); setFormVisible(true); },
    closeForm: () => { setFormVisible(false); setTimeout(() => setEditingItem(null), 100); }
  };
}

const InputField = ({ label, value, onChange, placeholder, keyboardType = 'default', multiline = false }) => (
  <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>{label}</Text>
    <TextInput
      style={{
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
        fontSize: 16, color: colors.dark, ...(multiline && { minHeight: 80, textAlignVertical: 'top' })
      }}
      value={value} onChangeText={onChange} placeholder={placeholder}
      keyboardType={keyboardType} multiline={multiline} numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

const OptionGroup = ({ label, options, selected, onSelect, colorMap = {} }) => (
  <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 8 }}>{label}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const isSelected = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        const color = colorMap[opt] || colors.primary;
        return (
          <TouchableOpacity
            key={opt}
            style={{
              paddingHorizontal: Array.isArray(selected) ? 12 : 16,
              paddingVertical: Array.isArray(selected) ? 6 : 8,
              borderRadius: Array.isArray(selected) ? 6 : 20,
              borderWidth: 1, borderColor: isSelected ? color : '#ddd',
              backgroundColor: isSelected ? color : Array.isArray(selected) ? '#f5f5f5' : 'white'
            }}
            onPress={() => onSelect(opt)}
          >
            <Text style={{ fontSize: Array.isArray(selected) ? 12 : 14, color: isSelected ? 'white' : colors.dark }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default function ScheduleFormModal({ formVisible, editingItem, onClose, onSubmit, onDelete }: any) {
  const [form, setForm] = useState({
    boatName: '', from: '', to: '', price: '', time: '06:00 AM', boatType: 'Fastcraft',
    note: '', status: 'Available', weeklySchedule: [], capacity: ''
  });

  useEffect(() => {
    setForm(editingItem ? {
      boatName: editingItem.boatName || '', from: editingItem.from || '', to: editingItem.to || '',
      price: String(editingItem.price || ''), time: editingItem.time || '06:00 AM',
      boatType: editingItem.boatType || 'Fastcraft', note: editingItem.note || '',
      status: editingItem.status || 'Available', weeklySchedule: editingItem.weeklySchedule || [],
      capacity: String(editingItem.capacity || '')
    } : {
      boatName: '', from: '', to: '', price: '', time: '06:00 AM', boatType: 'Fastcraft',
      note: '', status: 'Available', weeklySchedule: [], capacity: ''
    });
  }, [editingItem]);

  const handleSubmit = () => {
    if (!form.boatName || !form.from || !form.to || !form.price || !form.time || !form.capacity) {
      alert('Please fill in all required fields'); return;
    }
    onSubmit({ ...form, price: Number(form.price) || 0, capacity: Number(form.capacity) || 0 });
  };

  if (!formVisible) return null;

  return (
    <Modal animationType="fade" transparent visible={formVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>
              {editingItem ? 'Edit Schedule' : 'Add New Schedule'}
            </Text>
            <TouchableOpacity onPress={onClose}><Icon name="xmark" size={24} color={colors.dark} /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <InputField label="Boat Name *" value={form.boatName} onChange={t => setForm(p => ({ ...p, boatName: t }))} placeholder="Enter boat name" />
            <InputField label="Capacity *" value={form.capacity} onChange={t => setForm(p => ({ ...p, capacity: t }))} placeholder="Enter capacity" keyboardType="numeric" />

            <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
              <View style={{ flex: 1 }}><InputField label="From *" value={form.from} onChange={t => setForm(p => ({ ...p, from: t }))} placeholder="Departure" /></View>
              <View style={{ flex: 1, marginLeft: 10 }}><InputField label="To *" value={form.to} onChange={t => setForm(p => ({ ...p, to: t }))} placeholder="Destination" /></View>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 16 }}>
              <View style={{ flex: 1 }}><InputField label="Price *" value={form.price} onChange={t => setForm(p => ({ ...p, price: t }))} placeholder="Enter price" keyboardType="numeric" /></View>
              <View style={{ flex: 1, marginLeft: 10 }}><InputField label="Time *" value={form.time} onChange={t => setForm(p => ({ ...p, time: t }))} placeholder="e.g., 06:00 AM" /></View>
            </View>

            <OptionGroup label="Boat Type" options={BOAT_TYPES} selected={form.boatType} onSelect={type => setForm(p => ({ ...p, boatType: type }))} />
            <OptionGroup label="Status" options={['Available', 'Unavailable']} selected={form.status} onSelect={status => setForm(p => ({ ...p, status }))} colorMap={{ Available: colors.success, Unavailable: colors.error }} />
            <OptionGroup label="Weekly Schedule" options={DAYS} selected={form.weeklySchedule} onSelect={day => setForm(p => ({ ...p, weeklySchedule: p.weeklySchedule.includes(day) ? p.weeklySchedule.filter(d => d !== day) : [...p.weeklySchedule, day] }))} />
            <InputField label="Note" value={form.note} onChange={t => setForm(p => ({ ...p, note: t }))} placeholder="Additional notes" multiline />

            <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12, marginBottom: 20 }}>
              {editingItem && onDelete && (
                <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.error }} onPress={() => onDelete(editingItem)}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary }} onPress={handleSubmit}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{editingItem ? 'Update' : 'Add Schedule'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}