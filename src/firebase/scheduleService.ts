import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { firestore, auth } from './firebaseConfig';

const schedulesRef = collection(firestore, 'schedules');

export const listenSchedules = (callback: (data: any[]) => void) => {
  return onSnapshot(schedulesRef, snapshot => {
    const data = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(data);
  });
};

export const addSchedule = async (data: any) => {
  const userId = auth.currentUser?.uid || 'unknown';
  await addDoc(schedulesRef, {
    ...data,
    userId,
    capacity: Number(data.capacity) || 0,
    price: Number(data.price) || 0,
    createdAt: serverTimestamp()
  });
};

export const updateSchedule = async (id: string, data: any) => {
  await updateDoc(doc(firestore, 'schedules', id), {
    ...data,
    capacity: Number(data.capacity) || 0,
    price: Number(data.price) || 0,
    updatedAt: serverTimestamp()
  });
};

export const deleteSchedule = async (id: string) => {
  await deleteDoc(doc(firestore, 'schedules', id));
};

export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};