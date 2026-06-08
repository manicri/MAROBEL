import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, Clock3, Download, MessageCircle, UserCheck, UserX } from "lucide-react";
import { supabase } from "../supabase";

interface Appointment {
  cita: string;
  Nombre_cliente?: string;
  cliente_email?: string;
  Servicio?: string;
  fecha?: string;
  hora?: string;
  Estado?: string;
  whatsapp?: string;
}

const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function AdminOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("citas").select("cita, Nombre_cliente, cliente_email, Servicio, fecha, hora, Estado, whatsapp");
      setAppointments(data ?? []);
    };
    load();
    const channel = supabase.channel("admin_overview_citas").on("postgres_changes", { event: "*", schema: "public", table: "citas" }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const stats = useMemo(() => ({
    pending: appointments.filter((item) => !item.Estado || item.Estado === "pendiente").length,
    accepted: appointments.filter((item) => item.Estado === "aceptada").length,
    rejected: appointments.filter((item) => item.Estado === "rechazada").length,
    today: appointments.filter((item) => item.fecha === today).length,
  }), [appointments, today]);

  const exportCsv = () => {
    const headers = ["Cliente", "Email", "WhatsApp", "Servicio", "Fecha", "Hora", "Estado"];
    const rows = appointments
      .slice()
      .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))
      .map((item) => [item.Nombre_cliente, item.cliente_email, item.whatsapp, item.Servicio, item.fecha, item.hora, item.Estado].map(escapeCsv).join(","));
    const blob = new Blob(["\uFEFF" + [headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `citas-marobel-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: "Pendientes", value: stats.pending, icon: Clock3, color: "bg-amber-50 text-amber-700" },
    { label: "Aceptadas", value: stats.accepted, icon: UserCheck, color: "bg-emerald-50 text-emerald-700" },
    { label: "Rechazadas", value: stats.rejected, icon: UserX, color: "bg-stone-100 text-stone-600" },
    { label: "Citas de hoy", value: stats.today, icon: CalendarCheck2, color: "bg-[#E5D3B3]/25 text-[#5D4037]" },
  ];

  return (
    <section className="mb-8 rounded-3xl border border-[#E5D3B3]/25 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8D6E63]">Resumen en tiempo real</span><h2 className="mt-1 font-serif text-2xl text-[#5D4037]">Estado de las reservas</h2></div>
        <div className="flex flex-wrap gap-2"><a href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#E5D3B3] px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]"><MessageCircle className="h-4 w-4" />WhatsApp</a><button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-[#5D4037] px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white"><Download className="h-4 w-4" />Exportar CSV</button></div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl bg-[#FAF9F6] p-4"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${color}`}><Icon className="h-4 w-4" /></div><p className="font-serif text-3xl text-[#5D4037]">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/48">{label}</p></div>)}</div>
      {stats.pending > 0 && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">Tienes {stats.pending} reserva{stats.pending === 1 ? "" : "s"} pendiente{stats.pending === 1 ? "" : "s"} por revisar.</p>}
    </section>
  );
}
