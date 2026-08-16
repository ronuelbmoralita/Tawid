import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { firestore } from '../firebase/firebaseConfig';

const functions = getFunctions(undefined, 'asia-southeast2');

export interface TxnNotification {
  id: string;
  uid: string;
  type: 'welcome' | 'advisory' | 'feedback';
  status: string;
  title: string;
  details?: {
    message?: string;
    reply?: string;
    category?: string;
    reporterName?: string;
    [key: string]: unknown;
  };
  readBy?: string[];
  createdAt?: { toDate: () => Date };
  _isCompanyFeed?: boolean;
}

interface UserData {
  uid?: string;
  role?: string;
  createdAt?: any;
}

/**
 * Shared hook — iisang listener setup lang, ginagamit ng bell (TawidHeader)
 * at ng Feedback tab badge (tab.tsx). Iniwasan yung duplicate onSnapshot
 * queries sa dalawang lugar.
 */
export function useTransactionCounts(userData: UserData | null) {
  const [personalNotifications, setPersonalNotifications] = useState<TxnNotification[]>([]);
  const [companyFeedbackNotifications, setCompanyFeedbackNotifications] = useState<TxnNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = userData?.uid;
  const isCompany = userData?.role === 'Company';

  const isUnread = useCallback(
    (n: TxnNotification) => {
      if (n._isCompanyFeed) {
        return n.status === 'pending';
      }
      if (n.uid === 'ALL') {
        return !(n.readBy ?? []).includes(uid);
      }
      if (n.type === 'feedback') {
        return !(n.readBy ?? []).includes(uid);
      }
      return n.status === 'unread';
    },
    [uid]
  );

  // ---------- Personal notifications listener ----------
  useEffect(() => {
    if (!uid) return;

    setLoading(true);

    const accountCreatedAt = userData?.createdAt;

    const constraints = [
      where('uid', 'in', [uid, 'ALL']),
      where('type', 'in', ['welcome', 'advisory', 'feedback']),
    ];

    if (accountCreatedAt) {
      constraints.push(where('createdAt', '>=', accountCreatedAt));
    }

    const q = query(collection(firestore, 'transactions'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as TxnNotification))
          .filter((n) => n.type !== 'feedback' || n.status === 'replied');

        setPersonalNotifications(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Notifications listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, userData?.createdAt]);

  // ---------- Company feedback feed listener ----------
  useEffect(() => {
    if (!isCompany) {
      setCompanyFeedbackNotifications([]);
      return;
    }

    const q = query(
      collection(firestore, 'transactions'),
      where('type', '==', 'feedback'),
      where('status', 'in', ['pending', 'viewed'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data(), _isCompanyFeed: true } as TxnNotification)
        );
        setCompanyFeedbackNotifications(docs);
      },
      (error) => {
        console.error('Company feedback listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [isCompany]);

  const notifications = useMemo(() => {
    const combined = [...personalNotifications, ...companyFeedbackNotifications];
    combined.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return tb - ta;
    });
    return combined;
  }, [personalNotifications, companyFeedbackNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter(isUnread).length,
    [notifications, isUnread]
  );

  const feedbackBadgeCount = useMemo(
    () => notifications.filter((n) => n.type === 'feedback' && isUnread(n)).length,
    [notifications, isUnread]
  );

  const markAsRead = useCallback(
    async (item: TxnNotification) => {
      if (!uid || !isUnread(item)) return;

      try {
        if (item._isCompanyFeed) {
          const updateTawidTransaction = httpsCallable(functions, 'updateTawidTransaction');
          await updateTawidTransaction({
            transactionId: item.id,
            status: 'viewed',
          });
        } else if (item.uid === 'ALL' || item.type === 'feedback') {
          await updateDoc(doc(firestore, 'transactions', item.id), {
            readBy: arrayUnion(uid),
          });
        } else {
          await updateDoc(doc(firestore, 'transactions', item.id), {
            status: 'read',
          });
        }
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    },
    [uid, isUnread]
  );

  return {
    notifications,
    isUnread,
    unreadCount,
    feedbackBadgeCount,
    markAsRead,
    loading,
  };
}