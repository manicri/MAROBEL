import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { canUseWebPush, enableWebPush, isPushEnabledHere } from "../lib/webPush";
import { supabase } from "../supabase";

export default function PushSetupCard() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void isPushEnabledHere(user.id)
      .then((value) => { if (active) setEnabled(value); })
      .catch(() => { if (active) setEnabled(false); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [user?.id]);

  if (!user) return null;

  const activateAndCheck = async () => {
    setBusy(true);
    try {
      if (!enabled) {
        await enableWebPush(user.id);
        setEnabled(true);
        window.dispatchEvent(new Event("marobel-push-changed"));
      }
      const { error } = await supabase.rpc("send_test_push");
      if (error) throw error;
      toast.success("Prueba enviada. Debe aparecer una alerta en este teléfono en unos segundos.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo activar la alerta de prueba.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="mb-6 rounded-3xl border border-[#E5D3B3]/50 bg-white p-5 text-[#5D4037] shadow-sm sm:p-6">
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5D3B3]/40"><Smartphone className="h-6 w-6" /></span>
      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-xl sm:text-2xl">Avisos inmediatos de nuevas reservas</h2>
        <p className="mt-1 text-sm text-[#5D4037]/70">Actívalos una vez en cada teléfono o computadora donde quieras recibir las solicitudes, incluso con la página cerrada.</p>
        {!canUseWebPush() ?
          <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">En iPhone: abre esta página en Safari, toca Compartir → Añadir a pantalla de inicio y entra desde el nuevo icono. Entonces podrás activar los avisos aquí. En otros teléfonos, usa un navegador que permita notificaciones y revisa sus permisos.</p> :
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={activateAndCheck} disabled={busy || checking}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#5D4037] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4a332c] disabled:opacity-50">
              {enabled ? <BellRing className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              {busy ? "Preparando la prueba..." : enabled ? "Enviar alerta de prueba" : "Activar en este dispositivo y probar"}
            </button>
            {enabled && <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" />Dispositivo registrado</span>}
          </div>}
        <p className="mt-3 text-xs text-[#5D4037]/55">Si autorizas los avisos y no aparece la prueba, revisa que las notificaciones de este sitio estén permitidas en los ajustes del teléfono.</p>
      </div>
    </div>
  </section>;
}
