import { useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { enablePushNotifications, isInstalledApp, isIosDevice } from "@/lib/pushNotifications";

type PushNotificationButtonProps = {
  mobile?: boolean;
  onComplete?: () => void;
};

export default function PushNotificationButton({ mobile = false, onComplete }: PushNotificationButtonProps) {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(() => typeof Notification !== "undefined" && Notification.permission === "granted");

  if (!user) return null;

  const activate = async () => {
    if (isIosDevice() && !isInstalledApp()) {
      toast.info("Instala Marobel en tu iPhone", {
        description: "Pulsa Compartir, elige ‘Agregar a pantalla de inicio’, abre Marobel desde el icono y activa las notificaciones.",
        duration: 10000,
      });
      return;
    }

    setLoading(true);
    try {
      await enablePushNotifications(user.id, user.email || "", isAdmin);
      setEnabled(true);
      onComplete?.();
      toast.success("Notificaciones activadas", {
        description: "Las reservas y sus cambios llegarán a este teléfono aunque la página esté cerrada.",
      });
    } catch (error) {
      toast.error("No se pudieron activar", {
        description: error instanceof Error ? error.message : "Revisa los permisos del teléfono.",
      });
    } finally {
      setLoading(false);
    }
  };

  const Icon = enabled ? BellRing : Bell;
  return (
    <button
      type="button"
      onClick={activate}
      disabled={loading}
      className={mobile
        ? "flex w-full items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-left text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/15"
        : "flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-white/15 disabled:opacity-60"}
      title="Activar notificaciones en este teléfono"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      <span className={mobile ? "" : "hidden xl:inline"}>{enabled ? "Avisos activos" : "Activar avisos"}</span>
    </button>
  );
}
