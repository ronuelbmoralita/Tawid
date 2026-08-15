// services/transactionService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebaseConfig';

// ============================================================
// Client-side mirror ng schema sa functions/src/tawidTransactions.ts
// Flat fields = universal; `details` = nested, iba-iba per `type`.
// Kapag nag-iba yung schema sa server, dito rin i-update.
// ============================================================

export type TransactionType =
  | 'booking'
  | 'payment'
  | 'refund'
  | 'topup'
  | 'welcome'
  | 'advisory';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'read'
  | 'unread';

interface BookingDetails {
  routeId: string;
  tripId: string;
  seatCount: number;
  amount: number;
  paymentMethod: 'gcash' | 'maya' | 'cash';
  referenceId?: string;
}

interface PaymentDetails {
  amount: number;
  paymentMethod: 'gcash' | 'maya';
  referenceId: string;
}

interface RefundDetails {
  amount: number;
  originalTransactionId: string;
  reason?: string;
}

interface TopupDetails {
  amount: number;
  paymentMethod: 'gcash' | 'maya';
  referenceId: string;
}

interface WelcomeDetails {
  message: string;
}

interface AdvisoryDetails {
  message: string;
  seaCondition?: string;
  portId?: string;
}

export type CreateTransactionInput =
  | { uid: string; type: 'booking'; status?: TransactionStatus; title: string; details: BookingDetails }
  | { uid: string; type: 'payment'; status?: TransactionStatus; title: string; details: PaymentDetails }
  | { uid: string; type: 'refund'; status?: TransactionStatus; title: string; details: RefundDetails }
  | { uid: string; type: 'topup'; status?: TransactionStatus; title: string; details: TopupDetails }
  | { uid: string; type: 'welcome'; status?: TransactionStatus; title: string; details: WelcomeDetails }
  | { uid: string; type: 'advisory'; status?: TransactionStatus; title: string; details: AdvisoryDetails };

interface CreateTransactionResult {
  id: string;
}

const createTawidTransactionCallable = httpsCallable<CreateTransactionInput, CreateTransactionResult>(
  functions,
  'createTawidTransaction'
);

/**
 * Universal transaction saver — dumadaan sa Cloud Function na `createTawidTransaction`
 * anuman ang klase (booking, payment, refund, topup, welcome, advisory).
 * Awaitable — i-try/catch sa caller kung kailangan mo malaman ang result agad
 * (hal. booking confirmation na naghihintay ng transaction id bago mag-navigate).
 */
export async function saveTransaction(input: CreateTransactionInput): Promise<string> {
  const result = await createTawidTransactionCallable(input);
  return result.data.id;
}

/**
 * Fire-and-forget variant — hindi kailangan i-await/try-catch sa caller.
 * Silent console log na lang kapag nag-fail. Gamitin sa background/non-critical
 * saves (welcome notif, advisory broadcast) na hindi dapat maka-block ng UI flow.
 */
export function saveTransactionSilently(input: CreateTransactionInput): void {
  saveTransaction(input).catch((err) => {
    console.error(`saveTransaction (${input.type}) failed:`, err);
  });
}