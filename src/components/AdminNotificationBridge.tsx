import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "../supabase";
import { notifyAppointmentAccepted, type AppointmentNotificationPayload } from "../lib/appointmentNotifications";

type AppointmentChange = AppointmentNotificationPayload & {
  Estado?: string;
};

export default function AdminNotificationBridge() {
  const notified = useRef(new Set<string>());

  useEffect(() => {
    const channel = supabase
      .channel("admin_confirmation_notifications")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "citas" },
        async (payload) => {
          const appointment = payload.new as AppointmentChange;
          if (appointment.Estado !== "aceptada" || !appointment.cita) return;
          if (notified.current.has(appointment.cita)) return;
          notified.current.add(appointment.cita);

          try {
            const result = await notifyAppointmentAccepted(appointment);
            if (result?.email || result?.whatsapp) {
              toast.success("Cliente notificado por email/WhatsApp");
            } else if (result?.skipped) {
              toast.info("La notificación de esta cita ya había sido enviada");
            } else {
              toast.info("Cita aceptada. Configura email/WhatsApp API para enviar avisos automáticos.");
            }
          } catch (error) {
            console.error(error);
            toast.error("La cita fue aceptada, pero no se pudo enviar la notificación automática.");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
