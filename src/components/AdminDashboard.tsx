import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './Calendar';
import { DatePicker } from './DatePicker';
import { Users, Calendar as CalendarIcon, CheckCircle2, Clock, Phone, Mail, Search, Check, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface Appointment {
  cita: string;
  Nombre_cliente: string;
  cliente_email: string;
  Servicio: string;
  fecha: string;
  hora: string;
  Estado: 'pendiente' | 'aceptada' | 'rechazada';
  whatsapp?: string;
  notas?: string;
}

interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  categoria_id?: string;
  precio: number;
  duracion: string;
  imagen_url?: string;
}

interface Category {
  id: string;
  nombre: string;
}

import { AdminPromotions } from './AdminPromotions';

export const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'promotions'>('appointments');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Category Form State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({ nombre: '' });

  // Service Form State
  const [isEditingService, setIsEditingService] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    duracion: '',
    imagen_url: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona un archivo de imagen valido');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5 MB');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Debes iniciar sesion como administrador antes de subir imagenes');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${authData.user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('servicios-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('servicios-images').getPublicUrl(filePath);
      setCurrentService(prev => ({ ...prev, imagen_url: data.publicUrl }));
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      const message = error?.message || 'Error desconocido';
      const storageError = /row-level security|policy|bucket/i.test(message);
      toast.error(storageError
        ? 'Supabase rechazo la imagen. Ejecuta supabase-storage-fix.sql.'
        : `Error al subir imagen: ${message}`);
      console.error(error);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select('*');
    
    console.log("Citas recibidas de Supabase:", data);
    
    if (error) {
      console.error('Error exacto de Supabase al cargar citas:', error);
      toast.error(`Error BD: ${error.message}`);
    } else {
      setAppointments((data as Appointment[]) || []);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('servicios')
      .select('*');
    
    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchCategories();

    const appointmentsChannel = supabase
      .channel('admin_citas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, () => {
        fetchAppointments();
      })
      .subscribe();

    const servicesChannel = supabase
      .channel('admin_servicios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'servicios' }, () => {
        fetchServices();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('admin_categorias')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const updateStatus = async (id: string, Estado: string) => {
    // Optimistic UI update
    setAppointments(prev => prev.map(app => 
      app.cita === id ? { ...app, Estado: Estado as any } : app
    ));

    const { error } = await supabase
      .from('citas')
      .update({ Estado })
      .eq('cita', id);
    
    if (error) {
      console.error('Error updating status:', error);
      toast.error(`Error al actualizar: ${error.message}`);
      // Revert on error
      fetchAppointments();
      return;
    } 

    // VERIFICATION STEP (Protocol v6.0)
    const { data: verifyData, error: verifyError } = await supabase
      .from('citas')
      .select('Estado')
      .eq('cita', id)
      .single();
      
    if (verifyError || (verifyData?.Estado !== Estado && verifyData?.Estado !== Estado.toLowerCase() && verifyData?.Estado !== Estado.charAt(0).toUpperCase() + Estado.slice(1))) {
      toast.error('Error de Persistencia: Posible bloqueo por RLS (Row Level Security). Verifica las políticas en Supabase.', { duration: 8000 });
      fetchAppointments(); // Revert UI to actual DB state
    } else {
      toast.success(`Cita ${Estado.toLowerCase()} correctamente`);
      
      // WhatsApp Automation (Protocol v9.0)
      if (Estado.toLowerCase() === 'aceptada') {
        const app = appointments.find(a => a.cita === id);
        if (app && app.whatsapp) {
          const phone = app.whatsapp.replace(/\D/g, '');
          const message = `¡Hola ${app.Nombre_cliente}! Marobel confirma tu cita. ✅ Datos de tu reserva: 🗓 Fecha: ${app.fecha} | ⏰ Hora: ${app.hora} | 📍 Lugar: Marobel Studio | 💇‍♀️ Servicios: ${app.Servicio} | 💰 Total: Por confirmar. Gracias por confiar en nosotros.`;
          const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }
      }
    }
  };

  const handleDelete = async (id_cita: string) => {
    toast('¿Estás seguro de eliminar esta cita?', {
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const { error } = await supabase
            .from('citas')
            .delete()
            .eq('cita', id_cita);

          if (error) {
            console.error('Error exacto al eliminar:', error);
            toast.error(`Error al eliminar: ${error.message}`);
          } else {
            toast.success('Cita eliminada correctamente');
            setAppointments(prev => prev.filter(app => app.cita !== id_cita));
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleSaveService = async () => {
    if (!currentService.nombre || !currentService.categoria) {
      toast.error('Nombre y categoría son obligatorios');
      return;
    }

    const { error } = await supabase
      .from('servicios')
      .upsert({
        id: currentService.id || undefined,
        nombre: currentService.nombre,
        descripcion: currentService.descripcion,
        categoria: currentService.categoria,
        precio: currentService.precio,
        duracion: currentService.duracion,
        imagen_url: currentService.imagen_url
      });

    if (error) {
      toast.error('Error al guardar el servicio');
      console.error(error);
    } else {
      toast.success(currentService.id ? 'Servicio actualizado' : 'Servicio creado');
      setIsEditingService(false);
      setCurrentService({ nombre: '', descripcion: '', categoria: '', precio: 0, duracion: '', imagen_url: '' });
      fetchServices();
    }
  };

  const handleDeleteService = async (id: string) => {
    toast('¿Estás seguro de eliminar este servicio?', {
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const { error } = await supabase
            .from('servicios')
            .delete()
            .eq('id', id);

          if (error) {
            toast.error('Error al eliminar el servicio');
          } else {
            toast.success('Servicio eliminado');
            fetchServices();
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.nombre) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    const isNew = !editingCategory.id;
    const oldName = editingCategory.id ? categories.find(c => c.id === editingCategory.id)?.nombre : null;

    const { error } = await supabase
      .from('categorias')
      .upsert({
        id: editingCategory.id || undefined,
        nombre: editingCategory.nombre
      });

    if (error) {
      toast.error('Error al guardar. ¿Creaste la tabla "categorias" en Supabase?');
      console.error(error);
    } else {
      toast.success(isNew ? 'Categoría creada' : 'Categoría actualizada');
      
      if (!isNew && oldName && oldName !== editingCategory.nombre) {
        await supabase
          .from('servicios')
          .update({ categoria: editingCategory.nombre })
          .eq('categoria', oldName);
        fetchServices();
      }

      setEditingCategory({ nombre: '' });
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string, nombre: string) => {
    toast(`¿Estás seguro de eliminar la categoría "${nombre}"?`, {
      description: 'Los servicios asociados mantendrán el nombre de la categoría pero ya no aparecerá en la lista principal.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id);

          if (error) {
            toast.error('Error al eliminar la categoría');
          } else {
            toast.success('Categoría eliminada');
            fetchCategories();
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const filteredAppointments = appointments.filter(app => {
    if (!searchTerm) return true; // Si no hay búsqueda, mostrar todas
    const matchName = app.Nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchService = app.Servicio?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName || matchService;
  });

  const todayAppointments = appointments.filter(app => app.fecha === selectedDate);

  const mostUsedServices = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(app => {
      if (app.Servicio) {
        const servs = app.Servicio.split(', ');
        servs.forEach(s => {
          counts[s] = (counts[s] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [appointments]);

  return (
    <div className="space-y-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#5D4037] mb-2">Panel Administrativo</h1>
          <p className="text-[#5D4037]/60 font-light italic">Gestión integral de Marobel</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex bg-[#E5D3B3]/10 p-1 rounded-full border border-[#E5D3B3]/20">
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === 'appointments' ? 'bg-[#5D4037] text-white shadow-md' : 'text-[#5D4037]/60 hover:text-[#5D4037]'
              }`}
            >
              Citas
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === 'services' ? 'bg-[#5D4037] text-white shadow-md' : 'text-[#5D4037]/60 hover:text-[#5D4037]'
              }`}
            >
              Servicios
            </button>
            <button 
              onClick={() => setActiveTab('promotions')}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === 'promotions' ? 'bg-[#5D4037] text-white shadow-md' : 'text-[#5D4037]/60 hover:text-[#5D4037]'
              }`}
            >
              Promos
            </button>
          </div>
          <div className="flex bg-white p-1 rounded-full shadow-md border border-[#E5D3B3]/20">
            <div className="px-6 py-2 flex items-center gap-2 border-r border-[#E5D3B3]/20">
              <Users className="w-4 h-4 text-[#E5D3B3]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]">{appointments.length} Citas</span>
            </div>
            <div className="px-6 py-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#E5D3B3]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]">{todayAppointments.length} Hoy</span>
            </div>
          </div>
        </div>
      </header>

      {mostUsedServices.length > 0 && activeTab === 'appointments' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {mostUsedServices.map(([name, count]) => (
            <div key={name} className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-[#E5D3B3]/20 flex items-center gap-4 min-w-max">
              <div className="w-10 h-10 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center">
                <span className="text-[#8D6E63] font-bold">{count}</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/40">Top Servicio</p>
                <p className="text-sm font-bold text-[#5D4037]">{name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 space-y-8">
          {activeTab === 'appointments' ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif text-[#5D4037]">Mapa de Citas</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D4037]/30" />
                  <Input 
                    placeholder="Buscar cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-none rounded-full shadow-sm text-xs"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5D3B3]/20">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-serif text-[#5D4037]">Agenda del Día</h3>
                  <span className="text-sm font-bold text-[#8D6E63]">{selectedDate}</span>
                </div>
                
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-[#5D4037]/50 italic">
                    No hay citas programadas para este día.
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E5D3B3] before:to-transparent">
                    {todayAppointments.sort((a, b) => a.hora.localeCompare(b.hora)).map((app) => (
                      <div key={app.cita} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#E5D3B3] text-[#5D4037] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-[#E5D3B3]/30 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setExpandedId(expandedId === app.cita ? null : app.cita)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#8D6E63]">{app.hora}</span>
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold ${
                              app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? "bg-red-500/10 text-red-600" :
                              (app.Estado === 'aceptada' || app.Estado === 'Aceptada') ? "bg-green-500/10 text-green-600" :
                              (app.Estado === 'pendiente' || app.Estado === 'Pendiente' || !app.Estado) ? "bg-yellow-500/10 text-yellow-600" :
                              "bg-gray-500/10 text-gray-600"
                            }`}>
                              {app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? 'Bloqueo' : app.Estado || 'Pendiente'}
                            </span>
                          </div>
                          <h4 className="font-bold text-[#5D4037] text-sm mb-1">{app.Nombre_cliente}</h4>
                          <p className="text-xs text-[#5D4037]/70 truncate">{app.Servicio}</p>
                          
                          {expandedId === app.cita && app.Nombre_cliente !== 'BLOQUEO ADMINISTRATIVO' && (
                            <div className="mt-4 pt-4 border-t border-[#E5D3B3]/20 space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-[#5D4037]/50 block mb-1">Email</span>
                                  <span className="text-[#5D4037]">{app.cliente_email || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[#5D4037]/50 block mb-1">WhatsApp</span>
                                  <span className="text-[#5D4037]">{app.whatsapp || 'N/A'}</span>
                                </div>
                              </div>
                              {app.notas && (
                                <div>
                                  <span className="text-[#5D4037]/50 block mb-1 text-xs">Notas</span>
                                  <p className="text-xs text-[#5D4037] bg-gray-50 p-2 rounded">{app.notas}</p>
                                </div>
                              )}
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  className="w-full bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase tracking-widest"
                                  onClick={(e) => { e.stopPropagation(); updateStatus(app.cita, 'aceptada'); }}
                                >
                                  Aceptar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="w-full text-[10px] uppercase tracking-widest"
                                  onClick={(e) => { e.stopPropagation(); updateStatus(app.cita, 'rechazada'); }}
                                >
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {searchTerm && (
                <div className="mt-8">
                  <h3 className="text-lg font-serif text-[#5D4037] mb-4">Resultados de búsqueda</h3>
                  <div className="grid gap-4">
                    {filteredAppointments.filter(app => app.fecha !== selectedDate).map((app) => (
                      <Card 
                        key={app.cita} 
                        className={`border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${expandedId === app.cita ? 'ring-2 ring-[#E5D3B3]' : ''}`}
                        onClick={() => setExpandedId(expandedId === app.cita ? null : app.cita)}
                      >
                        <CardContent className="p-0">
                          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? "bg-red-500/10 text-red-600" :
                                (app.Estado === 'aceptada' || app.Estado === 'Aceptada') ? "bg-green-500/10 text-green-600" :
                                (app.Estado === 'pendiente' || app.Estado === 'Pendiente' || !app.Estado) ? "bg-yellow-500/10 text-yellow-600" :
                                "bg-gray-500/10 text-gray-600"
                              }`}>
                                {app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? <Clock className="w-6 h-6" /> : 
                                 (app.Estado === 'aceptada' || app.Estado === 'Aceptada') ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-[#5D4037] text-lg">{app.Nombre_cliente}</h3>
                                <p className="text-sm text-[#5D4037]/60">{app.Servicio}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 w-full md:w-auto">
                              <div className="flex items-center gap-2 text-[#5D4037]/80 bg-[#FAF9F6] px-4 py-2 rounded-lg">
                                <CalendarIcon className="w-4 h-4 text-[#8D6E63]" />
                                <span className="text-sm font-medium">{app.fecha}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#5D4037]/80 bg-[#FAF9F6] px-4 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-[#8D6E63]" />
                                <span className="text-sm font-medium">{app.hora}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'services' ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-2xl font-serif text-[#5D4037]">Gestión de Servicios</h2>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 md:flex-none bg-white border-none rounded-full px-4 h-10 text-xs text-[#5D4037] shadow-sm outline-none cursor-pointer"
                  >
                    <option value="Todas">Todas</option>
                    {Array.from(new Set([...categories.map(c => c.nombre), ...services.map(s => s.categoria).filter(Boolean)])).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => {
                      setIsManagingCategories(!isManagingCategories);
                      setIsEditingService(false);
                    }}
                    variant="outline"
                    className={`rounded-full px-6 h-10 uppercase tracking-widest text-[10px] font-bold whitespace-nowrap ${isManagingCategories ? 'bg-[#E5D3B3] text-[#5D4037] border-transparent' : 'border-[#E5D3B3]/30 text-[#5D4037]'}`}
                  >
                    Categorías
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditingService(true);
                      setIsManagingCategories(false);
                      setCurrentService({ nombre: '', descripcion: '', categoria: '', precio: 0, duracion: '' });
                    }}
                    className="bg-[#5D4037] text-white rounded-full px-6 h-10 uppercase tracking-widest text-[10px] font-bold whitespace-nowrap"
                  >
                    Nuevo Servicio
                  </Button>
                </div>
              </div>

              {isManagingCategories && (
                <Card className="border-none shadow-lg bg-[#FAF9F6] rounded-3xl overflow-hidden mb-8">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-xl font-serif text-[#5D4037]">Administrar Categorías</h3>
                    
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">
                          {editingCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}
                        </label>
                        <Input 
                          value={editingCategory.nombre || ''}
                          onChange={(e) => setEditingCategory({...editingCategory, nombre: e.target.value})}
                          className="bg-white border-none h-12 rounded-xl"
                          placeholder="Ej: Faciales, Masajes..."
                        />
                      </div>
                      <Button onClick={handleSaveCategory} className="bg-[#5D4037] text-white rounded-xl px-8 h-12 uppercase tracking-widest text-xs font-bold">
                        {editingCategory.id ? 'Actualizar' : 'Añadir'}
                      </Button>
                      {editingCategory.id && (
                        <Button onClick={() => setEditingCategory({ nombre: '' })} variant="ghost" className="text-[#5D4037]/60 rounded-xl px-4 h-12 uppercase tracking-widest text-xs font-bold">
                          Cancelar
                        </Button>
                      )}
                    </div>

                    <div className="mt-8 space-y-3">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/40 mb-4">Categorías Existentes</h4>
                      {categories.length === 0 ? (
                        <p className="text-sm text-[#5D4037]/60 italic">No hay categorías creadas en la base de datos. (Asegúrate de crear la tabla "categorias" en Supabase).</p>
                      ) : (
                        categories.map(cat => (
                          <div key={cat.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                            <span className="font-medium text-[#5D4037]">{cat.nombre}</span>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[#5D4037]/60 hover:text-[#5D4037]"
                                onClick={() => setEditingCategory(cat)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isEditingService && (
                <Card className="border-none shadow-lg bg-[#FAF9F6] rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-xl font-serif text-[#5D4037]">{currentService.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">Nombre</label>
                        <Input 
                          value={currentService.nombre}
                          onChange={(e) => setCurrentService({...currentService, nombre: e.target.value})}
                          className="bg-white border-none h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">Categoría</label>
                        <select 
                          value={currentService.categoria}
                          onChange={(e) => setCurrentService({...currentService, categoria: e.target.value})}
                          className="w-full bg-white border-none h-12 rounded-xl px-3 text-sm text-[#5D4037] outline-none"
                        >
                          <option value="">Seleccionar categoría...</option>
                          {Array.from(new Set([...categories.map(c => c.nombre), ...services.map(s => s.categoria).filter(Boolean)])).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">Precio ($)</label>
                        <Input 
                          type="number"
                          value={currentService.precio}
                          onChange={(e) => setCurrentService({...currentService, precio: Number(e.target.value)})}
                          className="bg-white border-none h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">Duración</label>
                        <Input 
                          value={currentService.duracion}
                          onChange={(e) => setCurrentService({...currentService, duracion: e.target.value})}
                          className="bg-white border-none h-12 rounded-xl"
                          placeholder="Ej: 60 min"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">Imagen del Servicio</label>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {currentService.imagen_url && (
                            <img src={currentService.imagen_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                          )}
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                            className="bg-white border-none h-12 rounded-xl flex-1 cursor-pointer"
                          />
                          {isUploadingImage && <span className="text-xs text-[#5D4037]/60">Subiendo...</span>}
                        </div>
                        <Input
                          type="url"
                          value={currentService.imagen_url || ''}
                          onChange={(e) => setCurrentService({ ...currentService, imagen_url: e.target.value })}
                          className="bg-white border-none h-12 rounded-xl"
                          placeholder="O pega aqui la URL publica de una imagen"
                        />
                        <p className="text-[10px] text-[#5D4037]/45">
                          Formatos permitidos: JPG, PNG o WebP. Tamano maximo: 5 MB.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60">Descripción</label>
                      <textarea 
                        value={currentService.descripcion}
                        onChange={(e) => setCurrentService({...currentService, descripcion: e.target.value})}
                        className="w-full bg-white border-none rounded-xl p-4 text-sm min-h-[100px] outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button onClick={handleSaveService} className="bg-[#5D4037] text-white rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold">Guardar</Button>
                      <Button onClick={() => setIsEditingService(false)} variant="ghost" className="text-[#5D4037]/60 rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold">Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isManagingCategories && (
                <div className="grid gap-4">
                  {(selectedCategory === 'Todas' ? services : services.filter(s => s.categoria === selectedCategory)).map((service) => (
                    <Card key={service.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-serif text-[#5D4037]">{service.nombre}</h3>
                            <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 bg-[#E5D3B3]/20 text-[#8D6E63] rounded-full">{service.categoria}</span>
                          </div>
                          <p className="text-xs text-[#5D4037]/60 line-clamp-1 mb-2">{service.descripcion}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-[#8D6E63] uppercase tracking-widest">
                            <span>{service.duracion}</span>
                            <span>${service.precio}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#5D4037]/60 hover:text-[#5D4037]"
                            onClick={() => {
                              setCurrentService(service);
                              setIsEditingService(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'promotions' ? (
            <AdminPromotions services={services} />
          ) : null}
        </section>

        <aside className="space-y-8">
          <h2 className="text-2xl font-serif text-[#5D4037]">Disponibilidad</h2>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#E5D3B3]/10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#5D4037]/40 mb-3 block">Seleccionar Día</label>
                <DatePicker 
                  selectedDate={selectedDate} 
                  onSelectDate={setSelectedDate} 
                />
              </div>
            </div>

            <div className="mt-8">
              <Calendar 
                selectedDate={selectedDate} 
                onSelectSlot={() => {}} 
                selectedTime={null} 
                isAdmin 
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
