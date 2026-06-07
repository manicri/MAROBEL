import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { supabase } from "../supabase";

const firebaseConfig = {
  apiKey: "AIzaSyBu-k3YHUZK91WhvK0Qzs3wKsMWMJsfdXo",
  authDomain: "gen-lang-client-0393494087.firebaseapp.com",
  projectId: "gen-lang-client-0393494087",
  storageBucket: "gen-lang-client-0393494087.firebasestorage.app",
  messagingSenderId: "492559907713",
  appId: "1:492559907713:web:c6df89ae9396ca54fd4680",
};

export const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
export const isInstalledApp = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export async function enablePushNotifications(userId: string, email: string, isAdmin: boolean) {
  if (!(await isSupported()) || !("serviceWorker" in navigator)) {
    throw new Error("Este navegador no admite notificaciones push.");
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error("Falta configurar la clave VAPID de Firebase.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Debes permitir las notificaciones en el teléfono.");
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const token = await getToken(getMessaging(app), {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) throw new Error("No se pudo registrar este teléfono.");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      token,
      user_id: userId,
      email,
      is_admin: isAdmin,
      user_agent: navigator.userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "token" }
  );

  if (error) throw new Error(`No se pudo guardar el teléfono: ${error.message}`);
  return token;
}
