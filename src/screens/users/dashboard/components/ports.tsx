// screens/dashboard/components/ports.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import TawidModal from '../../../../components/tawidModal';
import { Port, subscribeToPorts, addPort, updatePort, deletePort } from '../dashboardFunctions';

const PortForm = ({ initial, formRef }: any) => {
  const [local, setLocal] = useState(initial);
  const update = (patch: any) => { const updated = { ...local, ...patch }; setLocal(updated); formRef.current = updated; };
  return (
    <View>
      {['name', 'province', 'latitude', 'longitude'].map((field, i) => (
        <View key={field} style={{ marginTop: i > 0 ? 12 : 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>
            {field.charAt(0).toUpperCase() + field.slice(1)} *
          </Text>
          <TextInput 
            value={field === 'latitude' || field === 'longitude' 
              ? (local[field] !== undefined && local[field] !== null ? local[field].toString() : '')
              : local[field]
            }
            onChangeText={t => update({ [field]: field === 'latitude' || field === 'longitude' ? (t === '' ? undefined : parseFloat(t)) : t })}
            placeholder={`Enter ${field}`}
            placeholderTextColor="#999"
            keyboardType={field === 'latitude' || field === 'longitude' ? 'decimal-pad' : 'default'}
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15, color: '#333' }}
          />
        </View>
      ))}
    </View>
  );
};

export default function PortsScreen() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ visible: false, title: '', content: null, action: null, saving: false });

  useEffect(() => {
    const unsub = subscribeToPorts(p => { setPorts(p); setLoading(false); });
    return () => unsub();
  }, []);

  const showModal = (title: string, content: any, action: any) => setModal({ visible: true, title, content, action, saving: false });

  const handleAdd = () => {
    const formRef = { current: { name: '', province: '', latitude: undefined, longitude: undefined } };
    showModal('Add Port', 
      <PortForm initial={{ name: '', province: '', latitude: undefined, longitude: undefined }} formRef={formRef} />,
      async () => {
        setModal(prev => ({ ...prev, saving: true }));
        const { name, province, latitude, longitude } = formRef.current;
        if (!name.trim() || !province.trim() || latitude === undefined || longitude === undefined) {
          setModal(prev => ({ ...prev, saving: false }));
          return Alert.alert('Error', 'Fill all fields', [{ text: 'OK' }]);
        }
        try { await addPort(name.trim(), province.trim(), latitude, longitude); Alert.alert('Success', 'Port added!'); setModal(prev => ({ ...prev, visible: false, saving: false })); } 
        catch { Alert.alert('Error', 'Failed to add port'); setModal(prev => ({ ...prev, saving: false })); }
      }
    );
  };

  const handleEdit = (port: Port) => {
    const formRef = { current: { name: port.name, province: port.province, latitude: port.latitude, longitude: port.longitude } };
    showModal('Edit Port',
      <PortForm initial={{ name: port.name, province: port.province, latitude: port.latitude, longitude: port.longitude }} formRef={formRef} />,
      async () => {
        setModal(prev => ({ ...prev, saving: true }));
        const { name, province, latitude, longitude } = formRef.current;
        if (!name.trim() || !province.trim() || latitude === undefined || longitude === undefined) {
          setModal(prev => ({ ...prev, saving: false }));
          return Alert.alert('Error', 'Fill all fields', [{ text: 'OK' }]);
        }
        try { await updatePort(port.id, name.trim(), province.trim(), latitude, longitude); Alert.alert('Success', 'Port updated!'); setModal(prev => ({ ...prev, visible: false, saving: false })); } 
        catch { Alert.alert('Error', 'Failed to update port'); setModal(prev => ({ ...prev, saving: false })); }
      }
    );
  };

  const handleDelete = (port: Port) => {
    Alert.alert('Delete Port', `Delete "${port.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deletePort(port.id); Alert.alert('Deleted', 'Port deleted'); } 
        catch { Alert.alert('Error', 'Failed to delete port'); }
      }}
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.brand} /></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome6 name="anchor" size={16} color="rgba(0,0,0,0.8)" iconStyle="solid" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(0,0,0,0.8)' }}>Ports</Text>
        </View>
        <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: colors.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <FontAwesome6 name="plus" size={12} color="white" iconStyle="solid" />
          <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>
      {ports.length === 0 ? 
        <Text style={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center', padding: 20 }}>No ports yet. Add one!</Text> :
        <ScrollView showsVerticalScrollIndicator={false}>
          {ports.map((port) => (
            <View key={port.id} style={{ backgroundColor: colors.white, padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.blur(0.3) }}>
              <View>
                <Text style={{ fontSize: 15, color: 'rgba(0,0,0,0.8)', fontWeight: '500' }}>
                  {port.name}{port.province ? `, ${port.province}` : ''}
                </Text>
                {port.latitude !== undefined && port.latitude !== null && port.longitude !== undefined && port.longitude !== null && (
                  <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 1 }}>{port.latitude}, {port.longitude}</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => handleEdit(port)}><Text style={{ color: colors.brand, fontWeight: '600' }}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(port)}><Text style={{ color: '#FF6B6B', fontWeight: '600' }}>Delete</Text></TouchableOpacity>
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