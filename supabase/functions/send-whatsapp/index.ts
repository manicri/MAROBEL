import { createClient } from "npm:@supabase/supabase-js@2";

type Appointment = {
  cita?: string;
  id?: string;
  Nombre_cliente?: string;
  Servicio?: string;
  fecha?: string;
  hora?: string;
  Estado?: string;
  whatsapp?: string;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  record: Appointment | null;
  old_record: Appointment | null;
};

type TemplateParameter = { type: "text"; text: string };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const normalizePhone = (value?: string) => {
  let digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `593${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("9")) digits = `593${digits}`;
  return digits;
};

const textParameters = (values: Array<string | undefined>): TemplateParameter[] =>
  values.map((value) => ({ type: "text", text: value || "No especificado" }));

Deno.serve(async (request) => {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("WHATSAPP_WEBHOOK_SECRET");
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

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const adminPhone = normalizePhone(Deno.env.get("WHATSAPP_ADMIN_PHONE"));
    const graphVersion = Deno.env.get("WHATSAPP_GRAPH_VERSION") || "v25.0";
    const languageCode = Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") || "es";

    if (!accessToken || !phoneNumberId) throw new Error("Faltan credenciales de WhatsApp Cloud API");

    const endpoint = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const sendTemplate = async (to: string, templateName: string, values: Array<string | undefined>, eventType: string) => {
      if (!to) return { skipped: true, reason: "missing phone" };

      const appointmentId = appointment.cita || appointment.id || "unknown";
      const { data: alreadySent } = await supabase
        .from("whatsapp_notifications")
        .select("id")
        .eq("appointment_id", appointmentId)
        .eq("event_type", eventType)
        .eq("recipient", to)
        .maybeSingle();
      if (alreadySent) return { skipped: true, reason: "already sent" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [{ type: "body", parameters: textParameters(values) }],
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(`WhatsApp ${response.status}: ${JSON.stringify(result)}`);

      await supabase.from("whatsapp_notifications").insert({
        appointment_id: appointmentId,
        event_type: eventType,
        recipient: to,
        message_id: result.messages?.[0]?.id || null,
      });
      return result;
    };

    const tasks: Promise<unknown>[] = [];
    const customerPhone = normalizePhone(appointment.whatsapp);

    if (payload.type === "INSERT") {
      if (customerPhone) {
        tasks.push(sendTemplate(
          customerPhone,
          Deno.env.get("WHATSAPP_TEMPLATE_CUSTOMER_CREATED") || "reserva_recibida",
          [appointment.Nombre_cliente, appointment.Servicio, appointment.fecha, appointment.hora],
          "customer_created"
        ));
      }
      if (adminPhone) {
        tasks.push(sendTemplate(
          adminPhone,
          Deno.env.get("WHATSAPP_TEMPLATE_ADMIN_CREATED") || "nueva_reserva_admin",
          [appointment.Nombre_cliente, appointment.Servicio, appointment.fecha, appointment.hora, customerPhone],
          "admin_created"
        ));
      }
    }

    if (payload.type === "UPDATE" && customerPhone) {
      tasks.push(sendTemplate(
        customerPhone,
        Deno.env.get("WHATSAPP_TEMPLATE_STATUS") || "estado_reserva",
        [appointment.Nombre_cliente, appointment.Servicio, appointment.fecha, appointment.hora, appointment.Estado],
        `status_${appointment.Estado || "unknown"}`
      ));
    }

    const results = await Promise.allSettled(tasks);
    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

    return jsonResponse({
      sent: results.filter((result) => result.status === "fulfilled").length,
      failed: failures.length,
      failures,
    }, failures.length ? 207 : 200);
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
