import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

type Appointment = {
  cita: number;
  Servicio: string | null;
  fecha: string | null;
  hora: string | null;
  Estado: "pendiente" | "aceptada" | "rechazada" | null;
};

const statusText = { pendiente: "Pendiente", aceptada: "Aceptada", rechazada: "Rechazada" };

export default function MyAppointments() {
  const { user, loading, login } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { setAppointments([]); setFetching(false); return; }
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("citas")
        .select("cita, Servicio, fecha, hora, Estado")
        .eq("Usuario_id", user.id).order("cita", { ascending: false });
      if (active) { setAppointments(error ? [] : (data as Appointment[]) ?? []); setFetching(false); }
      if (error) console.error("No se pudieron cargar las citas:", error);
    };
    void load();
    const channel = supabase.channel(`my_appointments_${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "citas", filter: `Usuario_id=eq.${user.id}` }, () => void load())
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [user?.id]);

  return <main className="min-h-screen bg-[#FAF9F6] px-4 pb-20 pt-28 text-[#5D4037]">
    <div className="mx-auto max-w-3xl">
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8D6E63]">Tus reservas</span>
      <h1 className="mt-2 font-serif text-4xl">Mis citas</h1>
      <p className="mt-3 text-sm text-[#5D4037]/65">Aquí puedes ver si tu solicitud está pendiente, aceptada o rechazada.</p>
      {loading || fetching ? <p className="mt-8 text-sm">Cargando citas...</p> : !user ?
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm"><p className="mb-4 text-sm">Inicia sesión para consultar tus citas.</p><button type="button" onClick={login} className="rounded-full bg-[#5D4037] px-5 py-2.5 text-xs font-bold text-white">Ingresar con Google</button></div> :
        !appointments.length ? <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm"><p className="mb-4 text-sm">Todavía no tienes citas.</p><Link to="/servicios" className="text-sm font-semibold text-[#8D6E63]">Explorar servicios</Link></div> :
          <div className="mt-8 space-y-3">{appointments.map((appointment) => {
            const status = appointment.Estado || "pendiente";
            return <article key={appointment.cita} className="rounded-2xl border border-[#E5D3B3]/40 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-serif text-xl">{appointment.Servicio || "Servicios Marobel"}</h2><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${status === "aceptada" ? "bg-green-100 text-green-800" : status === "rechazada" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{statusText[status]}</span></div>
              <p className="mt-3 text-sm text-[#5D4037]/65">{appointment.fecha || "Fecha por confirmar"} · {appointment.hora?.slice(0, 5) || "Hora por confirmar"}</p>
            </article>;
          })}</div>}
    </div>
  </main>;
}
