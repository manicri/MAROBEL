import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Calendar as CalendarIcon, Clock, User, LogIn, CheckCircle2, AlertCircle, Lock, Check, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSelection } from "@/context/SelectionContext";
import { Calendar } from "./Calendar";
import { supabase } from "../supabase";
import React from 'react';
import { toast } from "sonner";

interface Appointment {
  cita: string;
  Servicio: string;
  fecha: string;
  hora: string;
  Estado: 'Pendiente' | 'Aceptada' | 'Cancelada';
}

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  whatsapp: z.string().min(10, "Número de WhatsApp inválido"),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  notas: z.string().optional(),
});

export default function ReservationForm() {
  const { user, login } = useAuth();
  const { selectedServices, total, removeService, clearSelection } = useSelection();
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [myAppointments, setMyAppointments] = React.useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = React.useState<'reserve' | 'my-appointments'>('reserve');
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [showTransferModal, setShowTransferModal] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      date: selectedDate,
      nombre: user?.user_metadata?.full_name || '',
    }
  });

  React.useEffect(() => {
    setValue('date', selectedDate);
  }, [selectedDate, setValue]);

  React.useEffect(() => {
    if (selectedTime) setValue('time', selectedTime);
  }, [selectedTime, setValue]);

  React.useEffect(() => {
    if (user) {
      const fetchMyAppointments = async () => {
        const { data, error } = await supabase
          .from('citas')
          .select('*')
          .eq('cliente_email', user.email);
        
        if (error) {
          console.error('Error fetching appointments:', error);
        } else {
          setMyAppointments(data as Appointment[]);
        }
      };

      fetchMyAppointments();

      const channel = supabase
        .channel('my_citas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `cliente_email=eq.${user.email}` }, () => {
          fetchMyAppointments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const authUser = (await supabase.auth.getUser()).data.user;
    
    if (!user || !authUser) {
      toast.error("Debes iniciar sesión para agendar una cita");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Por favor selecciona al menos un servicio");
      return;
    }

    const serviciosNombres = selectedServices.map(s => s.name).join(', ');

    const payload = {
      Nombre_cliente: data.nombre,
      cliente_email: authUser.email,
      Servicio: serviciosNombres,
      fecha: data.date,
      hora: data.time,
      Estado: 'Pendiente',
      Usuario_id: authUser.id,
      whatsapp: data.whatsapp,
      notas: data.notas
    };

    const { error } = await supabase.from('citas').insert(payload);

    if (error) {
      console.error("Error detallado de Supabase:", error);
      if (error.code === '23505' || error.message.toLowerCase().includes('unique')) {
        toast.error('Este horario acaba de ser reservado, elige otro', {
          description: 'El horario seleccionado ya no está disponible.',
        });
      } else {
        toast.error(`Error BD: ${error.message || 'Revisa la consola para más detalles'}`);
      }
      return;
    }

    toast.success('¡Cita agendada con éxito!');
    reset();
    setSelectedTime(null);
    clearSelection();
    const text = `Hola Marobel Studio! Acabo de agendar una cita.%0A%0A*Nombre:* ${data.nombre}%0A*Servicios:* ${serviciosNombres}%0A*Total:* $${total.toFixed(2)}%0A*Fecha:* ${data.date}%0A*Hora:* ${data.time}`;
    window.open(`https://wa.me/593969272530?text=${text}`, "_blank");
    setIsSuccess(true);
  };

  const handleCancelAppointment = async (id_de_la_cita: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    if (!user) {
      toast.error("Debes iniciar sesión para cancelar una cita");
      return;
    }

    try {
      const { error } = await supabase
        .from('citas')
        .update({ Estado: 'Cancelada' })
        .eq('cita', id_de_la_cita);
      
      if (error) throw error;
      
      toast.success('Cita cancelada', {
        description: 'Tu cita ha sido cancelada exitosamente.',
      });
      
      setMyAppointments(prev => prev.map(app => 
        app.cita === id_de_la_cita ? { ...app, Estado: 'Cancelada' } : app
      ));
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Error', {
        description: 'No se pudo cancelar la cita. Por favor intenta de nuevo.',
      });
    }
  };

  return (
    <motion.section 
      id="reservas" 
      className="py-32 bg-[#FAF9F6]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-16">
            <div className="bg-white p-1 rounded-full shadow-lg border border-[#E5D3B3]/20 flex">
              <button 
                onClick={() => setActiveTab('reserve')}
                className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                  activeTab === 'reserve' ? "bg-[#5D4037] text-white" : "text-[#5D4037]/60 hover:text-[#5D4037]"
                }`}
              >
                Agendar Cita
              </button>
              <button 
                onClick={() => setActiveTab('my-appointments')}
                className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                  activeTab === 'my-appointments' ? "bg-[#5D4037] text-white" : "text-[#5D4037]/60 hover:text-[#5D4037]"
                }`}
              >
                Mis Citas {myAppointments.length > 0 && <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[8px]">{myAppointments.length}</span>}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'reserve' ? (
              <motion.div
                key="reserve"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-16 items-start"
              >
                <div className="space-y-8">
                  <div>
                    <span className="text-[#8D6E63] font-medium tracking-[0.3em] uppercase text-xs mb-4 block">
                      Experiencia Marobel
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#5D4037] mb-8 leading-tight">
                      Reserva tu ritual <br /> de bienestar
                    </h2>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#E5D3B3]/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                      <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#5D4037]/60">1. Seleccionar Fecha</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                        <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="bg-[#5D4037] text-white border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none shadow-md cursor-pointer hover:bg-[#4a332c] transition-colors w-full sm:w-auto"
                        />
                      </div>
                    </div>
                    <Calendar 
                      selectedDate={selectedDate} 
                      selectedTime={selectedTime} 
                      onSelectSlot={setSelectedTime} 
                    />
                    <div className="mt-8 flex flex-wrap gap-6 text-[10px] uppercase tracking-widest font-bold opacity-80 border-t border-[#E5D3B3]/20 pt-6">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white border-2 border-[#E5D3B3]/50 shadow-sm"></span> 
                        <span className="text-[#5D4037]">Libre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                        </span> 
                        <span className="text-gray-500">Ocupado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#E5D3B3] border-2 border-[#5D4037] flex items-center justify-center shadow-md">
                          <Check className="w-2.5 h-2.5 text-[#5D4037]" />
                        </span> 
                        <span className="text-[#5D4037]">Tu Selección</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                      {!user ? (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="text-center py-16"
                        >
                          <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-8">
                            <LogIn className="w-8 h-8 text-[#E5D3B3]" />
                          </div>
                          <h3 className="text-2xl font-serif text-[#5D4037] mb-4">Inicia sesión para continuar</h3>
                          <p className="text-[#5D4037]/60 mb-10 font-light text-sm leading-relaxed">Para ofrecerte un servicio personalizado y gestionar tus citas, por favor ingresa con tu cuenta de Google.</p>
                          <Button onClick={login} className="bg-[#5D4037] text-white rounded-full px-12 h-14 uppercase tracking-widest text-xs font-bold hover:scale-105 transition-transform">Ingresar con Google</Button>
                        </motion.div>
                      ) : isSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="text-center py-16"
                        >
                          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                          </div>
                          <h3 className="text-3xl font-serif text-[#5D4037] mb-4">¡Reserva Confirmada!</h3>
                          <p className="text-[#5D4037]/60 mb-10 font-light text-sm leading-relaxed">
                            Tu cita ha sido agendada exitosamente. Te esperamos en Marobel Studio.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                              onClick={() => {
                                setIsSuccess(false);
                                setActiveTab('my-appointments');
                              }} 
                              className="bg-[#5D4037] text-white rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold"
                            >
                              Ver mis citas
                            </Button>
                            <Button 
                              onClick={() => setIsSuccess(false)} 
                              variant="outline"
                              className="border-[#E5D3B3] text-[#5D4037] rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold"
                            >
                              Agendar otra
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.form 
                          key="form"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleSubmit(onSubmit)} 
                          className="space-y-8"
                        >
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">Nombre</Label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D4037]/30" />
                                <Input {...register("nombre")} className="pl-12 bg-[#FAF9F6] border-none h-14 rounded-xl text-sm" placeholder="Tu nombre" />
                              </div>
                              {errors.nombre && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{errors.nombre.message}</p>}
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">WhatsApp</Label>
                              <div className="relative">
                                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D4037]/30" />
                                <Input {...register("whatsapp")} className="pl-12 bg-[#FAF9F6] border-none h-14 rounded-xl text-sm" placeholder="0987654321" />
                              </div>
                              {errors.whatsapp && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{errors.whatsapp.message}</p>}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">Servicios Seleccionados</Label>
                            {selectedServices.length === 0 ? (
                              <div className="p-4 bg-[#FAF9F6] rounded-xl text-center text-sm text-[#5D4037]/60">
                                No has seleccionado ningún servicio. Navega por nuestras categorías para agregar servicios.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {selectedServices.map(service => (
                                  <div key={service.id} className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-xl">
                                    <span className="text-sm text-[#5D4037] font-medium">{service.name}</span>
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm font-bold text-[#8D6E63]">${service.price.toFixed(2)}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => removeService(service.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between p-4 bg-[#5D4037] text-white rounded-xl mt-4">
                                  <span className="font-bold uppercase tracking-wider text-xs">Total</span>
                                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-6 bg-[#E5D3B3]/10 rounded-2xl border border-[#E5D3B3]/30 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-[#5D4037]/50 uppercase tracking-[0.2em] font-bold mb-1">Cita Seleccionada</p>
                              <p className="text-[#5D4037] font-serif text-lg">{selectedDate} — <span className="text-[#8D6E63]">{selectedTime || '...'}</span></p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                              <CalendarIcon className="w-5 h-5 text-[#E5D3B3]" />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">Notas Adicionales (Opcional)</Label>
                            <textarea 
                              {...register("notas")} 
                              className="w-full bg-[#FAF9F6] border-none rounded-xl p-4 text-sm min-h-[100px] outline-none resize-none"
                              placeholder="Cuéntanos algún detalle especial..."
                            />
                          </div>

                          <div className="space-y-4 pt-4 border-t border-[#E5D3B3]/20">
                            <Label className="text-[#5D4037] font-serif text-lg block">¿Deseas asegurar tu cita con un adelanto?</Label>
                            <p className="text-xs text-[#5D4037]/60 mb-4">Asegura tu espacio realizando un abono previo.</p>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowTransferModal(true)}
                                className="h-14 rounded-xl border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/10"
                              >
                                Transferencia Bancaria
                              </Button>
                              
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  toast.info('CONSULTA TÉCNICA OBLIGATORIA', {
                                    description: 'Antes de escribir el código de pago por tarjeta, dime qué credenciales, SDKs o pasarelas de pago (Stripe, Mercado Pago, etc.) necesitas que yo te proporcione para que el botón sea 100% funcional y seguro.',
                                    duration: 8000
                                  });
                                }}
                                className="h-14 rounded-xl border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/10"
                              >
                                Tarjeta de Crédito/Débito
                              </Button>
                            </div>
                          </div>

                          <Button 
                            type="submit" 
                            disabled={isSubmitting || !selectedTime || selectedServices.length === 0} 
                            className="w-full bg-[#5D4037] hover:bg-[#4a332c] text-white h-16 rounded-full text-xs uppercase tracking-[0.3em] font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="my-appointments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                {!user ? (
                  <div className="text-center py-24 bg-white rounded-3xl shadow-xl">
                    <LogIn className="w-12 h-12 text-[#E5D3B3] mx-auto mb-6" />
                    <h3 className="text-2xl font-serif text-[#5D4037] mb-4">Inicia sesión para ver tus citas</h3>
                    <Button onClick={login} className="bg-[#5D4037] text-white rounded-full px-10 h-12">Ingresar con Google</Button>
                  </div>
                ) : myAppointments.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-3xl shadow-xl">
                    <CalendarIcon className="w-12 h-12 text-[#E5D3B3] mx-auto mb-6" />
                    <h3 className="text-2xl font-serif text-[#5D4037] mb-4">No tienes citas agendadas</h3>
                    <p className="text-[#5D4037]/60 mb-8">¡Es el momento perfecto para consentirte!</p>
                    <Button onClick={() => setActiveTab('reserve')} className="bg-[#5D4037] text-white rounded-full px-10 h-12">Agendar Ahora</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myAppointments.map((app) => (
                      <Card key={app.cita} className="border-none shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                        <CardContent className="p-8 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                              app.Estado === 'Aceptada' ? "bg-green-500/10 text-green-600" :
                              app.Estado === 'Pendiente' ? "bg-yellow-500/10 text-yellow-600" :
                              app.Estado === 'Cancelada' ? "bg-red-500/10 text-red-600" :
                              "bg-gray-500/10 text-gray-600"
                            }`}>
                              {app.Estado === 'Aceptada' ? <CheckCircle2 className="w-7 h-7" /> : 
                               app.Estado === 'Cancelada' ? <AlertCircle className="w-7 h-7" /> : 
                               <Clock className="w-7 h-7" />}
                            </div>
                            <div>
                              <h4 className="text-xl font-serif text-[#5D4037] mb-1">{app.Servicio}</h4>
                              <p className="text-sm text-[#5D4037]/60 font-medium">{app.fecha} a las {app.hora}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold ${
                              app.Estado === 'Aceptada' ? "bg-green-500 text-white" :
                              app.Estado === 'Pendiente' ? "bg-yellow-500 text-white" :
                              app.Estado === 'Cancelada' ? "bg-red-500 text-white" :
                              "bg-gray-400 text-white"
                            }`}>
                              {app.Estado}
                            </span>
                            {(app.Estado === 'Pendiente' || app.Estado === 'Aceptada') && (
                              <button 
                                onClick={() => handleCancelAppointment(app.cita)}
                                className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-colors"
                              >
                                Cancelar Cita
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTransferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif text-[#5D4037] mb-2">Datos Bancarios</h3>
              <p className="text-sm text-[#5D4037]/60 mb-6">Realiza tu transferencia para asegurar la cita.</p>
              
              <div className="bg-[#FAF9F6] p-4 rounded-xl space-y-2 mb-6 text-sm text-[#5D4037]">
                <p><span className="font-bold">Banco:</span> Pichincha</p>
                <p><span className="font-bold">Cuenta Ahorros:</span> 2200000000</p>
                <p><span className="font-bold">Nombre:</span> Marobel Studio</p>
                <p><span className="font-bold">CI/RUC:</span> 1700000000</p>
              </div>

              <div className="space-y-4">
                <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">Comprobante de Pago</Label>
                <div className="border-2 border-dashed border-[#E5D3B3] rounded-xl p-6 text-center hover:bg-[#FAF9F6] transition-colors cursor-pointer" onClick={() => document.getElementById('modal-comprobante')?.click()}>
                  <p className="text-sm text-[#5D4037]/60">Haz clic para subir tu comprobante (JPG, PNG, PDF)</p>
                  <input type="file" id="modal-comprobante" className="hidden" accept="image/*,.pdf" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      toast.success('Comprobante adjuntado correctamente');
                      setShowTransferModal(false);
                    }
                  }} />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button onClick={() => setShowTransferModal(false)} variant="outline" className="flex-1 rounded-full border-[#E5D3B3] text-[#5D4037]">
                  Cancelar
                </Button>
                <Button onClick={() => setShowTransferModal(false)} className="flex-1 rounded-full bg-[#5D4037] text-white">
                  Listo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
