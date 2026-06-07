import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './Calendar';
import { DatePicker } from './DatePicker';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Image as ImageIcon, Search, Trash2, Users } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { AdminPromotions } from './AdminPromotions';

interface Appointment { cita: string; Nombre_cliente: string; cliente_email: string; Servicio: string; fecha: string; hora: string; Estado: 'pendiente' | 'aceptada' | 'rechazada'; whatsapp?: string; notas?: string; }
interface Service { id: string; nombre: string; descripcion: string; categoria: string; categoria_id?: string; precio: number; duracion: string; imagen_url?: string; }
interface Category { id: string; nombre: string; }
type Tab = 'appointments' | 'services' | 'promotions';
type DatePreset = 'all' | 'today' | 'week' | 'month' | 'lastMonth' | 'custom';

const todayKey = () => new Date().toISOString().split('T')[0];
const formatKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const rangeForPreset = (preset: DatePreset, customStart: string, customEnd: string) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (preset === 'all') return { start: '', end: '' };
  if (preset === 'today') return { start: todayKey(), end: todayKey() };
  if (preset === 'week') { start.setDate(now.getDate() - now.getDay() + 1); end.setDate(start.getDate() + 6); return { start: formatKey(start), end: formatKey(end) }; }
  if (preset === 'month') { start.setDate(1); end.setMonth(now.getMonth() + 1, 0); return { start: formatKey(start), end: formatKey(end) }; }
  if (preset === 'lastMonth') { start.setMonth(now.getMonth() - 1, 1); end.setMonth(now.getMonth(), 0); return { start: formatKey(start), end: formatKey(end) }; }
  return { start: customStart, end: customEnd || customStart };
};

export const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customStart, setCustomStart] = useState(todayKey());
  const [customEnd, setCustomEnd] = useState(todayKey());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({ nombre: '' });
  const [isEditingService, setIsEditingService] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({ nombre: '', descripcion: '', categoria: '', precio: 0, duracion: '', imagen_url: '' });

  const fetchAppointments = async () => { const { data, error } = await supabase.from('citas').select('*'); error ? toast.error(`Error BD: ${error.message}`) : setAppointments((data as Appointment[]) || []); };
  const fetchServices = async () => { const { data, error } = await supabase.from('servicios').select('*').order('categoria').order('nombre'); if (!error) setServices(data || []); };
  const fetchCategories = async () => { const { data, error } = await supabase.from('categorias').select('*').order('nombre'); if (!error) setCategories(data || []); };

  useEffect(() => {
    fetchAppointments(); fetchServices(); fetchCategories();
    const citas = supabase.channel('admin_citas').on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, fetchAppointments).subscribe();
    const servicios = supabase.channel('admin_servicios').on('postgres_changes', { event: '*', schema: 'public', table: 'servicios' }, fetchServices).subscribe();
    const categorias = supabase.channel('admin_categorias').on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, fetchCategories).subscribe();
    return () => { supabase.removeChannel(citas); supabase.removeChannel(servicios); supabase.removeChannel(categorias); };
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecciona una imagen valida'); event.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no puede superar los 5 MB'); event.target.value = ''; return; }
    setIsUploadingImage(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Debes iniciar sesion como administrador antes de subir imagenes');
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${authData.user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from('servicios-images').upload(filePath, file, { cacheControl: '3600', contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('servicios-images').getPublicUrl(filePath);
      setCurrentService((prev) => ({ ...prev, imagen_url: data.publicUrl }));
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      const message = error?.message || 'Error desconocido';
      toast.error(/row-level security|policy|bucket/i.test(message) ? 'Supabase rechazo la imagen. Revisa el bucket servicios-images y sus politicas.' : `Error al subir imagen: ${message}`);
      console.error(error);
    } finally { setIsUploadingImage(false); event.target.value = ''; }
  };

  const updateStatus = async (id: string, Estado: Appointment['Estado']) => {
    setAppointments((prev) => prev.map((app) => app.cita === id ? { ...app, Estado } : app));
    const { error } = await supabase.from('citas').update({ Estado }).eq('cita', id);
    if (error) { toast.error(`Error al actualizar: ${error.message}`); fetchAppointments(); return; }
    toast.success(`Cita ${Estado} correctamente`);
    const app = appointments.find((item) => item.cita === id);
    if (Estado === 'aceptada' && app?.whatsapp) window.open(`https://wa.me/${app.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${app.Nombre_cliente}, Marobel confirma tu cita para ${app.fecha} a las ${app.hora}. Servicios: ${app.Servicio}.`)}`, '_blank');
  };

  const handleDelete = async (id: string) => toast('¿Eliminar esta cita?', { action: { label: 'Eliminar', onClick: async () => { const { error } = await supabase.from('citas').delete().eq('cita', id); error ? toast.error(`Error al eliminar: ${error.message}`) : (toast.success('Cita eliminada'), setAppointments((prev) => prev.filter((app) => app.cita !== id))); } }, cancel: { label: 'Cancelar', onClick: () => {} } });

  const handleSaveService = async () => {
    if (!currentService.nombre?.trim() || !currentService.categoria?.trim()) { toast.error('Nombre y categoria son obligatorios'); return; }
    if (Number(currentService.precio || 0) < 0) { toast.error('El precio no puede ser negativo'); return; }
    const payload = { id: currentService.id || undefined, nombre: currentService.nombre.trim(), descripcion: currentService.descripcion || '', categoria: currentService.categoria, precio: Number(currentService.precio || 0), duracion: currentService.duracion || '', imagen_url: currentService.imagen_url || null };
    const { error } = await supabase.from('servicios').upsert(payload);
    if (error) { toast.error(`Error al guardar servicio: ${error.message}`); console.error(error); return; }
    toast.success(currentService.id ? 'Servicio actualizado' : 'Servicio creado');
    setIsEditingService(false); setCurrentService({ nombre: '', descripcion: '', categoria: '', precio: 0, duracion: '', imagen_url: '' }); fetchServices();
  };

  const handleDeleteService = async (id: string) => toast('¿Eliminar este servicio?', { action: { label: 'Eliminar', onClick: async () => { const { error } = await supabase.from('servicios').delete().eq('id', id); error ? toast.error(`Error al eliminar: ${error.message}`) : (toast.success('Servicio eliminado'), fetchServices()); } }, cancel: { label: 'Cancelar', onClick: () => {} } });

  const handleSaveCategory = async () => {
    if (!editingCategory.nombre?.trim()) { toast.error('El nombre de la categoria es obligatorio'); return; }
    const oldName = editingCategory.id ? categories.find((cat) => cat.id === editingCategory.id)?.nombre : null;
    const { error } = await supabase.from('categorias').upsert({ id: editingCategory.id || undefined, nombre: editingCategory.nombre.trim() });
    if (error) { toast.error(`Error al guardar categoria: ${error.message}`); return; }
    if (oldName && oldName !== editingCategory.nombre) await supabase.from('servicios').update({ categoria: editingCategory.nombre }).eq('categoria', oldName);
    toast.success(editingCategory.id ? 'Categoria actualizada' : 'Categoria creada'); setEditingCategory({ nombre: '' }); fetchCategories(); fetchServices();
  };

  const handleDeleteCategory = async (id: string, nombre: string) => toast(`¿Eliminar la categoria ${nombre}?`, { description: 'Los servicios conservaran el nombre de la categoria.', action: { label: 'Eliminar', onClick: async () => { const { error } = await supabase.from('categorias').delete().eq('id', id); error ? toast.error(`Error al eliminar: ${error.message}`) : (toast.success('Categoria eliminada'), fetchCategories()); } }, cancel: { label: 'Cancelar', onClick: () => {} } });

  const range = useMemo(() => rangeForPreset(datePreset, customStart, customEnd), [datePreset, customStart, customEnd]);
  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return appointments.filter((app) => {
      const text = `${app.Nombre_cliente || ''} ${app.Servicio || ''} ${app.whatsapp || ''} ${app.cliente_email || ''}`.toLowerCase();
      const matchesText = !term || text.includes(term);
      const matchesDate = !range.start || (app.fecha >= range.start && app.fecha <= range.end);
      return matchesText && matchesDate;
    }).sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
  }, [appointments, range, searchTerm]);
  const todayAppointments = appointments.filter((app) => app.fecha === selectedDate).sort((a, b) => a.hora.localeCompare(b.hora));
  const listedServices = selectedCategory === 'Todas' ? services : services.filter((service) => service.categoria === selectedCategory);
  const categoryOptions = Array.from(new Set([...categories.map((cat) => cat.nombre), ...services.map((service) => service.categoria).filter(Boolean)]));
  const mostUsedServices = useMemo(() => Object.entries(appointments.reduce((acc, app) => { app.Servicio?.split(', ').forEach((name) => { acc[name] = (acc[name] || 0) + 1; }); return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 3), [appointments]);

  const AppointmentCard = ({ app, compact = false }: { app: Appointment; compact?: boolean }) => {
    const status = app.Nombre_cliente === 'BLOQUEO ADMINISTRATIVO' ? 'Bloqueo' : app.Estado || 'pendiente';
    const color = status === 'Bloqueo' ? 'bg-red-50 text-red-600' : status === 'aceptada' ? 'bg-green-50 text-green-700' : status === 'rechazada' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-50 text-yellow-700';
    return <Card className={`border-none bg-white shadow-sm transition hover:shadow-md ${expandedId === app.cita ? 'ring-2 ring-[#E5D3B3]' : ''}`} onClick={() => setExpandedId(expandedId === app.cita ? null : app.cita)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4"><div><span className={`mb-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${color}`}>{status}</span><h3 className="font-serif text-lg text-[#5D4037]">{app.Nombre_cliente}</h3><p className="text-xs text-[#5D4037]/60">{app.Servicio}</p></div><div className="text-right text-xs font-bold text-[#8D6E63]"><p>{app.fecha}</p><p>{app.hora}</p></div></div>
        {expandedId === app.cita && app.Nombre_cliente !== 'BLOQUEO ADMINISTRATIVO' && <div className="mt-4 space-y-3 border-t border-[#E5D3B3]/20 pt-4 text-xs text-[#5D4037]/70"><p><strong>Email:</strong> {app.cliente_email || 'N/A'}</p><p><strong>WhatsApp:</strong> {app.whatsapp || 'N/A'}</p>{app.notas && <p className="rounded-xl bg-[#FAF9F6] p-3"><strong>Notas:</strong> {app.notas}</p>}<div className="flex flex-wrap gap-2 pt-1"><Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={(e) => { e.stopPropagation(); updateStatus(app.cita, 'aceptada'); }}>Aceptar</Button><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateStatus(app.cita, 'rechazada'); }}>Rechazar</Button><Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(app.cita); }}><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button></div></div>}
      </CardContent>
    </Card>;
  };

  return <div className="space-y-10">
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><h1 className="mb-2 font-serif text-4xl text-[#5D4037]">Panel Administrativo</h1><p className="text-[#5D4037]/60">Gestion integral de citas, servicios y promociones.</p></div><div className="flex flex-wrap gap-3"><div className="flex rounded-full border border-[#E5D3B3]/20 bg-[#E5D3B3]/10 p-1">{(['appointments','services','promotions'] as Tab[]).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-widest ${activeTab === tab ? 'bg-[#5D4037] text-white' : 'text-[#5D4037]/60'}`}>{tab === 'appointments' ? 'Citas' : tab === 'services' ? 'Servicios' : 'Promos'}</button>)}</div><div className="flex rounded-full bg-white p-1 shadow-sm"><span className="flex items-center gap-2 px-4 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]"><Users className="h-4 w-4 text-[#8D6E63]" />{appointments.length} Citas</span><span className="flex items-center gap-2 border-l border-[#E5D3B3]/20 px-4 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]"><CalendarIcon className="h-4 w-4 text-[#8D6E63]" />{todayAppointments.length} Dia</span></div></div></header>
    {mostUsedServices.length > 0 && activeTab === 'appointments' && <div className="flex gap-3 overflow-x-auto pb-2">{mostUsedServices.map(([name, count]) => <div key={name} className="min-w-max rounded-2xl border border-[#E5D3B3]/20 bg-white px-5 py-3 shadow-sm"><p className="text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/40">Top servicio</p><p className="text-sm font-bold text-[#5D4037]">{name} <span className="text-[#8D6E63]">({count})</span></p></div>)}</div>}
    <div className="grid gap-8 lg:grid-cols-3"><section className="space-y-8 lg:col-span-2">
      {activeTab === 'appointments' && <><div className="rounded-3xl border border-[#E5D3B3]/20 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h2 className="font-serif text-2xl text-[#5D4037]">Mapa de Citas</h2><div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D4037]/30" /><Input placeholder="Buscar cliente, servicio o telefono" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-full border-none bg-[#FAF9F6] pl-10 text-xs" /></div></div><div className="flex flex-wrap gap-2">{[{id:'today',label:'Hoy'},{id:'week',label:'Esta semana'},{id:'month',label:'Este mes'},{id:'lastMonth',label:'Mes pasado'},{id:'all',label:'Todo'}].map((item) => <button key={item.id} type="button" onClick={() => setDatePreset(item.id as DatePreset)} className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-widest ${datePreset === item.id ? 'bg-[#5D4037] text-white' : 'border border-[#E5D3B3] text-[#5D4037]'}`}>{item.label}</button>)}<button type="button" onClick={() => setDatePreset('custom')} className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-widest ${datePreset === 'custom' ? 'bg-[#5D4037] text-white' : 'border border-[#E5D3B3] text-[#5D4037]'}`}>Rango</button></div>{datePreset === 'custom' && <div className="mt-4 grid gap-3 sm:grid-cols-2"><Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded-xl border-none bg-[#FAF9F6]" /><Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded-xl border-none bg-[#FAF9F6]" /></div>}</div><Card className="border-none bg-white shadow-sm"><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-serif text-xl text-[#5D4037]">Agenda del dia</h3><span className="text-xs font-bold text-[#8D6E63]">{selectedDate}</span></div>{todayAppointments.length ? <div className="grid gap-3">{todayAppointments.map((app) => <AppointmentCard key={app.cita} app={app} compact />)}</div> : <p className="rounded-2xl bg-[#FAF9F6] py-10 text-center text-sm italic text-[#5D4037]/50">No hay citas programadas para este dia.</p>}</CardContent></Card><div><h3 className="mb-4 font-serif text-xl text-[#5D4037]">Historial filtrado <span className="text-sm font-sans text-[#8D6E63]">({filteredAppointments.length})</span></h3><div className="grid gap-3">{filteredAppointments.map((app) => <AppointmentCard key={app.cita} app={app} />)}</div></div></>}
      {activeTab === 'services' && <div className="space-y-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><h2 className="font-serif text-2xl text-[#5D4037]">Gestion de Servicios</h2><div className="flex flex-wrap gap-3"><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-10 rounded-full border-none bg-white px-4 text-xs text-[#5D4037] shadow-sm outline-none"><option value="Todas">Todas</option>{categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select><Button variant="outline" onClick={() => { setIsManagingCategories(!isManagingCategories); setIsEditingService(false); }} className="rounded-full border-[#E5D3B3]/40 text-[#5D4037]">Categorias</Button><Button onClick={() => { setIsEditingService(true); setIsManagingCategories(false); setCurrentService({ nombre: '', descripcion: '', categoria: '', precio: 0, duracion: '', imagen_url: '' }); }} className="rounded-full bg-[#5D4037] text-white">Nuevo Servicio</Button></div></div>{isManagingCategories && <Card className="border-none bg-[#FAF9F6] shadow-sm"><CardContent className="space-y-5 p-5"><h3 className="font-serif text-xl text-[#5D4037]">Categorias</h3><div className="flex flex-col gap-3 sm:flex-row"><Input value={editingCategory.nombre || ''} onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })} placeholder="Nueva categoria" className="border-none bg-white" /><Button onClick={handleSaveCategory} className="bg-[#5D4037] text-white">{editingCategory.id ? 'Actualizar' : 'Añadir'}</Button></div><div className="grid gap-2">{categories.map((cat) => <div key={cat.id} className="flex items-center justify-between rounded-xl bg-white p-3"><span className="text-sm font-bold text-[#5D4037]">{cat.nombre}</span><div><Button variant="ghost" size="sm" onClick={() => setEditingCategory(cat)}>Editar</Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCategory(cat.id, cat.nombre)}>Eliminar</Button></div></div>)}</div></CardContent></Card>}{isEditingService && <Card className="border-none bg-[#FAF9F6] shadow-sm"><CardContent className="space-y-5 p-5"><h3 className="font-serif text-xl text-[#5D4037]">{currentService.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h3><div className="grid gap-4 md:grid-cols-[160px_1fr]"><div className="flex min-h-40 items-center justify-center overflow-hidden rounded-2xl bg-white">{currentService.imagen_url ? <img src={currentService.imagen_url} alt="Vista previa" className="h-full w-full object-cover" /> : <div className="text-center text-[#5D4037]/35"><ImageIcon className="mx-auto mb-2 h-8 w-8" /><p className="text-xs">Vista previa</p></div>}</div><div className="grid gap-4 md:grid-cols-2"><Input value={currentService.nombre || ''} onChange={(e) => setCurrentService({ ...currentService, nombre: e.target.value })} placeholder="Nombre" className="border-none bg-white" /><select value={currentService.categoria || ''} onChange={(e) => setCurrentService({ ...currentService, categoria: e.target.value })} className="h-10 rounded-xl border-none bg-white px-3 text-sm text-[#5D4037] outline-none"><option value="">Categoria</option>{categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select><Input type="number" value={currentService.precio || 0} onChange={(e) => setCurrentService({ ...currentService, precio: Number(e.target.value) })} placeholder="Precio" className="border-none bg-white" /><Input value={currentService.duracion || ''} onChange={(e) => setCurrentService({ ...currentService, duracion: e.target.value })} placeholder="Duracion, ej: 60 min" className="border-none bg-white" /><Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="border-none bg-white md:col-span-2" /><Input type="url" value={currentService.imagen_url || ''} onChange={(e) => setCurrentService({ ...currentService, imagen_url: e.target.value })} placeholder="URL publica de imagen" className="border-none bg-white md:col-span-2" /></div></div><textarea value={currentService.descripcion || ''} onChange={(e) => setCurrentService({ ...currentService, descripcion: e.target.value })} placeholder="Descripcion" className="min-h-[100px] w-full resize-none rounded-xl border-none bg-white p-4 text-sm outline-none" /><p className="text-xs text-[#5D4037]/55">JPG, PNG o WebP hasta 5 MB. Si Supabase rechaza la subida, revisa el bucket <strong>servicios-images</strong> y sus politicas.</p><div className="flex gap-3"><Button onClick={handleSaveService} className="rounded-full bg-[#5D4037] text-white">Guardar</Button><Button variant="ghost" onClick={() => setIsEditingService(false)} className="rounded-full text-[#5D4037]/60">Cancelar</Button></div></CardContent></Card>}<div className="grid gap-3">{listedServices.map((service) => <Card key={service.id} className="border-none bg-white shadow-sm"><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><div className="h-20 w-20 overflow-hidden rounded-xl bg-[#FAF9F6]">{service.imagen_url ? <img src={service.imagen_url} alt={service.nombre} className="h-full w-full object-cover" /> : null}</div><div className="flex-1"><h3 className="font-serif text-lg text-[#5D4037]">{service.nombre}</h3><p className="line-clamp-1 text-xs text-[#5D4037]/60">{service.descripcion}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8D6E63]">{service.categoria} · {service.duracion} · ${service.precio}</p></div><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setCurrentService(service); setIsEditingService(true); }}>Editar</Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteService(service.id)}>Eliminar</Button></div></CardContent></Card>)}</div></div>}
      {activeTab === 'promotions' && <AdminPromotions services={services} />}
    </section><aside className="space-y-6"><h2 className="font-serif text-2xl text-[#5D4037]">Disponibilidad</h2><div className="rounded-3xl border border-[#E5D3B3]/10 bg-white p-5 shadow-xl"><label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#5D4037]/40">Seleccionar Dia</label><DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} isAdmin /><div className="mt-6"><Calendar selectedDate={selectedDate} onSelectSlot={() => {}} selectedTime={null} isAdmin /></div></div></aside></div>
  </div>;
};
