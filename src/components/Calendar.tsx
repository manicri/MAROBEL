import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarProps {
  selectedDate: string;
  onSelectSlot: (time: string | null) => void;
  selectedTime: string | null;
  isAdmin?: boolean;
  totalDuration?: number;
  selectedProfessional?: string;
}

const normalizeTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  return `${Number(hours)}:${minutes?.slice(0, 2) === '00' ? '00' : '30'}`;
};

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectSlot, selectedTime, isAdmin = false, totalDuration = 60, selectedProfessional = 'any' }) => {
  const [appointments, setAppointments] = useState<{ hora: string; Estado: string }[]>([]);
  const [blocks, setBlocks] = useState<{ id: string; hora: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const hours = useMemo(() => {
    const date = new Date(selectedDate);
    if (date.getUTCDay() === 0) return [];
    return Array.from({ length: 20 }, (_, index) => {
      const totalMinutes = 9 * 60 + index * 30;
      return `${Math.floor(totalMinutes / 60)}:${totalMinutes % 60 === 0 ? '00' : '30'}`;
    });
  }, [selectedDate]);

  const fetchAvailability = React.useCallback(async () => {
    setIsLoading(true);
    setAvailabilityError(null);
    const [appointmentsResult, blocksResult] = await Promise.all([
      supabase.from('citas').select('hora, Estado').eq('fecha', selectedDate),
      supabase.from('bloqueos').select('id, hora').eq('fecha', selectedDate),
    ]);

    if (appointmentsResult.error || blocksResult.error) {
      console.error(appointmentsResult.error || blocksResult.error);
      setAvailabilityError('No se pudo confirmar la disponibilidad. Intenta nuevamente.');
      setIsLoading(false);
      return;
    }

    setAppointments(appointmentsResult.data ?? []);
    setBlocks(blocksResult.data ?? []);
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchAvailability();
    const appointmentsChannel = supabase.channel(`citas_${selectedDate}_${selectedProfessional}`).on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `fecha=eq.${selectedDate}` }, fetchAvailability).subscribe();
    const blocksChannel = supabase.channel(`bloqueos_${selectedDate}`).on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueos', filter: `fecha=eq.${selectedDate}` }, fetchAvailability).subscribe();
    const refresh = () => fetchAvailability();
    window.addEventListener('marobel-block-added', refresh);
    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(blocksChannel);
      window.removeEventListener('marobel-block-added', refresh);
    };
  }, [fetchAvailability, selectedDate, selectedProfessional]);

  const fullDayBlocks = blocks.filter((block) => block.hora === null);
  const isFullDayBlocked = fullDayBlocks.length > 0;
  const adminBlockedSlots = useMemo(() => blocks.filter((block) => block.hora !== null).map((block) => normalizeTime(block.hora!)), [blocks]);
  const appointmentSlots = useMemo(() => appointments.filter((appointment) => appointment.Estado?.toLowerCase() === 'aceptada').map((appointment) => normalizeTime(appointment.hora)), [appointments]);
  const occupiedSlots = useMemo(() => [...adminBlockedSlots, ...appointmentSlots], [adminBlockedSlots, appointmentSlots]);

  const isSlotAvailable = React.useCallback((time: string) => {
    if (isLoading || availabilityError || isFullDayBlocked) return false;
    const startIndex = hours.indexOf(time);
    const slotsNeeded = Math.ceil(totalDuration / 30);
    if (startIndex < 0 || startIndex + slotsNeeded > hours.length) return false;
    return Array.from({ length: slotsNeeded }, (_, index) => hours[startIndex + index]).every((slot) => !occupiedSlots.includes(slot));
  }, [availabilityError, hours, isFullDayBlocked, isLoading, occupiedSlots, totalDuration]);

  useEffect(() => {
    if (isAdmin || !selectedTime || isLoading) return;
    if (!isSlotAvailable(normalizeTime(selectedTime))) {
      onSelectSlot(null);
      toast.info('El horario seleccionado ya no esta disponible. Elige otro horario.');
    }
  }, [isAdmin, isLoading, isSlotAvailable, onSelectSlot, selectedTime]);

  const refreshAll = () => window.dispatchEvent(new CustomEvent('marobel-block-added'));

  const toggleBlock = async (time: string, isBlocked: boolean, hasAppointment: boolean) => {
    if (!isAdmin || hasAppointment) return;
    if (isBlocked) {
      const block = blocks.find((item) => item.hora && normalizeTime(item.hora) === time);
      if (!block) return;
      const { error } = await supabase.from('bloqueos').delete().eq('id', block.id);
      if (error) return toast.error(`Error al desbloquear: ${error.message}`);
      toast.success(`Horario ${time} desbloqueado`);
    } else {
      const { error } = await supabase.from('bloqueos').insert({ fecha: selectedDate, hora: time, motivo: 'Bloqueo administrativo' });
      if (error) return toast.error(`Error al bloquear: ${error.message}`);
      toast.success(`Horario ${time} bloqueado`);
    }
    refreshAll();
  };

  const blockDay = async () => {
    const { error } = await supabase.from('bloqueos').insert({ fecha: selectedDate, hora: null, motivo: 'Bloqueo administrativo de dia completo' });
    if (error) return toast.error(`Error al bloquear el dia: ${error.message}`);
    toast.success('Dia completo bloqueado');
    refreshAll();
  };

  const unblockDay = async () => {
    const ids = fullDayBlocks.map((block) => block.id);
    if (!ids.length) return;
    const { error } = await supabase.from('bloqueos').delete().in('id', ids);
    if (error) return toast.error(`Error al desbloquear el dia: ${error.message}`);
    toast.success('Dia desbloqueado');
    refreshAll();
  };

  if (isLoading) return <div className="py-10 text-center bg-[#FAF9F6] rounded-2xl border border-[#E5D3B3]/40"><p className="text-[#5D4037] font-bold uppercase tracking-widest text-sm">Validando disponibilidad...</p></div>;
  if (availabilityError) return <div className="py-10 text-center bg-red-50 rounded-2xl border border-red-100 px-4"><Lock className="w-7 h-7 text-red-400 mx-auto mb-3" /><p className="text-red-700 font-bold uppercase tracking-widest text-sm">Disponibilidad no confirmada</p><p className="text-red-500 text-xs mt-2">{availabilityError}</p></div>;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {isAdmin && !isFullDayBlocked && hours.length > 0 && <button type="button" onClick={blockDay} className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-700 hover:bg-red-100">Bloquear dia completo</button>}
      {isFullDayBlocked ? (
        <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 px-4">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-[#5D4037] font-bold uppercase tracking-widest text-sm">Dia no disponible</p>
          <p className="text-gray-500 text-xs mt-1">Este dia ha sido bloqueado por administracion.</p>
          {isAdmin && <button type="button" onClick={unblockDay} className="mt-5 rounded-xl border border-green-200 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-green-700 hover:bg-green-50">Desbloquear dia</button>}
        </div>
      ) : hours.length === 0 ? (
        <div className="col-span-full py-8 text-center text-[#5D4037]/60 font-medium italic">Cerrado los domingos. Selecciona otro dia.</div>
      ) : hours.every((time) => !isSlotAvailable(time)) && !isAdmin ? (
        <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-200"><p className="text-[#5D4037] font-bold uppercase tracking-widest text-sm mb-2">Dia sin disponibilidad</p><p className="text-gray-500 text-xs">No hay horarios disponibles para la duracion seleccionada.</p></div>
      ) : hours.map((time, index) => {
        const blockedByAdmin = adminBlockedSlots.includes(time);
        const bookedByAppointment = appointmentSlots.includes(time);
        const available = isSlotAvailable(time);
        const selected = selectedTime === time;
        const recommended = available && !isAdmin && (index === 0 || (index > 0 && !isSlotAvailable(hours[index - 1])));
        return (
          <motion.button
            key={time}
            type="button"
            whileHover={{ scale: !available && !isAdmin ? 1 : 1.05 }}
            whileTap={{ scale: !available && !isAdmin ? 1 : 0.95 }}
            onClick={() => isAdmin ? toggleBlock(time, blockedByAdmin, bookedByAppointment) : available && !blockedByAdmin && onSelectSlot(time)}
            disabled={!isAdmin && !available || isAdmin && bookedByAppointment}
            className={cn('relative min-h-[92px] p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 overflow-hidden', bookedByAppointment ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-70' : blockedByAdmin ? 'bg-red-50 border-red-200 text-red-600' : selected ? 'bg-[#E5D3B3] border-[#5D4037] text-[#5D4037] shadow-lg ring-2 ring-offset-2 ring-[#5D4037]' : recommended ? 'bg-[#FAF9F6] border-[#8D6E63] text-[#5D4037]' : 'bg-white border-[#E5D3B3]/50 text-[#5D4037] hover:border-[#5D4037]')}
          >
            {recommended && !selected && <div className="absolute top-0 left-0 w-full bg-[#8D6E63] text-white text-[8px] uppercase tracking-widest py-0.5">Recomendado</div>}
            <span className="text-xs uppercase opacity-60 flex items-center gap-1">{!available ? <Lock className="w-3 h-3" /> : selected ? <Check className="w-3 h-3" /> : isAdmin ? 'Admin' : 'Libre'}</span>
            <span className={cn('text-base', !available && 'line-through opacity-70')}>{time}</span>
            <span className="text-[8px] uppercase tracking-widest mt-1">{bookedByAppointment ? 'Con cita' : blockedByAdmin ? 'Desbloquear' : isAdmin ? 'Bloquear' : 'Disponible'}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
