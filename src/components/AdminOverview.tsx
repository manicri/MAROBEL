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
  notas?: string;
}

const todayKey = () => new Date().toISOString().split("T")[0];
const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const formatDate = (value?: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatStatus = (value?: string) => {
  if (!value) return "Pendiente";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatServices = (value?: string) => escapeHtml(value)
  .split(/,\s*/)
  .filter(Boolean)
  .join("<br />");

export default function AdminOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("citas").select("cita, Nombre_cliente, cliente_email, Servicio, fecha, hora, Estado, whatsapp, notas");
      setAppointments(data ?? []);
    };
    load();
    const channel = supabase.channel("admin_overview_citas").on("postgres_changes", { event: "*", schema: "public", table: "citas" }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const today = todayKey();
  const stats = useMemo(() => ({
    pending: appointments.filter((item) => !item.Estado || item.Estado === "pendiente").length,
    accepted: appointments.filter((item) => item.Estado === "aceptada").length,
    rejected: appointments.filter((item) => item.Estado === "rechazada").length,
    today: appointments.filter((item) => item.fecha === today).length,
  }), [appointments, today]);

  const exportExcel = () => {
    const sortedAppointments = appointments
      .slice()
      .sort((a, b) => `${b.fecha || ""} ${b.hora || ""}`.localeCompare(`${a.fecha || ""} ${a.hora || ""}`));

    const rows = sortedAppointments.map((item, index) => {
      const isBlock = item.Nombre_cliente === "BLOQUEO ADMINISTRATIVO";
      return `<tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(isBlock ? "Bloqueo administrativo" : item.Nombre_cliente)}</td>
        <td>${escapeHtml(item.cliente_email)}</td>
        <td class="text">${escapeHtml(item.whatsapp)}</td>
        <td class="services">${formatServices(item.Servicio)}</td>
        <td class="center">${escapeHtml(formatDate(item.fecha))}</td>
        <td class="center">${escapeHtml(item.hora)}</td>
        <td class="status ${escapeHtml(item.Estado || "pendiente")}">${escapeHtml(isBlock ? "Bloqueo" : formatStatus(item.Estado))}</td>
        <td class="notes">${escapeHtml(item.notas)}</td>
      </tr>`;
    }).join("");

    const workbook = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8" />
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Reservas Marobel</x:Name><x:WorksheetOptions><x:FreezePanes/><x:FrozenNoSplit/><x:SplitHorizontal>4</x:SplitHorizontal><x:TopRowBottomPane>4</x:TopRowBottomPane><x:ActivePane>2</x:ActivePane></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  <style>
    body { font-family: Arial, sans-serif; color: #5D4037; }
    table { border-collapse: collapse; table-layout: fixed; width: 100%; }
    th, td { border: 1px solid #D9C2A3; padding: 8px 10px; vertical-align: top; font-size: 12px; white-space: normal; mso-wrap-style: true; }
    th { background: #5D4037; color: #FFFFFF; font-weight: 700; text-align: center; }
    .title { background: #E5D3B3; color: #5D4037; font-size: 22px; font-weight: 700; text-align: center; padding: 16px; }
    .subtitle { background: #FAF9F6; color: #8D6E63; font-size: 12px; text-align: center; padding: 10px; }
    .summary { background: #FAF9F6; font-weight: 700; text-align: center; }
    .center { text-align: center; }
    .text { mso-number-format: "\\@"; }
    .services { width: 280px; line-height: 1.35; }
    .notes { width: 260px; line-height: 1.35; }
    .status { text-align: center; font-weight: 700; }
    .aceptada { background: #DCFCE7; color: #166534; }
    .rechazada { background: #F1F5F9; color: #475569; }
    .pendiente { background: #FEF3C7; color: #92400E; }
  </style>
</head>
<body>
  <table>
    <colgroup>
      <col style="width: 45px" />
      <col style="width: 180px" />
      <col style="width: 230px" />
      <col style="width: 140px" />
      <col style="width: 280px" />
      <col style="width: 110px" />
      <col style="width: 90px" />
      <col style="width: 120px" />
      <col style="width: 260px" />
    </colgroup>
    <tr><td class="title" colspan="9">Reservas Marobel Beauty Studio</td></tr>
    <tr><td class="subtitle" colspan="9">Exportado el ${escapeHtml(new Date().toLocaleString("es-EC"))}</td></tr>
    <tr>
      <td class="summary" colspan="2">Total: ${sortedAppointments.length}</td>
      <td class="summary" colspan="2">Pendientes: ${stats.pending}</td>
      <td class="summary" colspan="2">Aceptadas: ${stats.accepted}</td>
      <td class="summary" colspan="3">Rechazadas: ${stats.rejected}</td>
    </tr>
    <tr><td colspan="9"></td></tr>
    <tr>
      <th>#</th>
      <th>Cliente</th>
      <th>Email</th>
      <th>WhatsApp</th>
      <th>Servicios</th>
      <th>Fecha</th>
      <th>Hora</th>
      <th>Estado</th>
      <th>Notas</th>
    </tr>
    ${rows || `<tr><td colspan="9" class="center">No hay reservas para exportar.</td></tr>`}
  </table>
</body>
</html>`;

    const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservas-marobel-${today}.xls`;
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
        <div className="flex flex-wrap gap-2"><a href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#E5D3B3] px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]"><MessageCircle className="h-4 w-4" />WhatsApp</a><button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 rounded-full bg-[#5D4037] px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white"><Download className="h-4 w-4" />Exportar Excel</button></div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl bg-[#FAF9F6] p-4"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${color}`}><Icon className="h-4 w-4" /></div><p className="font-serif text-3xl text-[#5D4037]">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/48">{label}</p></div>)}</div>
      {stats.pending > 0 && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">Tienes {stats.pending} reserva{stats.pending === 1 ? "" : "s"} pendiente{stats.pending === 1 ? "" : "s"} por revisar.</p>}
    </section>
  );
}
