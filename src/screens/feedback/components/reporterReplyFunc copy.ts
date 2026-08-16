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
import { Alert } from 'react-native';
import { auth, firestore } from '../../../firebase/firebaseConfig';
import notifyCompany from '../../../notifications/notifyCompany';

// ==================== TYPES ====================

export interface UserData {
  name?: string;
  email?: string;
  role?: string;
  roleDual?: string;
}

export type Category = 'Bug' | 'Suggestion' | 'Complaint' | 'Other';

export interface CategoryOption {
  key: Category;
  icon: string;
}

export type FeedbackStatus = 'pending' | 'viewed' | 'replied' | 'new' | 'seen' | 'resolved' | string;

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

export interface FeedbackSubmission {
  uid: string;
  name: string | null;
  email: string | null;
  role: string | null;
  category: Category;
  message: string;
  status: 'pending';
  createdAt: ReturnType<typeof serverTimestamp>;
}

// ==================== CONSTANTS ====================

export const CATEGORIES: CategoryOption[] = [
  { key: 'Suggestion', icon: 'lightbulb' },
  { key: 'Bug', icon: 'bug' },
  { key: 'Complaint', icon: 'triangle-exclamation' },
  { key: 'Other', icon: 'ellipsis' },
];

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  viewed: 'Viewed',
  replied: 'Replied',
  new: 'Pending',
  seen: 'Viewed',
  resolved: 'Replied',
};

export const STATUS_COLOR: Record<string, string> = {
  pending: '#8E8E93',
  viewed: '#FF9F0A',
  replied: '#34C759',
  new: '#8E8E93',
  seen: '#FF9F0A',
  resolved: '#34C759',
};

export const CATEGORY_ICON: Record<string, string> = {
  Bug: 'bug',
  Suggestion: 'lightbulb',
  Complaint: 'triangle-exclamation',
  Other: 'ellipsis',
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format Firestore timestamp to readable date string
 */
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

/**
 * Check if feedback is closed (replied)
 */
export function isFeedbackClosed(item: FeedbackItem): boolean {
  return item.status === 'replied' || !!item.reply;
}

/**
 * Get status label with fallback
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

/**
 * Get status color with fallback
 */
export function getStatusColor(status: string): string {
  return STATUS_COLOR[status] ?? '#8E8E93';
}

/**
 * Get category icon with fallback
 */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICON[category] ?? 'ellipsis';
}

/**
 * Validate feedback message
 */
export function validateFeedbackMessage(message: string): boolean {
  return message.trim().length > 0;
}

/**
 * Get user ID from auth
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return !!auth.currentUser?.uid;
}

// ==================== DATABASE FUNCTIONS ====================

/**
 * Subscribe to user's feedback history
 */
export function subscribeToUserFeedback(
  uid: string,
  onData: (items: FeedbackItem[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(firestore, 'feedback'), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FeedbackItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        category: d.data().category,
        message: d.data().message,
        status: d.data().status ?? 'pending',
        reply: d.data().reply,
        createdAt: d.data().createdAt,
        repliedAt: d.data().repliedAt,
        repliedBy: d.data().repliedBy,
      }));
      // Sort by newest first
      items.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      onData(items);
    },
    (error) => {
      console.error('Error fetching feedback history:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Submit new feedback
 */
export async function submitFeedback(
  category: Category,
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
    const submission: FeedbackSubmission = {
      uid,
      name: userData?.name ?? null,
      email: userData?.email ?? null,
      role: userData?.role ?? null,
      category,
      message: trimmed,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, 'feedback'), submission);

    // Send notification to company
    try {
      await notifyCompany({
        title: `New Feedback • ${category}`,
        body: userData?.name ? `${userData.name}: ${trimmed}` : trimmed,
      });
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to send feedback. Please try again.');
  }
}

// ==================== ERROR HANDLING ====================

/**
 * Handle feedback errors with user-friendly messages
 */
export function handleFeedbackError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while submitting feedback.';
}

/**
 * Show error alert for feedback failures
 */
export function showFeedbackErrorAlert(error: unknown): void {
  const message = handleFeedbackError(error);
  Alert.alert('Error', message);
}

/**
 * Show validation error alert
 */
export function showValidationErrorAlert(): void {
  Alert.alert('Empty Feedback', 'Please write your feedback before submitting.');
}

/**
 * Show login required alert
 */
export function showLoginRequiredAlert(): void {
  Alert.alert('Not Logged In', 'Please log in to send feedback.');
}