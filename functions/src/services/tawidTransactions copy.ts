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
  | "advisory";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "unread"
  | "read";

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

// Discriminated union
export type TawidTransaction =
  | (BaseTransaction & { type: "payment"; details: PaymentDetails })
  | (BaseTransaction & { type: "refund"; details: RefundDetails })
  | (BaseTransaction & { type: "welcome"; details: WelcomeDetails })
  | (BaseTransaction & { type: "advisory"; details: AdvisoryDetails });

// Input payload (createdAt / updatedAt are server-side only)
type CreateTransactionInput = Omit<TawidTransaction, "createdAt" | "updatedAt">;

// ============================================================
// CALLABLE
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

  default:
    throw new HttpsError(
      "invalid-argument",
      `Unknown transaction type: ${type}`
    );
  }
}
