// functions/src/tawidTransactions.ts
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const REGION = "asia-southeast2";

// ============================================================
// SCHEMA
// ============================================================

export type TransactionType =
  | "payment" // lahat ng bayad (booking, baggage, etc.)
  | "refund"
  | "welcome"
  | "advisory"
  | "feedback";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "unread"
  | "read"
  | "viewed"
  | "replied";

interface BaseTransaction {
  uid: string; // actual uid or "ALL" for broadcasts
  type: TransactionType;
  status: TransactionStatus;
  title: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt?: FirebaseFirestore.FieldValue;
  readBy?: string[]; // only used for uid === "ALL"
}

// ---- Per-type `details` shapes ----

interface PaymentDetails {
  amount: number;
  paymentMethod: "gcash" | "maya" | "cash";
  referenceId?: string;

  // Context of what was paid
  purpose: "booking" | "baggage" | "cancellation_fee" | "other";

  // Booking-specific (optional)
  routeId?: string;
  tripId?: string;
  seatCount?: number;
}

interface RefundDetails {
  amount: number;
  originalTransactionId: string;
  reason?: string;
}

interface WelcomeDetails {
  message: string;
}

interface AdvisoryDetails {
  message: string;
  seaCondition?: string;
  portId?: string;
}

interface FeedbackDetails {
  category: "Bug" | "Suggestion" | "Complaint" | "Other";
  message: string;

  // Snapshot ng reporter info nung submit — iniwasan ko yung extra
  // "users" read sa company side, sabay dinala na lang sa payload.
  reporterName?: string;
  reporterEmail?: string;
  reporterRole?: string;

  // Filled in later via updateTawidTransaction
  reply?: string;
  repliedBy?: string;
}

// Discriminated union
export type TawidTransaction =
  | (BaseTransaction & { type: "payment"; details: PaymentDetails })
  | (BaseTransaction & { type: "refund"; details: RefundDetails })
  | (BaseTransaction & { type: "welcome"; details: WelcomeDetails })
  | (BaseTransaction & { type: "advisory"; details: AdvisoryDetails })
  | (BaseTransaction & { type: "feedback"; details: FeedbackDetails });

// Input payload (createdAt / updatedAt are server-side only)
type CreateTransactionInput = Omit<TawidTransaction, "createdAt" | "updatedAt">;

// ============================================================
// CREATE CALLABLE
// ============================================================

export const createTawidTransaction = onCall(
  {region: REGION},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Kailangan naka-login para gumawa ng transaction."
      );
    }

    const data = request.data as CreateTransactionInput;

    if (!data?.type) {
      throw new HttpsError("invalid-argument", "Missing transaction type.");
    }

    if (!data?.uid) {
      throw new HttpsError("invalid-argument", "Missing uid.");
    }

    const db = getFirestore();

    // Regular users can only create for themselves.
    // Company can create for other users or broadcast (uid: "ALL").
    const isSelf = data.uid === request.auth.uid;
    if (!isSelf) {
      const callerDoc = await db.collection("users").doc(request.auth.uid).get();
      const isCompany = callerDoc.data()?.roleDual === "Company";

      if (!isCompany) {
        throw new HttpsError(
          "permission-denied",
          "Hindi ka puwedeng gumawa ng transaction para sa ibang user o mag-broadcast."
        );
      }
    }

    validateDetails(data.type, data.details);

    const payload: Record<string, any> = {
      ...data,
      status: data.status ?? "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Broadcasts always start with empty readBy
    if (data.uid === "ALL") {
      payload.readBy = [];
      // Force unread for advisories if not provided
      if (data.type === "advisory" && !data.status) {
        payload.status = "unread";
      }
    }

    const ref = await db.collection("transactions").add(payload);

    return {id: ref.id};
  }
);

// ============================================================
// UPDATE CALLABLE
// (currently scoped to feedback-type txns only — payment/refund/etc
// should keep going through their own dedicated flows)
// ============================================================

const OWNER_EDITABLE_FIELDS = ["message", "category"];

interface UpdateTransactionInput {
  transactionId: string;
  status?: TransactionStatus;
  details?: Partial<FeedbackDetails>;
}

export const updateTawidTransaction = onCall(
  {region: REGION},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Kailangan naka-login.");
    }

    const {transactionId, status, details} = request.data as UpdateTransactionInput;

    if (!transactionId) {
      throw new HttpsError("invalid-argument", "Missing transactionId.");
    }

    const db = getFirestore();
    const ref = db.collection("transactions").doc(transactionId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpsError("not-found", "Transaction not found.");
    }

    const txn = snap.data() as TawidTransaction;

    if (txn.type !== "feedback") {
      throw new HttpsError(
        "invalid-argument",
        "Ang update na ito ay para lang sa feedback transactions sa ngayon."
      );
    }

    const callerDoc = await db.collection("users").doc(request.auth.uid).get();
    const isCompany = callerDoc.data()?.roleDual === "Company";
    const isOwner = txn.uid === request.auth.uid;

    if (!isCompany && !isOwner) {
      throw new HttpsError(
        "permission-denied",
        "Hindi mo puwedeng i-edit itong feedback."
      );
    }

    if (!status && !details) {
      throw new HttpsError(
        "invalid-argument",
        "Wala kang binagong status o details."
      );
    }

    // Reporter (non-company owner) — limitado lang sa sariling message/category,
    // at hindi na puwede kapag closed na (may reply na) ang feedback.
    // Status/reply ay company-only pa rin.
    if (!isCompany && isOwner) {
      if (txn.status === "replied") {
        throw new HttpsError(
          "permission-denied",
          "Hindi mo na puwedeng i-edit ang feedback na sinagot na."
        );
      }

      if (status) {
        throw new HttpsError(
          "permission-denied",
          "Hindi mo puwedeng baguhin ang status."
        );
      }

      const keys = Object.keys(details ?? {});
      const disallowed = keys.filter((k) => !OWNER_EDITABLE_FIELDS.includes(k));
      if (disallowed.length) {
        throw new HttpsError(
          "permission-denied",
          `Hindi mo puwedeng i-edit ang: ${disallowed.join(", ")}`
        );
      }
    }

    const updatePayload: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status) {
      updatePayload.status = status;
    }

    if (details) {
      for (const [key, value] of Object.entries(details)) {
        updatePayload[`details.${key}`] = value;
      }
    }

    await ref.update(updatePayload);

    return {success: true};
  }
);

// ============================================================
// VALIDATION
// ============================================================

function validateDetails(type: TransactionType, details: any) {
  const requireFields = (fields: string[]) => {
    const missing = fields.filter((f) => details?.[f] === undefined);
    if (missing.length) {
      throw new HttpsError(
        "invalid-argument",
        `Missing fields sa "${type}" transaction: ${missing.join(", ")}`
      );
    }
  };

  switch (type) {
  case "payment":
    requireFields(["amount", "paymentMethod", "purpose"]);
    // Kung purpose === "booking", i-require din ang booking fields
    if (details.purpose === "booking") {
      requireFields(["routeId", "tripId", "seatCount"]);
    }
    break;

  case "refund":
    requireFields(["amount", "originalTransactionId"]);
    break;

  case "welcome":
    requireFields(["message"]);
    break;

  case "advisory":
    requireFields(["message"]);
    break;

  case "feedback":
    requireFields(["category", "message"]);
    break;

  default:
    throw new HttpsError(
      "invalid-argument",
      `Unknown transaction type: ${type}`
    );
  }
}
