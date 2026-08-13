import * as functions from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// ===== INTERFACES =====
interface Trip {
  id: string;
  vesselId?: string;
  type?: string;
  time?: string;
  status?: string;
  notifiedDepartureDate?: string;
}

interface Vessel {
  name?: string;
  type?: string;
}

// ===== GLOBALS =====
let cachedTokens: string[] = [];
let lastTokenUpdate = 0;

// ===== HELPERS =====
const getManilaTime = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);

  return {
    hours: parseInt(parts.find((p) => p.type === "hour")?.value ?? "0"),
    minutes: parseInt(parts.find((p) => p.type === "minute")?.value ?? "0"),
  };
};

const getManilaDate = (d: Date) =>
  d.toLocaleDateString("en-CA", {timeZone: "Asia/Manila"});

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

const sendPush = async (tokens: string[], title: string, body: string) => {
  for (const batch of chunk(tokens, 100)) {
    const resp = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(
        batch.map((t) => ({to: t, title, body, sound: "default"})),
      ),
    });
    logger.info(`🔍 Expo: ${JSON.stringify(await resp.json())}`);
  }
};

// ===== MAIN FUNCTION =====
export const tawidNotifyAll = functions.onSchedule({
  schedule: "*/5 * * * *",
  region: "asia-southeast2",
  timeZone: "Asia/Manila",
}, async () => {
  const now = new Date();
  const {hours, minutes} = getManilaTime(now);
  const nowMinutes = hours * 60 + minutes;
  const todayStr = getManilaDate(now);

  // Company-wide kill switch — skip everything if suspended.
  const companyDoc = await admin.firestore()
    .collection("company")
    .doc("details")
    .get();
  if (companyDoc.exists && companyDoc.data()?.isSuspended) {
    logger.info("⏸️ Company suspended — skipping notifications");
    return;
  }

  // Refresh tokens (1hr cache)
  //
  // IMPORTANT: Firestore only allows ONE "!=" filter per query,
  // even across different fields. Combining
  // `.where("expoToken", "!=", null).where("notificationsEnabled", "!=", false)`
  // throws FAILED_PRECONDITION and crashes this whole function
  // silently (no tokens ever load, nothing ever sends). Filter
  // notificationsEnabled in memory instead.
  if (Date.now() - lastTokenUpdate > 3600000) {
    const users = await admin.firestore()
      .collection("users")
      .where("expoToken", "!=", null)
      .select("expoToken", "notificationsEnabled")
      .get();

    cachedTokens = users.docs
      .filter((d) => d.data().notificationsEnabled !== false)
      .map((d) => d.data().expoToken)
      .filter((t): t is string => t?.trim() !== "");
    lastTokenUpdate = Date.now();
  }

  if (!cachedTokens.length) return;

  const tripsSnap = await admin.firestore()
    .collection("routeDetails")
    .where("status", "==", "Sailing")
    .get();

  if (tripsSnap.empty) return;

  let notified = 0;

  for (const doc of tripsSnap.docs) {
    const trip = {id: doc.id, ...doc.data()} as Trip;

    // Parse trip time
    const match = trip.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) continue;

    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (match[3] === "PM" && h !== 12) h += 12;
    if (match[3] === "AM" && h === 12) h = 0;

    // Check if within 5 minutes
    const tripMinutes = h * 60 + m;
    let diff = tripMinutes - nowMinutes;
    if (diff < 0) diff += 1440;
    if (diff < 0 || diff > 5) continue;

    // Dedupe (date + exact time, so a same-day time change re-notifies)
    const dedupeKey = `${todayStr}_${trip.time}`;
    if (trip.notifiedDepartureDate === dedupeKey) continue;

    // Get vessel details
    let vesselName = trip.vesselId || "Vessel";
    let vesselType = trip.type || "Vessel";

    if (trip.vesselId) {
      const vDoc = await admin.firestore()
        .collection("vessels")
        .doc(trip.vesselId)
        .get();

      if (vDoc.exists) {
        const v = vDoc.data() as Vessel | undefined;
        vesselName = v?.name || vesselName;
        vesselType = v?.type || vesselType;
      }
    }

    // Send notification
    const title = "📢 Travel Advisory";
    const body = `Ka-Tawid, malapit nang umalis ang ${vesselName} ` +
      `(${vesselType}) ngayong ${trip.time}. Paki-ready na po.`;

    await doc.ref.update({notifiedDepartureDate: dedupeKey});

    try {
      await sendPush(cachedTokens, title, body);
      notified++;
      logger.info(`📨 Sent: ${vesselName} at ${trip.time}`);
    } catch (err) {
      await doc.ref.update({
        notifiedDepartureDate: admin.firestore.FieldValue.delete(),
      });
      logger.error(`❌ Failed: ${vesselName}: ${err}`);
    }
  }

  if (notified) logger.info(`✅ Sent ${notified} notifications`);
});
