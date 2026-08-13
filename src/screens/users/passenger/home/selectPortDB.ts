// screens/passenger/components/selectPortDB.ts
//
// Firestore access for port data — kept separate from SelectPort.tsx
// (which stays a generic, presentation-only picker) so the component
// doesn't need to know about Firestore at all.

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../../../../firebase/firebaseConfig';

export interface PortOption {
  name: string;
  latitude: number;
  longitude: number;
}

export async function fetchPortOptions(): Promise<PortOption[]> {
  const snap = await getDocs(collection(firestore, 'ports'));
  return snap.docs
    .map((d) => d.data())
    .filter((p) => p.name && p.latitude && p.longitude)
    .map((p) => ({
      name: p.name as string,
      latitude: parseFloat(p.latitude),
      longitude: parseFloat(p.longitude),
    }));
}

export async function savePreferredPort(port: PortOption): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await updateDoc(doc(firestore, 'users', uid), {
    nearestPort: {
      city: port.name,
      latitude: port.latitude,
      longitude: port.longitude,
    },
  });
}