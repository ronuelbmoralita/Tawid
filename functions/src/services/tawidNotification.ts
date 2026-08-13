import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const tawidNotification = onCall({
  region: "asia-southeast2",
}, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required");

  const {tokens, title, body} = request.data;
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new HttpsError("invalid-argument", "No tokens provided");
  }

  const messages = tokens.map((token: string) => ({
    to: token, title, body, sound: "default",
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {"Accept": "application/json", "Content-Type": "application/json"},
    body: JSON.stringify(messages),
  });

  const result = await response.json();
  logger.info("Push notification sent", {structuredData: true});
  return result;
});
