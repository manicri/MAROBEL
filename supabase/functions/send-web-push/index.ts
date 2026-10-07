import { createClient } from "npm:@supabase/supabase-js@2.103.0";
import webpush from "npm:web-push@3.6.7";

type PushConfig = {
  public_key: string | null;
  private_key: string | null;
  webhook_secret: string | null;
};

type Device = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

const respond = (body: unknown, status = 200) => Response.json(body, { status });

Deno.serve(async (request) => {
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return respond({ error: "Server is not configured" }, 500);
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: configData, error: configError } = await supabase.rpc("get_web_push_config");
  if (configError) {
    console.error("Web Push configuration is unavailable", configError);
    return respond({ error: "Server is not configured" }, 500);
  }
  const config = configData as PushConfig;
  if (!config?.webhook_secret || request.headers.get("x-webhook-secret") !== config.webhook_secret) {
    return respond({ error: "Unauthorized" }, 401);
  }
  if (!config.public_key || !config.private_key) {
    return respond({ error: "VAPID keys are missing" }, 500);
  }

  let notificationId: string;
  try {
    const body = await request.json();
    notificationId = String(body.notification_id || "");
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(notificationId)) throw new Error("Invalid notification ID");
  } catch {
    return respond({ error: "Invalid payload" }, 400);
  }

  const { data: notification, error: notificationError } = await supabase
    .from("app_notifications")
    .select("id, recipient_id, title, body, target_path")
    .eq("id", notificationId)
    .maybeSingle();
  if (notificationError) return respond({ error: "Could not load notification" }, 500);
  if (!notification) return respond({ error: "Notification not found" }, 404);

  const { data: devices, error: deviceError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", notification.recipient_id);
  if (deviceError) return respond({ error: "Could not load devices" }, 500);
  if (!devices?.length) return respond({ sent: 0, reason: "No subscribed devices" });

  webpush.setVapidDetails(
    "mailto:hola@marobel.studio",
    config.public_key,
    config.private_key,
  );
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    path: notification.target_path,
    tag: `marobel-${notification.id}`,
  });
  const outcomes = await Promise.allSettled((devices as Device[]).map(async (device) => {
    try {
      await webpush.sendNotification({
        endpoint: device.endpoint,
        keys: { p256dh: device.p256dh, auth: device.auth },
      }, payload, { TTL: 86400 });
      return true;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", device.id);
      }
      console.error("Web Push delivery failed", status || "unknown status");
      return false;
    }
  }));

  return respond({
    sent: outcomes.filter((result) => result.status === "fulfilled" && result.value).length,
    failed: outcomes.filter((result) => result.status === "rejected" || !result.value).length,
  });
});
