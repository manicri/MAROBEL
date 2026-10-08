import { supabase } from "../supabase";

// Public VAPID key. The private key is stored only in Supabase Vault.
const VAPID_PUBLIC_KEY = "BIA1VVB3GsDMfVM4dEd92Z4UuEXnFKyvyp5igxmon_ES03FdqalKCaRWu84SY03lRyP5OC7HCDkTU90moNYSYQM";
const DEVICE_OWNER_KEY = "marobel-push-user";

const applicationServerKey = () => {
  const base64 = VAPID_PUBLIC_KEY.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

export const canUseWebPush = () =>
  window.isSecureContext && "serviceWorker" in navigator &&
  "PushManager" in window && "Notification" in window;

const getRegistration = () =>
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}push-sw.js`, {
    scope: import.meta.env.BASE_URL,
  });

export const isPushEnabledHere = async (userId: string) => {
  if (!canUseWebPush() || Notification.permission !== "granted") return false;
  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription || localStorage.getItem(DEVICE_OWNER_KEY) !== userId) return false;
  const { data, error } = await supabase.from("push_subscriptions")
    .select("id").eq("user_id", userId).eq("endpoint", subscription.endpoint).maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

export const enableWebPush = async (userId: string) => {
  if (!canUseWebPush()) throw new Error("Este navegador no admite avisos en este dispositivo.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Debes permitir las notificaciones en el navegador.");

  const registration = await getRegistration();
  let subscription = await registration.pushManager.getSubscription();
  if (subscription && localStorage.getItem(DEVICE_OWNER_KEY) !== userId) {
    await subscription.unsubscribe();
    subscription = null;
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(),
  });
  const { p256dh, auth } = subscription.toJSON().keys ?? {};
  if (!p256dh || !auth) throw new Error("No se pudo registrar este dispositivo.");

  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh,
    auth,
  }, { onConflict: "endpoint" });
  if (error) throw error;
  localStorage.setItem(DEVICE_OWNER_KEY, userId);
};

export const disableWebPush = async (userId: string) => {
  if (!canUseWebPush()) return;
  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const { error } = await supabase.from("push_subscriptions")
      .delete().eq("user_id", userId).eq("endpoint", subscription.endpoint);
    if (error) throw error;
    await subscription.unsubscribe();
  }
  localStorage.removeItem(DEVICE_OWNER_KEY);
};
