import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './Calendar';
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
  precio: number;
  duracion: string;
}

interface Category {
  id: string;
  nombre: string;
}

export const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockTime, setBlockTime] = useState('09:00');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Category Form State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({ nombre: '' });

  // Service Form State
  const [isEditingService, setIsEditingService] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    duracion: ''
  });

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

  const handleBlockTime = async () => {
    const payload = {
      Nombre_cliente: 'BLOQUEO ADMINISTRATIVO',
      cliente_email: 'admin@marobel.studio',
      Servicio: 'BLOQUEO DE HORARIO',
      fecha: selectedDate,
      hora: blockTime,
      Estado: 'aceptada',
      notas: 'Horario bloqueado por administración'
    };

    const { error } = await supabase.from('citas').insert(payload);
    
    if (error) {
      toast.error('Error al bloquear horario');
    } else {
      toast.success('Horario bloqueado');
      fetchAppointments();
    }
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
        duracion: currentService.duracion
      });

    if (error) {
      toast.error('Error al guardar el servicio');
      console.error(error);
    } else {
      toast.success(currentService.id ? 'Servicio actualizado' : 'Servicio creado');
      setIsEditingService(false);
      setCurrentService({ nombre: '', descripcion: '', categoria: '', precio: 0, duracion: '' });
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

              <div className="grid gap-4">
                {filteredAppointments.map((app) => (
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
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-serif text-[#5D4037]">
                                {app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? 'HORARIO BLOQUEADO' : app.Servicio}
                              </h3>
                              <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                                app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? "bg-red-500/20 text-red-700" : "bg-[#E5D3B3]/20 text-[#8D6E63]"
                              }`}>
                                {app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? 'BLOQUEO' : (app.Estado || 'pendiente')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#5D4037]/60">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> 
                                {app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? 'Administración' : app.Nombre_cliente}
                              </span>
                              {app.Nombre_cliente !== 'BLOQUEO ADMINISTRATIVO' && (
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.cliente_email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#E5D3B3]/10">
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#5D4037] uppercase tracking-tighter">{app.fecha}</p>
                            <p className="text-lg font-serif text-[#8D6E63]">{app.hora}</p>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {(app.Estado === 'pendiente' || app.Estado === 'Pendiente' || !app.Estado) && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                                  onClick={() => updateStatus(app.cita, 'aceptada')}
                                >
                                  <Check className="w-3 h-3" />
                                  Aceptar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="rounded-full px-4 text-[10px] uppercase tracking-widest font-bold border-[#E5D3B3]/30 text-[#5D4037]/60"
                                  onClick={() => updateStatus(app.cita, 'rechazada')}
                                >
                                  Rechazar
                                </Button>
                              </>
                            )}
                            {(app.Estado === 'aceptada' || app.Estado === 'Aceptada') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="rounded-full px-4 text-[10px] uppercase tracking-widest font-bold border-[#E5D3B3]/30 text-[#5D4037]/60"
                                onClick={() => updateStatus(app.cita, 'rechazada')}
                              >
                                Rechazar
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full px-3"
                              onClick={() => handleDelete(app.cita)}
                              title="Eliminar cita"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {expandedId === app.cita && (
                        <div className="px-6 pb-6 pt-2 border-t border-[#E5D3B3]/10 bg-[#FAF9F6]/50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                  <Phone className="w-4 h-4 text-[#E5D3B3]" />
                                </div>
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest font-bold text-[#5D4037]/40">WhatsApp / Teléfono</p>
                                  <a 
                                    href={`https://wa.me/${app.whatsapp?.replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-sm font-medium text-[#5D4037] hover:text-[#8D6E63] transition-colors"
                                  >
                                    {app.whatsapp || 'No proporcionado'}
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mt-1">
                                  <Search className="w-4 h-4 text-[#E5D3B3]" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[8px] uppercase tracking-widest font-bold text-[#5D4037]/40">Notas del Cliente</p>
                                  <p className="text-sm text-[#5D4037]/70 italic leading-relaxed">
                                    {app.notas || 'Sin notas adicionales.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
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
          )}
        </section>

        <aside className="space-y-8">
          <h2 className="text-2xl font-serif text-[#5D4037]">Disponibilidad</h2>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#E5D3B3]/10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#5D4037]/40 mb-3 block">Seleccionar Día</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#FAF9F6] border-none rounded-xl p-4 text-sm font-bold text-[#5D4037] outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#E5D3B3]/10">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#5D4037]/40 mb-3 block">Bloquear Horario</label>
                <div className="flex gap-2">
                  <select 
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    className="flex-1 bg-[#FAF9F6] border-none rounded-xl p-3 text-sm font-bold text-[#5D4037] outline-none appearance-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => `${i + 9}:00`).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={handleBlockTime}
                    className="bg-[#5D4037] text-white rounded-xl px-4 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Bloquear
                  </Button>
                </div>
                <p className="text-[9px] text-[#5D4037]/40 mt-2 italic font-light">
                  * Esto marcará el horario como ocupado para los clientes.
                </p>
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
