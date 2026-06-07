import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '../supabase';

interface DatePickerProps { selectedDate: string; onSelectDate: (date: string) => void; isAdmin?: boolean; }
const formatDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelectDate, isAdmin = false }) => {
  const [startDate, setStartDate] = React.useState(new Date());
  const [blockedDates, setBlockedDates] = React.useState<Set<string>>(new Set());
  const canSelectBlocked = isAdmin || window.location.pathname.startsWith('/admin');
  const canReviewHistory = isAdmin || window.location.pathname.startsWith('/admin');
  const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(startDate); date.setDate(date.getDate() + index); return date; });
  const isPrevDisabled = !canReviewHistory && startDate <= new Date(new Date().setHours(0, 0, 0, 0));

  React.useEffect(() => {
    const fetchBlockedDates = async () => {
      const { data, error } = await supabase.from('bloqueos').select('fecha').is('hora', null).gte('fecha', formatDateKey(dates[0])).lte('fecha', formatDateKey(dates[dates.length - 1]));
      if (error) { console.error('Error fetching blocked dates:', error); setBlockedDates(new Set()); return; }
      setBlockedDates(new Set((data ?? []).map((item) => item.fecha)));
    };
    fetchBlockedDates();
    const channel = supabase.channel(`date_picker_bloqueos_${formatDateKey(startDate)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueos' }, fetchBlockedDates).subscribe();
    const refresh = () => fetchBlockedDates();
    window.addEventListener('marobel-block-added', refresh);
    return () => { supabase.removeChannel(channel); window.removeEventListener('marobel-block-added', refresh); };
  }, [startDate]);

  const moveWeek = (days: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    setStartDate(!canReviewHistory && days < 0 && date < today ? new Date() : date);
  };

  return <div className="w-full">
    <div className="mb-3 flex items-center justify-between"><span className="text-sm font-bold capitalize text-[#5D4037]">{startDate.toLocaleDateString('es-ES', { month: 'long' })} {startDate.getFullYear()}</span><div className="flex gap-2"><button type="button" aria-label="Semana anterior" onClick={() => moveWeek(-7)} disabled={isPrevDisabled} className={cn('rounded-full border p-2 transition-colors', isPrevDisabled ? 'cursor-not-allowed border-gray-200 text-gray-300' : 'border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/20')}><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Semana siguiente" onClick={() => moveWeek(7)} className="rounded-full border border-[#E5D3B3] p-2 text-[#5D4037] transition-colors hover:bg-[#E5D3B3]/20"><ChevronRight className="h-4 w-4" /></button></div></div>
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{dates.map((date) => {
      const dateStr = formatDateKey(date);
      const selected = selectedDate === dateStr;
      const blocked = blockedDates.has(dateStr);
      const disabled = !canReviewHistory && (date.getDay() === 0 || (blocked && !canSelectBlocked));
      return <motion.button type="button" key={dateStr} whileHover={{ scale: disabled ? 1 : 1.04 }} whileTap={{ scale: disabled ? 1 : 0.96 }} onClick={() => !disabled && onSelectDate(dateStr)} disabled={disabled} title={blocked ? 'Dia bloqueado por administracion' : undefined} className={cn('relative flex min-w-0 flex-col items-center justify-center rounded-xl border py-2 transition-all', disabled ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 opacity-50' : blocked && canSelectBlocked ? 'border-red-200 bg-red-50 text-red-600' : selected ? 'border-[#5D4037] bg-[#5D4037] text-white shadow-md' : 'border-[#E5D3B3]/50 bg-white text-[#5D4037] hover:border-[#5D4037]')}>
        {blocked && <Lock className={cn('absolute right-1 top-1 h-2.5 w-2.5', selected ? 'text-white/80' : 'text-red-400')} />}<span className={cn('mb-0.5 text-[8px] font-bold uppercase tracking-wide sm:text-[9px]', selected ? 'text-white/80' : 'text-[#5D4037]/60')}>{date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</span><span className="font-serif text-base sm:text-lg">{date.getDate()}</span>
      </motion.button>;
    })}</div>
  </div>;
};
