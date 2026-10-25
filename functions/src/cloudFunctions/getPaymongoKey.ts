import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const getPaymongoKey = onCall({
  secrets: ["PAYMONGO_KEY"],
}, async () => {
  const secretKey = process.env.PAYMONGO_KEY;
  logger.info("Hello logs!", {structuredData: true});
  return `Hello from Firebase! Secret: ${secretKey}`;
});
