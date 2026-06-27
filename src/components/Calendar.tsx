import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarProps { selectedDate: string; onSelectSlot: (time: string | null) => void; selectedTime: string | null; isAdmin?: boolean; totalDuration?: number; selectedProfessional?: string; }
const FULL_DAY_BLOCK_TIME = '00:00';
const normalizeTime = (time: string) => { const [h, m] = time.split(':'); return `${Number(h)}:${m?.slice(0, 2) === '00' ? '00' : '30'}`; };
const isFullDayBlock = (time: string | null) => !time || time.slice(0, 5) === FULL_DAY_BLOCK_TIME;

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectSlot, selectedTime, isAdmin = false, totalDuration = 60, selectedProfessional = 'any' }) => {
  const [appointments, setAppointments] = useState<{ hora: string; Estado: string }[]>([]);
  const [blocks, setBlocks] = useState<{ id: string; hora: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const hours = useMemo(() => new Date(selectedDate).getUTCDay() === 0 ? [] : Array.from({ length: 20 }, (_, i) => { const value = 540 + i * 30; return `${Math.floor(value / 60)}:${value % 60 ? '30' : '00'}`; }), [selectedDate]);

  const fetchAvailability = React.useCallback(async () => {
    setIsLoading(true); setAvailabilityError(null);
    const [citas, bloqueos] = await Promise.all([supabase.from('citas').select('hora, Estado').eq('fecha', selectedDate), supabase.from('bloqueos').select('id, hora').eq('fecha', selectedDate)]);
    if (citas.error || bloqueos.error) { console.error(citas.error || bloqueos.error); setAvailabilityError('No se pudo confirmar la disponibilidad. Intenta nuevamente.'); setIsLoading(false); return; }
    setAppointments(citas.data ?? []); setBlocks(bloqueos.data ?? []); setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchAvailability();
    const citas = supabase.channel(`citas_${selectedDate}_${selectedProfessional}`).on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `fecha=eq.${selectedDate}` }, fetchAvailability).subscribe();
    const bloqueos = supabase.channel(`bloqueos_${selectedDate}`).on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueos', filter: `fecha=eq.${selectedDate}` }, fetchAvailability).subscribe();
    const refresh = () => fetchAvailability(); window.addEventListener('marobel-block-added', refresh);
    return () => { supabase.removeChannel(citas); supabase.removeChannel(bloqueos); window.removeEventListener('marobel-block-added', refresh); };
  }, [fetchAvailability, selectedDate, selectedProfessional]);

  const fullDayBlocks = blocks.filter((block) => isFullDayBlock(block.hora));
  const fullDay = fullDayBlocks.length > 0;
  const adminBlocks = useMemo(() => blocks.filter((block) => block.hora && !isFullDayBlock(block.hora)).map((block) => normalizeTime(block.hora!)), [blocks]);
  const appointmentSlots = useMemo(() => appointments.filter((item) => item.Estado?.toLowerCase() === 'aceptada').map((item) => normalizeTime(item.hora)), [appointments]);
  const occupied = useMemo(() => [...adminBlocks, ...appointmentSlots], [adminBlocks, appointmentSlots]);
  const available = React.useCallback((time: string) => {
    if (isLoading || availabilityError || fullDay) return false;
    const start = hours.indexOf(time); const count = Math.ceil(totalDuration / 30);
    return start >= 0 && start + count <= hours.length && Array.from({ length: count }, (_, i) => hours[start + i]).every((slot) => !occupied.includes(slot));
  }, [availabilityError, fullDay, hours, isLoading, occupied, totalDuration]);

  useEffect(() => { if (!isAdmin && selectedTime && !isLoading && !available(normalizeTime(selectedTime))) { onSelectSlot(null); toast.info('El horario seleccionado ya no esta disponible. Elige otro horario.'); } }, [available, isAdmin, isLoading, onSelectSlot, selectedTime]);
  const refresh = () => window.dispatchEvent(new CustomEvent('marobel-block-added'));
  const toggleBlock = async (time: string, blocked: boolean, booked: boolean) => {
    if (!isAdmin || booked) return;
    const result = blocked ? await supabase.from('bloqueos').delete().eq('id', blocks.find((item) => item.hora && normalizeTime(item.hora) === time)?.id) : await supabase.from('bloqueos').insert({ fecha: selectedDate, hora: time, motivo: 'Bloqueo administrativo' });
    if (result.error) return void toast.error(`Error al ${blocked ? 'desbloquear' : 'bloquear'}: ${result.error.message}`);
    toast.success(`Horario ${time} ${blocked ? 'desbloqueado' : 'bloqueado'}`); refresh();
  };
  const toggleDay = async () => {
    const result = fullDay ? await supabase.from('bloqueos').delete().in('id', fullDayBlocks.map((item) => item.id)) : await supabase.from('bloqueos').insert({ fecha: selectedDate, hora: FULL_DAY_BLOCK_TIME, motivo: 'Bloqueo administrativo de dia completo' });
    if (result.error) return void toast.error(`Error al ${fullDay ? 'desbloquear' : 'bloquear'} el dia: ${result.error.message}`);
    toast.success(fullDay ? 'Dia desbloqueado' : 'Dia completo bloqueado'); refresh();
  };

  if (isLoading) return <div className="rounded-xl border border-[#E5D3B3]/40 bg-[#FAF9F6] py-7 text-center text-xs font-bold uppercase tracking-widest text-[#5D4037]">Validando disponibilidad...</div>;
  if (availabilityError) return <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-7 text-center"><Lock className="mx-auto mb-2 h-6 w-6 text-red-400" /><p className="text-xs font-bold uppercase tracking-widest text-red-700">Disponibilidad no confirmada</p><p className="mt-2 text-xs text-red-500">{availabilityError}</p></div>;

  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
    {isAdmin && !fullDay && hours.length > 0 && <button type="button" onClick={toggleDay} className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-red-700">Bloquear dia completo</button>}
    {fullDay ? <div className="col-span-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center"><Lock className="mx-auto mb-2 h-7 w-7 text-gray-400" /><p className="text-xs font-bold uppercase tracking-widest text-[#5D4037]">Dia no disponible</p><p className="mt-1 text-xs text-gray-500">Este dia ha sido bloqueado por administracion.</p>{isAdmin && <button type="button" onClick={toggleDay} className="mt-4 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-green-700">Desbloquear dia</button>}</div> : !hours.length ? <div className="col-span-full py-6 text-center text-sm italic text-[#5D4037]/60">Cerrado los domingos. Selecciona otro dia.</div> : hours.map((time, index) => {
      const blocked = adminBlocks.includes(time); const booked = appointmentSlots.includes(time); const free = available(time); const selected = selectedTime === time; const recommended = free && !isAdmin && (index === 0 || !available(hours[index - 1]));
      return <motion.button key={time} type="button" whileHover={{ scale: !free && !isAdmin ? 1 : 1.03 }} whileTap={{ scale: !free && !isAdmin ? 1 : 0.97 }} onClick={() => isAdmin ? toggleBlock(time, blocked, booked) : free && onSelectSlot(time)} disabled={(!isAdmin && !free) || (isAdmin && booked)} className={cn('relative flex min-h-[70px] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border p-2 text-xs font-bold transition-all', booked ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-70' : blocked ? 'border-red-200 bg-red-50 text-red-600' : selected ? 'border-[#5D4037] bg-[#E5D3B3] text-[#5D4037] shadow-md ring-1 ring-[#5D4037]' : recommended ? 'border-[#8D6E63] bg-[#FAF9F6] text-[#5D4037]' : 'border-[#E5D3B3]/50 bg-white text-[#5D4037] hover:border-[#5D4037]')}>
        {recommended && !selected && <span className="absolute left-0 top-0 w-full bg-[#8D6E63] py-0.5 text-[7px] uppercase tracking-wide text-white">Recomendado</span>}<span className="flex items-center gap-1 text-[9px] uppercase opacity-60">{!free ? <Lock className="h-2.5 w-2.5" /> : selected ? <Check className="h-2.5 w-2.5" /> : isAdmin ? 'Admin' : 'Libre'}</span><span className={cn('text-sm', !free && 'line-through opacity-70')}>{time}</span><span className="text-[7px] uppercase tracking-wide">{booked ? 'Con cita' : blocked ? 'Desbloquear' : isAdmin ? 'Bloquear' : 'Disponible'}</span>
      </motion.button>;
    })}
  </div>;
};
