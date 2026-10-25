// companyReplyFunc.ts

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Alert } from 'react-native';
import { firestore } from '../../../firebase/firebaseConfig';
import { feedbackNotif } from '../../../notifications/feedbackNotif';

const functions = getFunctions(undefined, 'asia-southeast2');

// ==================== TYPES ====================

export interface UserData {
  name?: string;
  email?: string;
  role?: string;
  roleDual?: string;
}

export type FeedbackStatus = 'pending' | 'viewed' | 'replied' | string;

export interface FeedbackItem {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  category: string;
  message: string;
  status: FeedbackStatus;
  reply?: string;
  createdAt?: Timestamp;
  repliedAt?: Timestamp;
  repliedBy?: string;
}

export type FilterType = 'all' | 'pending' | 'viewed' | 'replied';

// ==================== CONSTANTS ====================

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  viewed: 'Viewed',
  replied: 'Replied',
};

export const STATUS_COLOR: Record<string, string> = {
  pending: '#8E8E93',
  viewed: '#FF9F0A',
  replied: '#34C759',
};

export const CATEGORY_ICON: Record<string, string> = {
  Bug: 'bug',
  Suggestion: 'lightbulb',
  Positive: 'thumbs-up',
  Other: 'ellipsis',
};

export const FILTER_OPTIONS: readonly FilterType[] = ['all', 'pending', 'viewed', 'replied'] as const;

// ==================== UTILITY FUNCTIONS ====================

export function formatDate(ts?: Timestamp): string {
  if (!ts) return '';
  return ts.toDate().toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getFilterLabel(filter: string): string {
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

export function isFeedbackClosed(item: FeedbackItem): boolean {
  return item.status === 'replied' || !!item.reply;
}

export function shouldMarkAsViewed(item: FeedbackItem): boolean {
  return !isFeedbackClosed(item) && item.status !== 'viewed';
}

export function validateReplyText(text: string): boolean {
  return text.trim().length > 0;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function getStatusColor(status: string): string {
  return STATUS_COLOR[status] ?? '#8E8E93';
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICON[category] ?? 'ellipsis';
}

// ==================== DATABASE FUNCTIONS ====================

export function subscribeToFeedback(
  onData: (items: FeedbackItem[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(firestore, 'transactions'),
    where('type', '==', 'feedback'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FeedbackItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        const details = data.details ?? {};
        return {
          id: d.id,
          uid: data.uid,
          name: details.reporterName,
          email: details.reporterEmail,
          role: details.reporterRole,
          category: details.category,
          message: details.message,
          status: data.status ?? 'pending',
          reply: details.reply,
          createdAt: data.createdAt,
          repliedAt: data.status === 'replied' ? data.updatedAt : undefined,
          repliedBy: details.repliedBy,
        };
      });
      onData(items);
    },
    (error) => {
      console.error('Error fetching feedbacks:', error);
      if (onError) onError(error);
    }
  );
}

export function filterFeedbacks(
  feedbacks: FeedbackItem[],
  filter: FilterType
): FeedbackItem[] {
  if (filter === 'all') return feedbacks;
  return feedbacks.filter((f) => f.status === filter);
}

export function getFilterCount(
  feedbacks: FeedbackItem[],
  filter: FilterType
): number {
  if (filter === 'all') return feedbacks.length;
  return feedbacks.filter((f) => f.status === filter).length;
}

export async function markFeedbackAsViewed(item: FeedbackItem): Promise<void> {
  if (!shouldMarkAsViewed(item)) return;

  try {
    const updateTawidTransaction = httpsCallable(functions, 'updateTawidTransaction');
    await updateTawidTransaction({
      transactionId: item.id,
      status: 'viewed',
    });
  } catch (error) {
    console.error('Error updating status:', error);
    throw new Error('Failed to mark feedback as viewed');
  }
}

export async function sendReply(
  item: FeedbackItem,
  replyText: string,
  userData: UserData | null
): Promise<void> {
  const trimmed = replyText.trim();
  if (!trimmed) {
    throw new Error('Reply cannot be empty');
  }

  try {
    const updateTawidTransaction = httpsCallable(functions, 'updateTawidTransaction');
    await updateTawidTransaction({
      transactionId: item.id,
      status: 'replied',
      details: {
        reply: trimmed,
        repliedBy: userData?.name ?? userData?.email ?? 'Company',
      },
    });

    if (item.uid) {
      try {
        await feedbackNotif(item.uid, trimmed);
      } catch (notifError) {
        console.error('Notification failed:', notifError);
      }
    }
  } catch (error) {
    console.error('Error saving reply:', error);
    throw new Error('Failed to send reply. Please try again.');
  }
}

/**
 * Edit ng company sa sarili nilang naipadalang reply. Status nananatiling
 * "replied" — reply text lang ang binabago.
 */
export async function editReply(item: FeedbackItem, replyText: string): Promise<void> {
  const trimmed = replyText.trim();
  if (!trimmed) {
    throw new Error('Reply cannot be empty');
  }

  try {
    const updateTawidTransaction = httpsCallable(functions, 'updateTawidTransaction');
    await updateTawidTransaction({
      transactionId: item.id,
      details: { reply: trimmed },
    });
  } catch (error) {
    console.error('Error editing reply:', error);
    throw new Error('Failed to update reply. Please try again.');
  }
}

// ==================== ERROR HANDLING ====================

export function handleReplyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while sending the reply.';
}

export function showReplyErrorAlert(error: unknown): void {
  const message = handleReplyError(error);
  Alert.alert('Error', message);
}