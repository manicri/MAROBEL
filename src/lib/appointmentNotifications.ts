import { supabase } from "../supabase";

export interface AppointmentNotificationPayload {
  cita: string;
  Nombre_cliente: string;
  cliente_email?: string;
  Servicio: string;
  fecha: string;
  hora: string;
  whatsapp?: string;
  notas?: string;
}

export const notifyAppointmentAccepted = async (appointment: AppointmentNotificationPayload) => {
  const { data, error } = await supabase.functions.invoke("notify-appointment", {
    body: {
      event: "accepted",
      appointment,
    },
  });

  if (error) throw error;
  return data as { email?: boolean; whatsapp?: boolean; skipped?: boolean } | null;
};
