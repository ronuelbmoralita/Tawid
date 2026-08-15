// utils/nearestPort.ts
import * as Location from "expo-location";
import {
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, firestore } from "../../../../firebase/firebaseConfig";

interface Port {
  name?: string;
  latitude?: string;
  longitude?: string;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function updateNearestPort(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Location permission denied — skipping nearest port");
    return;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const portsSnap = await getDocs(collection(firestore, "ports"));
  const ports = portsSnap.docs
    .map((d) => d.data() as Port)
    .filter((p) => p.name && p.latitude && p.longitude)
    .map((p) => ({
      name: p.name as string,
      lat: parseFloat(p.latitude as string),
      lng: parseFloat(p.longitude as string),
    }));

  if (ports.length === 0) return;

  let nearest = ports[0];
  let nearestDist = haversineKm(
    position.coords.latitude,
    position.coords.longitude,
    nearest.lat,
    nearest.lng
  );

  for (const port of ports.slice(1)) {
    const dist = haversineKm(
      position.coords.latitude,
      position.coords.longitude,
      port.lat,
      port.lng
    );
    if (dist < nearestDist) {
      nearest = port;
      nearestDist = dist;
    }
  }

  // setDoc + merge instead of updateDoc — safe kahit wala pang document
  // ang bagong user (race condition sa parallel user-doc creation sa
  // googleAuth.ts)
  await setDoc(
    doc(firestore, "users", uid),
    {
      nearestPort: {
        city: nearest.name,
        latitude: nearest.lat,
        longitude: nearest.lng,
      },
    },
    { merge: true }
  );

  console.log(
    `📍 Nearest port: ${nearest.name} (${nearestDist.toFixed(1)} km)`
  );
}