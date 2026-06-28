type Appointment = {
  cita: string;
  Nombre_cliente: string;
  cliente_email?: string;
  Servicio: string;
  fecha: string;
  hora: string;
  whatsapp?: string;
  notas?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const cleanPhone = (value?: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("593")) return digits;
  if (digits.startsWith("0")) return `593${digits.slice(1)}`;
  return digits;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const buildPlainMessage = (appointment: Appointment) => [
  `Hola ${appointment.Nombre_cliente}, tu cita en Marobel Beauty Studio fue confirmada.`,
  "",
  `Fecha: ${formatDate(appointment.fecha)}`,
  `Hora: ${appointment.hora}`,
  `Servicios: ${appointment.Servicio}`,
  appointment.notas ? `Notas: ${appointment.notas}` : "",
  "",
  "Te esperamos. Si necesitas cambiar tu cita, respondenos por WhatsApp.",
].filter(Boolean).join("\n");

const buildEmailHtml = (appointment: Appointment) => `
  <div style="font-family: Arial, sans-serif; background:#FAF9F6; padding:28px; color:#5D4037;">
    <div style="max-width:620px; margin:auto; background:#ffffff; border-radius:22px; overflow:hidden; border:1px solid #E5D3B3;">
      <div style="background:#5D4037; color:#ffffff; padding:24px 28px;">
        <p style="margin:0; letter-spacing:3px; font-size:11px; text-transform:uppercase; color:#E5D3B3;">Marobel Beauty Studio</p>
        <h1 style="margin:10px 0 0; font-family: Georgia, serif; font-size:30px;">Tu cita fue confirmada</h1>
      </div>
      <div style="padding:26px 28px;">
        <p style="font-size:16px; line-height:1.6;">Hola <strong>${appointment.Nombre_cliente}</strong>, hemos confirmado tu reserva. Estos son los detalles:</p>
        <table style="width:100%; border-collapse:collapse; margin:22px 0;">
          <tr><td style="padding:12px; background:#FAF9F6; border:1px solid #E5D3B3;"><strong>Fecha</strong></td><td style="padding:12px; border:1px solid #E5D3B3;">${formatDate(appointment.fecha)}</td></tr>
          <tr><td style="padding:12px; background:#FAF9F6; border:1px solid #E5D3B3;"><strong>Hora</strong></td><td style="padding:12px; border:1px solid #E5D3B3;">${appointment.hora}</td></tr>
          <tr><td style="padding:12px; background:#FAF9F6; border:1px solid #E5D3B3;"><strong>Servicios</strong></td><td style="padding:12px; border:1px solid #E5D3B3;">${appointment.Servicio}</td></tr>
          ${appointment.notas ? `<tr><td style="padding:12px; background:#FAF9F6; border:1px solid #E5D3B3;"><strong>Notas</strong></td><td style="padding:12px; border:1px solid #E5D3B3;">${appointment.notas}</td></tr>` : ""}
        </table>
        <p style="font-size:14px; line-height:1.6; color:#8D6E63;">Si necesitas cambiar tu cita, comunicate con nosotras por WhatsApp. Te esperamos.</p>
      </div>
    </div>
  </div>
`;

const sendEmail = async (appointment: Appointment) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "Marobel Beauty Studio <onboarding@resend.dev>";
  if (!apiKey || !appointment.cliente_email) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: appointment.cliente_email,
      subject: "Tu cita en Marobel fue confirmada",
      html: buildEmailHtml(appointment),
      text: buildPlainMessage(appointment),
    }),
  });

  if (!response.ok) throw new Error(`Resend error: ${await response.text()}`);
  return true;
};

const sendWhatsApp = async (appointment: Appointment) => {
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const to = cleanPhone(appointment.whatsapp);
  if (!token || !phoneNumberId || !to) return false;

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: buildPlainMessage(appointment) },
    }),
  });

  if (!response.ok) throw new Error(`WhatsApp error: ${await response.text()}`);
  return true;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { event, appointment } = await req.json() as { event?: string; appointment?: Appointment };
    if (event !== "accepted" || !appointment?.cita) {
      return new Response(JSON.stringify({ error: "Payload invalido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const [email, whatsapp] = await Promise.all([
      sendEmail(appointment),
      sendWhatsApp(appointment),
    ]);

    return new Response(JSON.stringify({ email, whatsapp }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
