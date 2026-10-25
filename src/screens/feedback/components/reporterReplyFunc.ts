// reporterReplyFunc.ts

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Alert } from 'react-native';
import { auth, firestore } from '../../../firebase/firebaseConfig';
import notifyCompany from '../../../notifications/notifyCompany';

const functions = getFunctions(undefined, 'asia-southeast2');

// ==================== TYPES ====================

export interface UserData {
  name?: string;
  email?: string;
  role?: string;
  roleDual?: string;
}

export type Category = 'Positive' | 'Suggestion' | 'Bug' | 'Other';

export interface CategoryOption {
  key: Category;
  icon: string;
}

export type FeedbackStatus = 'pending' | 'viewed' | 'replied' | string;

export interface FeedbackItem {
  id: string;
  category: Category | string;
  message: string;
  status: FeedbackStatus;
  reply?: string;
  createdAt?: Timestamp;
  repliedAt?: Timestamp;
  repliedBy?: string;
}

// ==================== CONSTANTS ====================

// Positive is listed first so it's the default/pre-selected category in the UI.
export const CATEGORIES: CategoryOption[] = [
  { key: 'Positive', icon: 'thumbs-up' },
  { key: 'Suggestion', icon: 'lightbulb' },
  { key: 'Bug', icon: 'bug' },
  { key: 'Other', icon: 'ellipsis' },
];

export const DEFAULT_CATEGORY: Category = 'Positive';

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

export function isFeedbackClosed(item: FeedbackItem): boolean {
  return item.status === 'replied' || !!item.reply;
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

export function validateFeedbackMessage(message: string): boolean {
  return message.trim().length > 0;
}

export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function isUserLoggedIn(): boolean {
  return !!auth.currentUser?.uid;
}

// ==================== DATABASE FUNCTIONS ====================

export function subscribeToUserFeedback(
  uid: string,
  onData: (items: FeedbackItem[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(firestore, 'transactions'),
    where('uid', '==', uid),
    where('type', '==', 'feedback')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FeedbackItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        const details = data.details ?? {};
        return {
          id: d.id,
          category: details.category,
          message: details.message,
          status: data.status ?? 'pending',
          reply: details.reply,
          createdAt: data.createdAt,
          repliedAt: data.status === 'replied' ? data.updatedAt : undefined,
          repliedBy: details.repliedBy,
        };
      });
      items.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      onData(items);
    },
    (error) => {
      console.error('Error fetching feedback history:', error);
      if (onError) onError(error);
    }
  );
}

export async function submitFeedback(
  category: Category = DEFAULT_CATEGORY,
  message: string,
  userData: UserData | null
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Feedback message cannot be empty');
  }

  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('User not logged in');
  }

  try {
    const createTawidTransaction = httpsCallable(functions, 'createTawidTransaction');
    const result = await createTawidTransaction({
      uid,
      type: 'feedback',
      title: `Feedback • ${category}`,
      status: 'pending',
      details: {
        category,
        message: trimmed,
        reporterName: userData?.name,
        reporterEmail: userData?.email,
        reporterRole: userData?.role,
      },
    });

    const { id } = result.data as { id: string };

    try {
      await notifyCompany({
        title: `New Feedback • ${category}`,
        body: userData?.name ? `${userData.name}: ${trimmed}` : trimmed,
      });
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    return id;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to send feedback. Please try again.');
  }
}

/**
 * Edit sariling feedback (message/category). Puwede anytime, kahit
 * may reply na — backend lang ang bahalang mag-restrict sa allowed fields.
 */
export async function editFeedback(
  item: FeedbackItem,
  category: Category,
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Feedback message cannot be empty');
  }

  try {
    const updateTawidTransaction = httpsCallable(functions, 'updateTawidTransaction');
    await updateTawidTransaction({
      transactionId: item.id,
      details: { category, message: trimmed },
    });
  } catch (error) {
    console.error('Error editing feedback:', error);
    throw new Error('Failed to update feedback. Please try again.');
  }
}

// ==================== ERROR HANDLING ====================

export function handleFeedbackError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while submitting feedback.';
}

export function showFeedbackErrorAlert(error: unknown): void {
  const message = handleFeedbackError(error);
  Alert.alert('Error', message);
}

export function showValidationErrorAlert(): void {
  Alert.alert('Empty Feedback', 'Please write your feedback before submitting.');
}

export function showLoginRequiredAlert(): void {
  Alert.alert('Not Logged In', 'Please log in to send feedback.');
}