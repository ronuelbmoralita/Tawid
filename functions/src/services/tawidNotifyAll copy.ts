import * as functions from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Token cache is just an optimization — safe even if lost on cold
// start (worst case: one extra read). Dedupe state lives in
// Firestore below so it survives cold starts / multiple instances.
let cachedTokens: string[] = [];
let lastTokenUpdate = 0;

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

/**
 * Returns the current hours and minutes in Asia/Manila time,
 * regardless of the server runtime's own timezone (which is
 * UTC by default on Cloud Functions).
 * @param {Date} d Date to read.
 * @return {{hours: number, minutes: number}} Manila hour/minute.
 */
function getManilaTimeParts(d: Date): {hours: number, minutes: number} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(d);
  const hours = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minutes =
    parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  return {hours, minutes};
}

/**
 * Returns the current date as "YYYY-MM-DD" in Asia/Manila time.
 * Used as the per-day dedupe key stored on each trip doc.
 * @param {Date} d Date to format.
 * @return {string} Formatted date string.
 */
function getManilaDateString(d: Date): string {
  return d.toLocaleDateString("en-CA", {timeZone: "Asia/Manila"});
}

/**
 * Splits an array of strings into chunks of a given size.
 * @param {string[]} arr Array to split.
 * @param {number} size Max size of each chunk.
 * @return {Array<Array<string>>} Array of chunks.
 */
function chunk(arr: string[], size: number): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Sends a push notification to a list of Expo tokens, batched
 * at 100 tokens per request.
 * @param {string[]} tokens Expo push tokens.
 * @param {string} title Notification title.
 * @param {string} body Notification body.
 * @return {Promise<void>} Resolves when all batches are sent.
 */
async function sendExpoPush(tokens: string[], title: string, body: string) {
  for (const batch of chunk(tokens, 100)) {
    const resp = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(batch.map((token) => ({
        to: token,
        title,
        body,
        sound: "default",
      }))),
    });
    const respJson = await resp.json();
    logger.info(`🔍 Expo response: ${JSON.stringify(respJson)}`);
  }
}

export const tawidNotifyAll = functions.onSchedule({
  schedule: "*/5 * * * *",
  region: "asia-southeast2",
  timeZone: "Asia/Manila",
}, async () => {
  const now = new Date();
  const {hours: nowHours, minutes: nowMins} = getManilaTimeParts(now);
  const nowMinutes = nowHours * 60 + nowMins;
  const todayStr = getManilaDateString(now);

  // Get users (cache 1 hour, in-memory only — safe to lose)
  if (Date.now() - lastTokenUpdate > 3600000) {
    const users = await admin.firestore()
      .collection("users")
      .where("expoToken", "!=", null)
      .select("expoToken")
      .get();

    cachedTokens = users.docs
      .map((doc) => doc.data().expoToken)
      .filter((token) => token && token.trim() !== "");

    lastTokenUpdate = Date.now();
  }

  logger.info(`🔍 cachedTokens: ${cachedTokens.length}`);
  if (cachedTokens.length === 0) return;

  // Trips are always fetched fresh (no cache) — we need the live
  // notification flags to decide what's already been sent.
  const tripsSnap = await admin.firestore()
    .collection("routeDetails")
    .where("status", "==", "Sailing")
    .get();

  logger.info(`🔍 tripsSnap size: ${tripsSnap.size}`);
  if (tripsSnap.empty) return;

  let notifiedCount = 0;

  for (const doc of tripsSnap.docs) {
    const trip = {id: doc.id, ...doc.data()} as Trip;

    const match = trip.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) continue;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    if (match[3] === "PM" && hours !== 12) hours += 12;
    if (match[3] === "AM" && hours === 12) hours = 0;

    const tripMinutes = hours * 60 + minutes;
    let diff = tripMinutes - nowMinutes;
    if (diff < 0) diff += 1440;

    // Only alert when the trip is departing very soon (0-5 minutes).
    if (diff < 0 || diff > 5) continue;

    // Dedupe key includes the specific time, not just the date —
    // so if the admin updates a trip's time later the same day,
    // it's treated as a new slot and will notify again.
    const dedupeKey = `${todayStr}_${trip.time}`;

    // Already notified for this exact date+time? Skip.
    if (trip.notifiedDepartureDate === dedupeKey) continue;

    // Look up the vessel's real name/type by ID — only for trips
    // that are actually about to notify, to keep reads minimal.
    let vesselName = trip.vesselId || "Vessel";
    let vesselType = trip.type || "Vessel";
    if (trip.vesselId) {
      const vesselDoc = await admin.firestore()
        .collection("vessels")
        .doc(trip.vesselId)
        .get();
      if (vesselDoc.exists) {
        const vessel = vesselDoc.data() as Vessel;
        vesselName = vessel.name || vesselName;
        vesselType = vessel.type || vesselType;
      }
    }

    const title = "Travel Advisory";
    const body =
      `Ka-Tawid, malapit nang umalis ang ${vesselName} (${vesselType}) ` +
      `ngayong ${trip.time}. Paki-ready na po.`;

    // Claim the slot BEFORE sending, so a slow send plus an
    // overlapping invocation can't double-fire. If the push
    // actually fails, the catch below un-claims it so it can
    // retry on the next tick.
    await doc.ref.update({notifiedDepartureDate: dedupeKey});

    try {
      await sendExpoPush(cachedTokens, title, body);
      notifiedCount++;
      logger.info(
        `📨 departure sent for ${vesselName} at ${trip.time}`,
      );
    } catch (err) {
      await doc.ref.update({
        notifiedDepartureDate: admin.firestore.FieldValue.delete(),
      });
      logger.error(
        `Failed to send departure for ${vesselName}: ${err}`,
      );
    }
  }

  if (notifiedCount > 0) {
    logger.info(`✅ Sent ${notifiedCount} notifications`);
  }
});
