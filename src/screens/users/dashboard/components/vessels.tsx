// screens/dashboard/components/vessels.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import TawidModal from '../../../../components/tawidModal';
import { Vessel, subscribeToVessels, addVessel, updateVessel, deleteVessel } from '../dashboardFunctions';

const VESSEL_TYPES = ['Fastcraft', 'RORO', 'Cargo'];

const VesselForm = ({ initial, formRef }: any) => {
  const [local, setLocal] = useState(initial);
  const update = (patch: any) => { const updated = { ...local, ...patch }; setLocal(updated); formRef.current = updated; };
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>Vessel Name *</Text>
      <TextInput value={local.name} onChangeText={t => update({ name: t })} placeholder="Enter vessel name" placeholderTextColor="#999"
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15, color: '#333' }} />
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 }}>Type *</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {VESSEL_TYPES.map(type => (
          <TouchableOpacity key={type} onPress={() => update({ type: type as any })} 
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: local.type === type ? colors.brand : '#e0e0e0' }}>
            <Text style={{ color: local.type === type ? 'white' : '#666', fontWeight: local.type === type ? '600' : '400' }}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function VesselsScreen() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ visible: false, title: '', content: null, action: null, saving: false });

  useEffect(() => {
    const unsub = subscribeToVessels(v => { setVessels(v); setLoading(false); });
    return () => unsub();
  }, []);

  const showModal = (title: string, content: any, action: any) => setModal({ visible: true, title, content, action, saving: false });

  const handleAdd = () => {
    const formRef = { current: { name: '', type: 'Fastcraft' as const } };
    showModal('Add Vessel', <VesselForm initial={{ name: '', type: 'Fastcraft' }} formRef={formRef} />, async () => {
      setModal(prev => ({ ...prev, saving: true }));
      if (!formRef.current.name.trim()) { setModal(prev => ({ ...prev, saving: false })); return Alert.alert('Error', 'Enter vessel name'); }
      try { await addVessel(formRef.current.name.trim(), formRef.current.type); Alert.alert('Success', 'Vessel added!'); setModal(prev => ({ ...prev, visible: false, saving: false })); } 
      catch { Alert.alert('Error', 'Failed to add vessel'); setModal(prev => ({ ...prev, saving: false })); }
    });
  };

  const handleEdit = (vessel: Vessel) => {
    const formRef = { current: { name: vessel.name, type: vessel.type } };
    showModal('Edit Vessel', <VesselForm initial={{ name: vessel.name, type: vessel.type }} formRef={formRef} />, async () => {
      setModal(prev => ({ ...prev, saving: true }));
      if (!formRef.current.name.trim()) { setModal(prev => ({ ...prev, saving: false })); return Alert.alert('Error', 'Enter vessel name'); }
      try { await updateVessel(vessel.id, { name: formRef.current.name.trim(), type: formRef.current.type }); Alert.alert('Success', 'Vessel updated!'); setModal(prev => ({ ...prev, visible: false, saving: false })); } 
      catch { Alert.alert('Error', 'Failed to update vessel'); setModal(prev => ({ ...prev, saving: false })); }
    });
  };

  const handleDelete = (vessel: Vessel) => {
    Alert.alert('Delete Vessel', `Delete "${vessel.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteVessel(vessel.id); Alert.alert('Deleted', 'Vessel deleted'); } 
        catch { Alert.alert('Error', 'Failed to delete vessel'); }
      }}
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.brand} /></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome6 name="ship" size={16} color="rgba(0,0,0,0.8)" iconStyle="solid" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(0,0,0,0.8)' }}>Vessels</Text>
        </View>
        <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: colors.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <FontAwesome6 name="plus" size={12} color="white" iconStyle="solid" />
          <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>
      {vessels.length === 0 ? 
        <Text style={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center', padding: 20 }}>No vessels yet. Add one!</Text> :
        <ScrollView showsVerticalScrollIndicator={false}>
          {vessels.map((vessel) => (
            <View key={vessel.id} style={{ backgroundColor: colors.white, padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.blur(0.3) }}>
              <View>
                <Text style={{ fontSize: 15, color: 'rgba(0,0,0,0.8)', fontWeight: '500' }}>{vessel.name}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>{vessel.type}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => handleEdit(vessel)}><Text style={{ color: colors.brand, fontWeight: '600' }}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(vessel)}><Text style={{ color: '#FF6B6B', fontWeight: '600' }}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      }

      <TawidModal
        visible={modal.visible}
        onClose={() => !modal.saving && setModal(prev => ({ ...prev, visible: false }))}
        title={modal.title}
        showCloseButton={true}
        actions={[
          { text: 'Cancel', style: 'cancel', onPress: () => !modal.saving && setModal(prev => ({ ...prev, visible: false })), disabled: modal.saving },
          { text: 'Save', style: 'default', onPress: () => modal.action?.(), disabled: modal.saving, loading: modal.saving }
        ]}
      >
        {modal.content}
      </TawidModal>
    </View>
  );
}