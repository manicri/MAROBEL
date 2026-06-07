import { createClient } from "npm:@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@6";

type Appointment = {
  cita?: string;
  id?: string;
  Nombre_cliente?: string;
  cliente_email?: string;
  Servicio?: string;
  fecha?: string;
  hora?: string;
  Estado?: string;
  Usuario_id?: string;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  record: Appointment | null;
  old_record: Appointment | null;
};

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function getGoogleAccessToken(serviceAccount: ServiceAccount) {
  const privateKey = await importPKCS8(serviceAccount.private_key, "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) throw new Error(`Google OAuth: ${await response.text()}`);
  const data = await response.json();
  return data.access_token as string;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("PUSH_WEBHOOK_SECRET");
  if (!expectedSecret || request.headers.get("x-webhook-secret") !== expectedSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const payload = (await request.json()) as WebhookPayload;
    const appointment = payload.record;
    if (!appointment || payload.type === "DELETE") return jsonResponse({ sent: 0 });

    if (payload.type === "UPDATE" && payload.old_record?.Estado === appointment.Estado) {
      return jsonResponse({ sent: 0, reason: "status unchanged" });
    }

    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "") as ServiceAccount;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const subscriptions = new Map<string, { token: string; audience: "admin" | "client" }>();

    if (payload.type === "INSERT") {
      const { data: adminDevices, error: adminError } = await supabase
        .from("push_subscriptions")
        .select("token")
        .eq("is_admin", true);
      if (adminError) throw adminError;
      adminDevices?.forEach(({ token }) => subscriptions.set(token, { token, audience: "admin" }));
    }

    if (appointment.Usuario_id) {
      const { data: clientDevices, error: clientError } = await supabase
        .from("push_subscriptions")
        .select("token")
        .eq("user_id", appointment.Usuario_id);
      if (clientError) throw clientError;
      clientDevices?.forEach(({ token }) => subscriptions.set(token, { token, audience: "client" }));
    }

    if (!subscriptions.size) return jsonResponse({ sent: 0, reason: "no registered devices" });

    const accessToken = await getGoogleAccessToken(serviceAccount);
    const endpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;
    const results = await Promise.allSettled(
      [...subscriptions.values()].map(async ({ token, audience }) => {
        const isAdmin = audience === "admin";
        const title = payload.type === "INSERT"
          ? isAdmin ? "Nueva reserva en Marobel" : "Reserva recibida"
          : "Tu reserva fue actualizada";
        const body = payload.type === "INSERT"
          ? isAdmin
            ? `${appointment.Nombre_cliente} reservó ${appointment.Servicio} para ${appointment.fecha} a las ${appointment.hora}.`
            : `${appointment.Servicio} para ${appointment.fecha} a las ${appointment.hora}. Te avisaremos cuando se confirme.`
          : `${appointment.Servicio}: estado ${appointment.Estado}.`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: {
                appointment_id: appointment.cita || appointment.id || "",
                audience,
                status: appointment.Estado || "pendiente",
              },
              webpush: {
                notification: {
                  icon: "https://seriviciosmaro.netlify.app/favicon.svg",
                  badge: "https://seriviciosmaro.netlify.app/favicon.svg",
                  tag: `marobel-${appointment.cita || appointment.id || Date.now()}`,
                },
                fcm_options: {
                  link: isAdmin
                    ? "https://seriviciosmaro.netlify.app/admin"
                    : "https://seriviciosmaro.netlify.app/reserva",
                },
              },
            },
          }),
        });

        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
    );

    return jsonResponse({
      sent: results.filter((result) => result.status === "fulfilled").length,
      failed: results.filter((result) => result.status === "rejected").length,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
