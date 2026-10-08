import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { canUseWebPush, disableWebPush, enableWebPush, isPushEnabledHere } from "../lib/webPush";

type AppointmentNotice = {
  id: string;
  cita_id: number | null;
  event_type: "new_reservation" | "status_accepted" | "status_rejected" | "push_test";
  title: string;
  body: string;
  target_path: string;
  created_at: string;
  read_at: string | null;
};

export default function NotificationCenter() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<AppointmentNotice[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!user) { setNotices([]); setPushEnabled(false); return; }
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("app_notifications")
        .select("id, cita_id, event_type, title, body, target_path, created_at, read_at")
        .order("created_at", { ascending: false }).limit(30);
      if (active && !error) setNotices((data as AppointmentNotice[]) ?? []);
      if (error) console.error("No se pudieron cargar los avisos:", error);
    };
    void load();
    const refreshPush = () => void isPushEnabledHere(user.id)
      .then((value) => active && setPushEnabled(value))
      .catch(() => active && setPushEnabled(false));
    refreshPush();
    window.addEventListener("marobel-push-changed", refreshPush);
    const channel = supabase.channel(`app_notifications_${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "app_notifications",
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          const notice = payload.new as AppointmentNotice;
          toast.info(notice.title, { description: notice.body, duration: 7000 });
        }
        void load();
      }).subscribe();
    return () => { active = false; window.removeEventListener("marobel-push-changed", refreshPush); void supabase.removeChannel(channel); };
  }, [user?.id]);

  if (!user) return null;
  const unread = notices.filter((notice) => !notice.read_at).length;

  const markRead = async (notice: AppointmentNotice) => {
    if (notice.read_at) return;
    const readAt = new Date().toISOString();
    const { error } = await supabase.from("app_notifications")
      .update({ read_at: readAt }).eq("id", notice.id);
    if (error) throw error;
    setNotices((current) => current.map((item) => item.id === notice.id ? { ...item, read_at: readAt } : item));
  };

  const openNotice = async (notice: AppointmentNotice) => {
    if (!(isAdmin && notice.event_type === "new_reservation")) {
      try { await markRead(notice); } catch (error) { console.error(error); }
    }
    setOpen(false);
    navigate(notice.target_path);
  };

  const decide = async (notice: AppointmentNotice, status: "aceptada" | "rechazada") => {
    if (!notice.cita_id) return;
    setBusyId(notice.id);
    const { data, error } = await supabase.from("citas")
      .update({ Estado: status })
      .eq("cita", notice.cita_id)
      .eq("Estado", "pendiente")
      .select("cita");
    setBusyId(null);
    if (error) return void toast.error(`No se pudo actualizar la cita: ${error.message}`);
    if (!data?.length) return void toast.info("Esta cita ya fue respondida por otro administrador.");
    toast.success(`Cita ${status}. El cliente recibirá el aviso.`);
    setNotices((current) => current.map((item) =>
      item.cita_id === notice.cita_id && item.event_type === "new_reservation"
        ? { ...item, read_at: new Date().toISOString() } : item));
  };

  const togglePush = async () => {
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await disableWebPush(user.id);
        setPushEnabled(false);
        window.dispatchEvent(new Event("marobel-push-changed"));
        toast.success("Avisos desactivados en este dispositivo");
      } else {
        await enableWebPush(user.id);
        setPushEnabled(true);
        window.dispatchEvent(new Event("marobel-push-changed"));
        toast.success("Avisos activados en este dispositivo");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron activar los avisos.");
    } finally { setPushBusy(false); }
  };

  const sendTest = async () => {
    setPushBusy(true);
    const { error } = await supabase.rpc("send_test_push");
    setPushBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Prueba enviada a tus dispositivos registrados.");
  };

  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)}
      aria-label={`Avisos${unread ? ` (${unread} sin leer)` : ""}`}
      aria-expanded={open}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
      {unread ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5D3B3] px-1 text-[9px] font-bold text-[#5D4037]">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <div className="fixed right-3 top-16 z-[60] max-h-[min(70vh,560px)] w-[calc(100vw-1.5rem)] max-w-sm overflow-y-auto rounded-2xl border border-[#E5D3B3]/50 bg-white p-4 text-[#5D4037] shadow-2xl md:absolute md:right-0 md:top-12 md:w-96">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-serif text-xl">Avisos</h2><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar avisos" className="rounded-full p-1 hover:bg-[#FAF9F6]"><X className="h-4 w-4" /></button></div>
      {canUseWebPush() ? <div className="mb-4 space-y-2">
        {pushEnabled ? <><p className="flex items-center gap-2 text-xs font-semibold text-green-700"><Check className="h-4 w-4" />Avisos activados en este dispositivo</p><button type="button" onClick={sendTest} disabled={pushBusy} className="w-full rounded-xl bg-[#5D4037] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60">Enviar alerta de prueba</button><button type="button" onClick={togglePush} disabled={pushBusy} className="w-full text-xs text-[#5D4037]/60 disabled:opacity-60">Desactivar en este dispositivo</button></> :
          <button type="button" onClick={togglePush} disabled={pushBusy} className="flex w-full items-center justify-center rounded-xl border border-[#E5D3B3] bg-[#FAF9F6] px-3 py-2.5 text-xs font-semibold disabled:opacity-60">{pushBusy ? "Preparando avisos..." : "Activar avisos en este dispositivo"}</button>}
      </div> : <p className="mb-4 rounded-xl bg-[#FAF9F6] p-3 text-xs text-[#5D4037]/65">Este navegador no permite avisos externos. Si usas iPhone, añade la página a la pantalla de inicio y ábrela desde allí.</p>}
      {!notices.length ? <p className="rounded-xl bg-[#FAF9F6] p-5 text-center text-sm text-[#5D4037]/60">Todavía no tienes avisos.</p> :
        <div className="space-y-2">{notices.map((notice) => <div key={notice.id} className={`rounded-xl border p-3 ${notice.read_at ? "border-[#E5D3B3]/25 bg-white" : "border-[#E5D3B3] bg-[#FAF9F6]"}`}>
          <button type="button" onClick={() => openNotice(notice)} className="w-full text-left">
            <span className="block text-sm font-semibold">{notice.title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-[#5D4037]/70">{notice.body}</span>
            <span className="mt-2 block text-[10px] text-[#8D6E63]">{new Date(notice.created_at).toLocaleString("es-EC")}</span>
          </button>
          {isAdmin && notice.event_type === "new_reservation" && !notice.read_at &&
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => decide(notice, "aceptada")} disabled={busyId === notice.id} className="flex-1 rounded-full bg-green-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Aceptar</button>
              <button type="button" onClick={() => decide(notice, "rechazada")} disabled={busyId === notice.id} className="flex-1 rounded-full border border-[#E5D3B3] px-3 py-2 text-xs font-bold disabled:opacity-50">Rechazar</button>
            </div>}
        </div>)}</div>}
    </div>}
  </div>;
}
