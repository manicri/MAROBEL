import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MessageCircle,
  Sparkles,
  Trash2,
  User,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSelection } from "@/context/SelectionContext";
import { Calendar } from "./Calendar";
import { DatePicker } from "./DatePicker";
import { supabase } from "../supabase";
import { toast } from "sonner";

export const professionalsList = [
  { id: "any", name: "Cualquier profesional" },
  { id: "ana", name: "Ana (Estilista)" },
  { id: "maria", name: "Maria (Cosmetologa)" },
  { id: "sofia", name: "Sofia (Manicurista)" },
];

const paymentOptions = [
  { id: "transferencia", label: "Transferencia bancaria", icon: WalletCards },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
];

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
  const [formData, setFormData] = React.useState({
    nombre: user?.user_metadata?.full_name || "",
    whatsapp: "",
    email: user?.email || "",
    notas: "",
  });

  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      nombre: prev.nombre || user?.user_metadata?.full_name || "",
      email: prev.email || user?.email || "",
    }));
  }, [user]);

  React.useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from("servicios").select("*");
      setAvailableServices(data ?? []);
    };

    fetchServices();
  }, []);

  const professionalName =
    professionalsList.find((professional) => professional.id === selectedProfessional)?.name ||
    "Cualquier profesional";

  const recommendedServices = availableServices
    .filter((service) => !selectedServices.some((selected: any) => selected.id === service.id))
    .slice(0, 3);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateReservation = () => {
    if (!user) {
      toast.error("Inicia sesion con Google para reservar");
      return false;
    }

    if (selectedServices.length === 0) {
      toast.error("Selecciona al menos un servicio");
      return false;
    }

    if (formData.nombre.trim().length < 2) {
      toast.error("Escribe el nombre de la persona");
      return false;
    }

    if (formData.whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("Escribe un numero de telefono valido");
      return false;
    }

    if (!selectedTime) {
      toast.error("Selecciona una fecha y un horario disponible");
      return false;
    }

    if (!confirmedAttendance) {
      toast.error("Debes confirmar que asistiras a tu cita");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateReservation()) return;

    const authUser = (await supabase.auth.getUser()).data.user;
    if (!authUser) {
      toast.error("Tu sesion expiro. Vuelve a ingresar con Google.");
      return;
    }

    setIsSubmitting(true);

    const serviciosNombres = selectedServices.map((service: any) => service.name).join(", ");
    const notas = [
      `Profesional: ${professionalName}`,
      `Metodo de pago: ${paymentOptions.find((option) => option.id === paymentMethod)?.label}`,
      formData.notas ? `Notas: ${formData.notas}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("citas").insert({
      Nombre_cliente: formData.nombre,
      cliente_email: formData.email || authUser.email,
      Servicio: serviciosNombres,
      fecha: selectedDate,
      hora: selectedTime,
      Estado: "pendiente",
      Usuario_id: authUser.id,
      whatsapp: formData.whatsapp,
      notas,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(`Error al reservar: ${error.message}`);
      console.error(error);
      return;
    }

    const adminPhone = "593969272530";
    const message = `Hola, acabo de solicitar una reserva en Marobel.%0A%0ANombre: ${formData.nombre}%0AServicios: ${serviciosNombres}%0AProfesional: ${professionalName}%0AFecha: ${selectedDate}%0AHora: ${selectedTime}%0ATotal: $${total.toFixed(2)} (${totalDuration} min)%0APago: ${paymentOptions.find((option) => option.id === paymentMethod)?.label}`;
    window.open(`https://wa.me/${adminPhone}?text=${message}`, "_blank");

    toast.success("Reserva enviada correctamente");
    clearSelection();
    setSelectedTime(null);
    setConfirmedAttendance(false);
    setFormData({ nombre: user?.user_metadata?.full_name || "", whatsapp: "", email: user?.email || "", notas: "" });
  };

  return (
    <motion.section
      id="reserva"
      className="min-h-screen bg-[#FAF9F6] pt-32 pb-24 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[#8D6E63] font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
              Bolsa de Bienestar
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#5D4037] leading-tight">
              Finaliza tu experiencia Marobel
            </h1>
          </div>
          <Link to="/#servicios" className="text-xs uppercase tracking-widest font-bold text-[#5D4037] hover:text-[#8D6E63]">
            Seguir eligiendo servicios
          </Link>
        </div>

        {!user && (
          <Card className="mb-8 border-none rounded-3xl bg-white shadow-lg">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#5D4037] mb-1">Ingresa para reservar</h2>
                <p className="text-sm text-[#5D4037]/60">Necesitamos tu cuenta para guardar y confirmar la cita.</p>
              </div>
              <Button onClick={login} className="bg-[#5D4037] text-white rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold">
                Ingresar con Google
              </Button>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="space-y-8">
            <Card className="border-none rounded-3xl bg-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#E5D3B3]/25 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#8D6E63]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-[#5D4037]">Servicios seleccionados</h2>
                    <p className="text-xs text-[#5D4037]/55">Puedes quitar servicios antes de reservar.</p>
                  </div>
                </div>

                {selectedServices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E5D3B3] bg-[#FAF9F6] p-8 text-center">
                    <p className="text-sm text-[#5D4037]/65 mb-5">Todavia no has seleccionado servicios.</p>
                    <Link to="/#servicios" className="inline-flex items-center justify-center rounded-full bg-[#5D4037] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white">
                      Ver servicios
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedServices.map((service: any) => (
                      <div key={service.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5D3B3]/30 bg-[#FAF9F6] p-4">
                        <div>
                          <p className="font-bold text-[#5D4037]">{service.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#5D4037]/55">
                            {service.category} {service.duration ? `- ${service.duration}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#8D6E63]">${Number(service.price).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeService(service.id)}
                            className="w-10 h-10 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center"
                            aria-label={`Eliminar ${service.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none rounded-3xl bg-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-2xl text-[#5D4037]">Datos de la persona</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D4037]/30" />
                      <Input value={formData.nombre} onChange={(e) => updateField("nombre", e.target.value)} className="pl-11 h-13 bg-[#FAF9F6] border-none rounded-xl" placeholder="Nombre completo" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Telefono</Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D4037]/30" />
                      <Input value={formData.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} className="pl-11 h-13 bg-[#FAF9F6] border-none rounded-xl" placeholder="WhatsApp" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Correo</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D4037]/30" />
                      <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="pl-11 h-13 bg-[#FAF9F6] border-none rounded-xl" placeholder="correo@ejemplo.com" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none rounded-3xl bg-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-2xl text-[#5D4037]">Fecha, horario y profesional</h2>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Profesional</Label>
                  <select value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)} className="w-full h-13 rounded-xl bg-[#FAF9F6] px-4 text-sm text-[#5D4037] outline-none">
                    {professionalsList.map((professional) => (
                      <option key={professional.id} value={professional.id}>{professional.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Fecha</Label>
                  <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Horario</Label>
                  <Calendar selectedDate={selectedDate} selectedTime={selectedTime} onSelectSlot={setSelectedTime} totalDuration={totalDuration} selectedProfessional={selectedProfessional} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/65">Notas adicionales opcionales</Label>
                  <textarea value={formData.notas} onChange={(e) => updateField("notas", e.target.value)} className="min-h-[110px] w-full resize-none rounded-xl border-none bg-[#FAF9F6] p-4 text-sm outline-none" placeholder="Alergias, preferencias o detalles para tu cita..." />
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-28">
            <Card className="border-none rounded-3xl bg-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-2xl text-[#5D4037]">Recomendaciones</h2>
                {recommendedServices.length === 0 ? (
                  <p className="text-sm text-[#5D4037]/60">Ya elegiste una seleccion muy completa para tu visita.</p>
                ) : (
                  <div className="space-y-3">
                    {recommendedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5D3B3]/25 p-4">
                        <div>
                          <p className="text-sm font-bold text-[#5D4037]">{service.nombre}</p>
                          <p className="text-xs text-[#8D6E63]">${Number(service.precio || 0).toFixed(2)}</p>
                        </div>
                        <Button type="button" variant="outline" className="rounded-full text-[10px] uppercase tracking-widest" onClick={() => addService({ id: service.id, name: service.nombre, price: Number(service.precio || 0), category: service.categoria, description: service.descripcion, duration: service.duracion })}>
                          Agregar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none rounded-3xl bg-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-2xl text-[#5D4037]">Forma de pago</h2>
                <div className="grid gap-3">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = paymentMethod === option.id;
                    return (
                      <button key={option.id} type="button" onClick={() => setPaymentMethod(option.id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${isSelected ? "border-[#5D4037] bg-[#E5D3B3]/20" : "border-[#E5D3B3]/30 bg-[#FAF9F6]"}`}>
                        <Icon className="w-5 h-5 text-[#8D6E63]" />
                        <span className="font-bold text-[#5D4037]">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none rounded-3xl bg-[#5D4037] text-white shadow-2xl">
              <CardContent className="p-6 md:p-8 space-y-5">
                <h2 className="font-serif text-2xl">Resumen de la reserva</h2>
                <div className="space-y-3 text-sm text-white/85">
                  <p><strong>Servicio:</strong> {selectedServices.length ? selectedServices.map((service: any) => service.name).join(", ") : "Por seleccionar"}</p>
                  <p><strong>Persona:</strong> {formData.nombre || "Por completar"}</p>
                  <p><strong>Profesional:</strong> {professionalName}</p>
                  <p><strong>Fecha:</strong> {selectedDate}</p>
                  <p><strong>Hora:</strong> {selectedTime || "Por seleccionar"}</p>
                  <p className="text-lg"><strong>Total:</strong> ${total.toFixed(2)} <span className="text-white/65">({totalDuration} min)</span></p>
                </div>
                <p className="rounded-2xl bg-white/10 p-4 text-xs leading-relaxed text-white/80">
                  Te esperamos con mucha emocion, recuerda llegar cinco minutos antes de tu cita.
                </p>
                <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-[#5D4037]">
                  <input type="checkbox" checked={confirmedAttendance} onChange={(e) => setConfirmedAttendance(e.target.checked)} className="mt-1 h-4 w-4" />
                  <span>
                    <span className="block text-sm font-bold">Confirmo que asistire a mi cita.</span>
                    <span className="mt-1 block text-xs text-[#5D4037]/65">
                      Al marcar esta casilla te comprometes a asistir en el horario seleccionado. Las cancelaciones de ultimo minuto afectan la agenda de nuestros profesionales.
                    </span>
                  </span>
                </label>
                <Button type="submit" disabled={isSubmitting || !confirmedAttendance || !selectedTime || selectedServices.length === 0 || !user} className="w-full h-14 rounded-full bg-[#E5D3B3] text-[#5D4037] hover:bg-white uppercase tracking-widest text-xs font-bold disabled:opacity-50">
                  {isSubmitting ? "Procesando..." : "Reservar cita"}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </form>
      </div>
    </motion.section>
  );
}
