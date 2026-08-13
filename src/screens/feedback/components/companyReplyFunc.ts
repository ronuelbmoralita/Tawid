// companyReplyFunc.ts

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { Alert } from 'react-native';
import { firestore } from '../../../firebase/firebaseConfig';
import { feedbackNotif } from './notification/feedbackSend';

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

export interface ReplyPayload {
  reply: string;
  status: 'replied';
  repliedAt: ReturnType<typeof serverTimestamp>;
  repliedBy: string;
}

export type FilterType = 'all' | 'pending' | 'viewed' | 'replied';

// ==================== CONSTANTS ====================

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

export const FILTER_OPTIONS: readonly FilterType[] = ['all', 'pending', 'viewed', 'replied'] as const;

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
 * Get filter label for UI display
 */
export function getFilterLabel(filter: string): string {
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

/**
 * Check if feedback is closed (replied)
 */
export function isFeedbackClosed(item: FeedbackItem): boolean {
  return item.status === 'replied' || !!item.reply;
}

/**
 * Check if feedback needs to be marked as viewed
 */
export function shouldMarkAsViewed(item: FeedbackItem): boolean {
  return !isFeedbackClosed(item) && item.status !== 'viewed';
}

/**
 * Validate reply text
 */
export function validateReplyText(text: string): boolean {
  return text.trim().length > 0;
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

// ==================== DATABASE FUNCTIONS ====================

/**
 * Subscribe to real-time feedback updates from Firestore
 */
export function subscribeToFeedback(
  onData: (items: FeedbackItem[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FeedbackItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        uid: d.data().uid,
        name: d.data().name,
        email: d.data().email,
        role: d.data().role,
        category: d.data().category,
        message: d.data().message,
        status: d.data().status ?? 'pending',
        reply: d.data().reply,
        createdAt: d.data().createdAt,
        repliedAt: d.data().repliedAt,
        repliedBy: d.data().repliedBy,
      }));
      onData(items);
    },
    (error) => {
      console.error('Error fetching feedbacks:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Filter feedbacks based on status
 */
export function filterFeedbacks(
  feedbacks: FeedbackItem[],
  filter: FilterType
): FeedbackItem[] {
  if (filter === 'all') return feedbacks;
  return feedbacks.filter(
    (f) => f.status === filter || (filter === 'pending' && f.status === 'new')
  );
}

/**
 * Get count of feedbacks by filter
 */
export function getFilterCount(
  feedbacks: FeedbackItem[],
  filter: FilterType
): number {
  if (filter === 'all') return feedbacks.length;
  return feedbacks.filter(
    (f) => f.status === filter || (filter === 'pending' && f.status === 'new')
  ).length;
}

/**
 * Mark feedback as viewed
 */
export async function markFeedbackAsViewed(item: FeedbackItem): Promise<void> {
  if (!shouldMarkAsViewed(item)) return;

  try {
    await updateDoc(doc(firestore, 'feedback', item.id), {
      status: 'viewed',
    });
  } catch (error) {
    console.error('Error updating status:', error);
    throw new Error('Failed to mark feedback as viewed');
  }
}

/**
 * Send a reply to feedback with optional notification
 */
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
    const payload: ReplyPayload = {
      reply: trimmed,
      status: 'replied',
      repliedAt: serverTimestamp(),
      repliedBy: userData?.name ?? userData?.email ?? 'Company',
    };

    await updateDoc(doc(firestore, 'feedback', item.id), payload);

    // Send notification if user has UID
    if (item.uid) {
      try {
        await feedbackNotif(item.uid, trimmed);
      } catch (notifError) {
        console.error('Notification failed:', notifError);
        // Don't throw - notification failure shouldn't break the reply
      }
    }
  } catch (error) {
    console.error('Error saving reply:', error);
    throw new Error('Failed to send reply. Please try again.');
  }
}

// ==================== ERROR HANDLING ====================

/**
 * Handle reply errors with user-friendly messages
 */
export function handleReplyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while sending the reply.';
}

/**
 * Show error alert for reply failures
 */
export function showReplyErrorAlert(error: unknown): void {
  const message = handleReplyError(error);
  Alert.alert('Error', message);
}