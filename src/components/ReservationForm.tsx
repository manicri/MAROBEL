import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CreditCard, Mail, MessageCircle, Sparkles, Trash2, User, WalletCards, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSelection } from "@/context/SelectionContext";
import { Calendar } from "./Calendar";
import { DatePicker } from "./DatePicker";
import { supabase } from "../supabase";
import { toast } from "sonner";

export const professionalsList = [{ id: "any", name: "Cualquier profesional" }, { id: "ana", name: "Ana (Estilista)" }, { id: "maria", name: "Maria (Cosmetologa)" }, { id: "sofia", name: "Sofia (Manicurista)" }];
const paymentOptions = [{ id: "transferencia", label: "Transferencia bancaria", icon: WalletCards }, { id: "tarjeta", label: "Tarjeta", icon: CreditCard }];
interface Confirmation { name: string; services: string; date: string; time: string; total: number; whatsappUrl: string; }

export default function ReservationForm() {
  const { user, login } = useAuth();
  const { selectedServices, removeService, total, totalDuration, addService, clearSelection } = useSelection();
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = React.useState("any");
  const [paymentMethod, setPaymentMethod] = React.useState("transferencia");
  const [availableServices, setAvailableServices] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmedAttendance, setConfirmedAttendance] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState<Confirmation | null>(null);
  const [formData, setFormData] = React.useState({ nombre: user?.user_metadata?.full_name || "", whatsapp: "", email: user?.email || "", notas: "" });

  React.useEffect(() => setFormData((prev) => ({ ...prev, nombre: prev.nombre || user?.user_metadata?.full_name || "", email: prev.email || user?.email || "" })), [user]);
  React.useEffect(() => { const fetchServices = async () => { const { data } = await supabase.from("servicios").select("*"); setAvailableServices(data ?? []); }; fetchServices(); }, []);
  React.useEffect(() => setSelectedTime(null), [selectedDate]);

  const professionalName = professionalsList.find((item) => item.id === selectedProfessional)?.name || "Cualquier profesional";
  const recommendedServices = availableServices.filter((service) => !selectedServices.some((selected: any) => selected.id === service.id)).slice(0, 3);
  const updateField = (field: keyof typeof formData, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));
  const validateReservation = () => {
    if (!user) return toast.error("Inicia sesion con Google para reservar"), false;
    if (!selectedServices.length) return toast.error("Selecciona al menos un servicio"), false;
    if (formData.nombre.trim().length < 2) return toast.error("Escribe el nombre de la persona"), false;
    if (formData.whatsapp.replace(/\D/g, "").length < 10) return toast.error("Escribe un numero de telefono valido"), false;
    if (!selectedTime) return toast.error("Selecciona una fecha y un horario disponible"), false;
    if (!confirmedAttendance) return toast.error("Debes confirmar que asistiras a tu cita"), false;
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateReservation()) return;
    const authUser = (await supabase.auth.getUser()).data.user;
    if (!authUser) return void toast.error("Tu sesion expiro. Vuelve a ingresar con Google.");
    const { data: currentBlocks, error: blocksError } = await supabase.from("bloqueos").select("hora").eq("fecha", selectedDate);
    if (blocksError) return void toast.error("No se pudo confirmar la disponibilidad. Intenta nuevamente.");
    const normalizeTime = (time: string) => { const [hours, minutes] = time.split(":"); return `${Number(hours)}:${minutes?.slice(0, 2) || "00"}`; };
    if ((currentBlocks ?? []).some((block) => block.hora === null || normalizeTime(block.hora) === normalizeTime(selectedTime!))) { setSelectedTime(null); toast.error("Ese dia u horario fue bloqueado. Selecciona otra opcion."); return; }

    setIsSubmitting(true);
    const servicesNames = selectedServices.map((service: any) => service.name).join(", ");
    const paymentLabel = paymentOptions.find((option) => option.id === paymentMethod)?.label;
    const notes = [`Profesional: ${professionalName}`, `Metodo de pago: ${paymentLabel}`, formData.notas ? `Notas: ${formData.notas}` : ""].filter(Boolean).join("\n");
    const { error } = await supabase.from("citas").insert({ Nombre_cliente: formData.nombre, cliente_email: formData.email || authUser.email, Servicio: servicesNames, fecha: selectedDate, hora: selectedTime, Estado: "pendiente", Usuario_id: authUser.id, whatsapp: formData.whatsapp, notas: notes });
    setIsSubmitting(false);
    if (error) { toast.error(`Error al reservar: ${error.message}`); return; }
    const message = `Hola, acabo de solicitar una reserva en Marobel.\n\nNombre: ${formData.nombre}\nServicios: ${servicesNames}\nProfesional: ${professionalName}\nFecha: ${selectedDate}\nHora: ${selectedTime}\nTotal: $${total.toFixed(2)} (${totalDuration} min)\nPago: ${paymentLabel}`;
    setConfirmation({ name: formData.nombre, services: servicesNames, date: selectedDate, time: selectedTime!, total, whatsappUrl: `https://wa.me/593969272530?text=${encodeURIComponent(message)}` });
    toast.success("Reserva enviada correctamente"); clearSelection(); setSelectedTime(null); setConfirmedAttendance(false); setFormData({ nombre: user?.user_metadata?.full_name || "", whatsapp: "", email: user?.email || "", notas: "" });
  };

  return <motion.section id="reserva" className="min-h-screen bg-[#FAF9F6] px-4 pb-16 pt-24 sm:px-6 md:pt-28" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="container mx-auto max-w-6xl"><div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]">Bolsa de Bienestar</span><h1 className="font-serif text-3xl leading-tight text-[#5D4037] md:text-4xl lg:text-5xl">Finaliza tu experiencia Marobel</h1></div><Link to="/servicios" className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037] hover:text-[#8D6E63]">Seguir eligiendo servicios</Link></div>
      {!user && <Card className="mb-6 rounded-2xl border-none bg-white shadow-md"><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="mb-1 font-serif text-xl text-[#5D4037]">Ingresa para reservar</h2><p className="text-xs text-[#5D4037]/60">Necesitamos tu cuenta para guardar y confirmar la cita.</p></div><Button onClick={login} className="h-10 rounded-full bg-[#5D4037] px-6 text-[10px] font-bold uppercase tracking-widest text-white">Ingresar con Google</Button></CardContent></Card>}
      <form onSubmit={handleSubmit} className="grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]"><div className="space-y-5">
        <Card className="rounded-2xl border-none bg-white shadow-md"><CardContent className="space-y-4 p-5 md:p-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5D3B3]/25"><Sparkles className="h-4 w-4 text-[#8D6E63]" /></div><div><h2 className="font-serif text-xl text-[#5D4037]">Servicios seleccionados</h2><p className="text-xs text-[#5D4037]/55">Puedes quitar servicios antes de reservar.</p></div></div>{!selectedServices.length ? <div className="rounded-xl border border-dashed border-[#E5D3B3] bg-[#FAF9F6] p-6 text-center"><p className="mb-4 text-xs text-[#5D4037]/65">Todavia no has seleccionado servicios.</p><Link to="/servicios" className="inline-flex rounded-full bg-[#5D4037] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white">Ver servicios</Link></div> : <div className="space-y-3">{selectedServices.map((service: any) => <div key={service.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E5D3B3]/30 bg-[#FAF9F6] p-3"><div><p className="font-bold text-[#5D4037]">{service.name}</p><p className="text-[10px] uppercase tracking-widest text-[#5D4037]/55">{service.category} {service.duration ? `- ${service.duration}` : ""}</p></div><div className="flex items-center gap-3"><span className="font-bold text-[#8D6E63]">${Number(service.price).toFixed(2)}</span><button type="button" onClick={() => removeService(service.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}</CardContent></Card>
        <Card className="rounded-2xl border-none bg-white shadow-md"><CardContent className="space-y-4 p-5 md:p-6"><h2 className="font-serif text-xl text-[#5D4037]">Datos de la persona</h2><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/65">Nombre</Label><div className="relative"><User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D4037]/30" /><Input value={formData.nombre} onChange={(e) => updateField("nombre", e.target.value)} className="h-11 rounded-xl border-none bg-[#FAF9F6] pl-11" placeholder="Nombre completo" /></div></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/65">Telefono</Label><div className="relative"><MessageCircle className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D4037]/30" /><Input value={formData.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} className="h-11 rounded-xl border-none bg-[#FAF9F6] pl-11" placeholder="WhatsApp" /></div></div><div className="space-y-2 md:col-span-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/65">Correo</Label><div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D4037]/30" /><Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-11 rounded-xl border-none bg-[#FAF9F6] pl-11" /></div></div></div></CardContent></Card>
        <Card className="rounded-2xl border-none bg-white shadow-md"><CardContent className="space-y-4 p-5 md:p-6"><h2 className="font-serif text-xl text-[#5D4037]">Fecha, horario y profesional</h2><div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/65">Profesional</Label><select value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)} className="h-11 w-full rounded-xl bg-[#FAF9F6] px-4 text-sm text-[#5D4037] outline-none">{professionalsList.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} /><Calendar selectedDate={selectedDate} selectedTime={selectedTime} onSelectSlot={setSelectedTime} totalDuration={totalDuration} selectedProfessional={selectedProfessional} /><div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/65">Notas opcionales</Label><textarea value={formData.notas} onChange={(e) => updateField("notas", e.target.value)} className="min-h-[84px] w-full resize-none rounded-xl border-none bg-[#FAF9F6] p-3 text-sm outline-none" /></div></CardContent></Card>
      </div><aside className="space-y-5 lg:sticky lg:top-24">
        <Card className="rounded-2xl border-none bg-white shadow-md"><CardContent className="space-y-4 p-5"><h2 className="font-serif text-xl text-[#5D4037]">Recomendaciones</h2>{!recommendedServices.length ? <p className="text-sm text-[#5D4037]/60">Tu seleccion ya esta completa.</p> : recommendedServices.map((service) => <div key={service.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E5D3B3]/25 p-3"><div><p className="text-sm font-bold text-[#5D4037]">{service.nombre}</p><p className="text-xs text-[#8D6E63]">${Number(service.precio || 0).toFixed(2)}</p></div><Button type="button" variant="outline" className="rounded-full text-[10px]" onClick={() => addService({ id: service.id, name: service.nombre, price: Number(service.precio || 0), category: service.categoria, description: service.descripcion, duration: service.duracion })}>Agregar</Button></div>)}</CardContent></Card>
        <Card className="rounded-2xl border-none bg-white shadow-md"><CardContent className="space-y-4 p-5"><h2 className="font-serif text-xl text-[#5D4037]">Forma de pago</h2>{paymentOptions.map((option) => { const Icon = option.icon; return <button key={option.id} type="button" onClick={() => setPaymentMethod(option.id)} className={`mb-2 flex w-full items-center gap-3 rounded-xl border p-3 text-left ${paymentMethod === option.id ? "border-[#5D4037] bg-[#E5D3B3]/20" : "border-[#E5D3B3]/30"}`}><Icon className="h-4 w-4 text-[#8D6E63]" /><span className="text-sm font-bold text-[#5D4037]">{option.label}</span></button>; })}</CardContent></Card>
        <Card className="rounded-2xl border-none bg-[#5D4037] text-white shadow-lg"><CardContent className="space-y-4 p-5"><h2 className="font-serif text-xl">Resumen de la reserva</h2><div className="space-y-2 text-xs leading-relaxed text-white/85"><p><strong>Servicio:</strong> {selectedServices.length ? selectedServices.map((service: any) => service.name).join(", ") : "Por seleccionar"}</p><p><strong>Persona:</strong> {formData.nombre || "Por completar"}</p><p><strong>Profesional:</strong> {professionalName}</p><p><strong>Fecha:</strong> {selectedDate}</p><p><strong>Hora:</strong> {selectedTime || "Por seleccionar"}</p><p className="text-base"><strong>Total:</strong> ${total.toFixed(2)} <span className="text-white/65">({totalDuration} min)</span></p></div><label className="flex items-start gap-3 rounded-xl bg-white p-3 text-[#5D4037]"><input type="checkbox" checked={confirmedAttendance} onChange={(e) => setConfirmedAttendance(e.target.checked)} className="mt-1 h-4 w-4" /><span><span className="block text-xs font-bold">Confirmo que asistire a mi cita.</span><span className="mt-1 block text-[10px] text-[#5D4037]/65">Las cancelaciones de ultimo minuto afectan la agenda.</span></span></label><Button type="submit" disabled={isSubmitting || !confirmedAttendance || !selectedTime || !selectedServices.length || !user} className="h-11 w-full rounded-full bg-[#E5D3B3] text-[10px] font-bold uppercase tracking-widest text-[#5D4037] hover:bg-white disabled:opacity-50">{isSubmitting ? "Procesando..." : "Reservar cita"}</Button></CardContent></Card>
      </aside></form>
    </div>
    {confirmation && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2d211d]/70 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"><button type="button" onClick={() => setConfirmation(null)} className="absolute right-4 top-4 rounded-full p-2 text-[#5D4037]/50 hover:bg-[#FAF9F6]"><X className="h-5 w-5" /></button><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50"><CheckCircle2 className="h-9 w-9 text-green-600" /></div><span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]">Solicitud recibida</span><h2 className="mt-2 font-serif text-3xl text-[#5D4037]">Tu cita fue enviada</h2><p className="mt-3 text-sm leading-relaxed text-[#5D4037]/65">Gracias, {confirmation.name}. El equipo de Marobel revisara la solicitud y confirmara tu horario.</p><div className="my-5 rounded-2xl bg-[#FAF9F6] p-4 text-left text-sm text-[#5D4037]"><p><strong>Servicios:</strong> {confirmation.services}</p><p className="mt-2"><strong>Fecha:</strong> {confirmation.date} a las {confirmation.time}</p><p className="mt-2"><strong>Total:</strong> ${confirmation.total.toFixed(2)}</p></div><div className="grid gap-3 sm:grid-cols-2"><a href={confirmation.whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#5D4037] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white">Enviar por WhatsApp</a><Link to="/" onClick={() => setConfirmation(null)} className="rounded-full border border-[#E5D3B3] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]">Volver al inicio</Link></div></motion.div></div>}
  </motion.section>;
}
