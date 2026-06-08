import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../supabase";
import { Calendar } from "./Calendar";
import { DatePicker } from "./DatePicker";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

interface Appointment {
  cita: string;
  Nombre_cliente: string;
  cliente_email?: string;
  Servicio: string;
  fecha: string;
  hora: string;
  Estado: "pendiente" | "aceptada" | "rechazada";
  whatsapp?: string;
  notas?: string;
}

type DatePreset = "all" | "today" | "week" | "month" | "lastMonth";

const todayKey = () => new Date().toISOString().split("T")[0];
const formatKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const rangeForPreset = (preset: DatePreset) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (preset === "all") return { start: "", end: "" };
  if (preset === "today") return { start: todayKey(), end: todayKey() };
  if (preset === "week") {
    start.setDate(now.getDate() - now.getDay() + 1);
    end.setDate(start.getDate() + 6);
  } else if (preset === "month") {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
  } else {
    start.setMonth(now.getMonth() - 1, 1);
    end.setMonth(now.getMonth(), 0);
  }
  return { start: formatKey(start), end: formatKey(end) };
};

export default function ScheduleAdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [searchTerm, setSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const { data, error } = await supabase.from("citas").select("*");
    if (error) return void toast.error(`Error al cargar citas: ${error.message}`);
    setAppointments((data as Appointment[]) || []);
  };

  useEffect(() => {
    fetchAppointments();
    const channel = supabase.channel("schedule_admin_citas").on("postgres_changes", { event: "*", schema: "public", table: "citas" }, fetchAppointments).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, Estado: Appointment["Estado"]) => {
    const { error } = await supabase.from("citas").update({ Estado }).eq("cita", id);
    if (error) return void toast.error(`Error al actualizar: ${error.message}`);
    setAppointments((previous) => previous.map((appointment) => appointment.cita === id ? { ...appointment, Estado } : appointment));
    toast.success(`Cita ${Estado} correctamente`);
  };

  const deleteAppointment = (id: string) => toast("¿Eliminar esta cita?", {
    action: {
      label: "Eliminar",
      onClick: async () => {
        const { error } = await supabase.from("citas").delete().eq("cita", id);
        if (error) return void toast.error(`Error al eliminar: ${error.message}`);
        setAppointments((previous) => previous.filter((appointment) => appointment.cita !== id));
        toast.success("Cita eliminada");
      },
    },
    cancel: { label: "Cancelar", onClick: () => undefined },
  });

  const filteredAppointments = useMemo(() => {
    const range = rangeForPreset(datePreset);
    const term = searchTerm.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const searchable = `${appointment.Nombre_cliente || ""} ${appointment.Servicio || ""} ${appointment.whatsapp || ""} ${appointment.cliente_email || ""}`.toLowerCase();
      return (!term || searchable.includes(term)) && (!range.start || (appointment.fecha >= range.start && appointment.fecha <= range.end));
    }).sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
  }, [appointments, datePreset, searchTerm]);

  const selectedAppointments = appointments.filter((appointment) => appointment.fecha === selectedDate).sort((a, b) => a.hora.localeCompare(b.hora));

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const status = appointment.Estado || "pendiente";
    const statusColor = status === "aceptada" ? "bg-green-50 text-green-700" : status === "rechazada" ? "bg-gray-100 text-gray-600" : "bg-yellow-50 text-yellow-700";
    const expanded = expandedId === appointment.cita;
    return <Card className={`border-none bg-white shadow-sm transition hover:shadow-md ${expanded ? "ring-2 ring-[#E5D3B3]" : ""}`} onClick={() => setExpandedId(expanded ? null : appointment.cita)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div><span className={`mb-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span><h3 className="font-serif text-lg text-[#5D4037]">{appointment.Nombre_cliente}</h3><p className="text-xs text-[#5D4037]/60">{appointment.Servicio}</p></div>
          <div className="text-right text-xs font-bold text-[#8D6E63]"><p>{appointment.fecha}</p><p>{appointment.hora}</p></div>
        </div>
        {expanded && <div className="mt-4 space-y-3 border-t border-[#E5D3B3]/20 pt-4 text-xs text-[#5D4037]/70">
          <p><strong>Email:</strong> {appointment.cliente_email || "N/A"}</p><p><strong>WhatsApp:</strong> {appointment.whatsapp || "N/A"}</p>{appointment.notas && <p className="rounded-xl bg-[#FAF9F6] p-3"><strong>Notas:</strong> {appointment.notas}</p>}
          <div className="flex flex-wrap gap-2"><Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={(event) => { event.stopPropagation(); updateStatus(appointment.cita, "aceptada"); }}>Aceptar</Button><Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); updateStatus(appointment.cita, "rechazada"); }}>Rechazar</Button><Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={(event) => { event.stopPropagation(); deleteAppointment(appointment.cita); }}><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button></div>
        </div>}
      </CardContent>
    </Card>;
  };

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8D6E63]">Acceso limitado</span><h1 className="mt-1 font-serif text-4xl text-[#5D4037]">Agenda y clientes</h1><p className="mt-2 text-sm text-[#5D4037]/60">Gestiona citas y disponibilidad. Los servicios y promociones no están disponibles para esta cuenta.</p></div><div className="flex gap-2 rounded-full bg-white p-2 shadow-sm"><span className="flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]"><Users className="h-4 w-4 text-[#8D6E63]" />{appointments.length} citas</span><span className="flex items-center gap-2 border-l border-[#E5D3B3]/30 px-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]"><CalendarDays className="h-4 w-4 text-[#8D6E63]" />{selectedAppointments.length} día</span></div></header>
    <div className="grid gap-8 lg:grid-cols-3"><section className="space-y-6 lg:col-span-2"><div className="rounded-3xl border border-[#E5D3B3]/20 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-serif text-2xl text-[#5D4037]">Reservas</h2><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D4037]/30" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar cliente o servicio" className="rounded-full border-none bg-[#FAF9F6] pl-10 text-xs" /></div></div><div className="flex flex-wrap gap-2">{([{ id: "today", label: "Hoy" }, { id: "week", label: "Semana" }, { id: "month", label: "Mes" }, { id: "lastMonth", label: "Mes pasado" }, { id: "all", label: "Todo" }] as { id: DatePreset; label: string }[]).map((item) => <button key={item.id} type="button" onClick={() => setDatePreset(item.id)} className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-widest ${datePreset === item.id ? "bg-[#5D4037] text-white" : "border border-[#E5D3B3] text-[#5D4037]"}`}>{item.label}</button>)}</div></div><div className="grid gap-3">{filteredAppointments.length ? filteredAppointments.map((appointment) => <AppointmentCard key={appointment.cita} appointment={appointment} />) : <p className="rounded-2xl bg-white py-10 text-center text-sm italic text-[#5D4037]/50">No hay citas para este filtro.</p>}</div></section><aside className="space-y-4"><h2 className="font-serif text-2xl text-[#5D4037]">Bloquear disponibilidad</h2><div className="rounded-3xl border border-[#E5D3B3]/10 bg-white p-5 shadow-xl"><DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} isAdmin /><div className="mt-6"><Calendar selectedDate={selectedDate} onSelectSlot={() => undefined} selectedTime={null} isAdmin /></div></div></aside></div>
  </div>;
}
