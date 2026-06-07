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

  const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(startDate); date.setDate(date.getDate() + index); return date; });
  const isPrevDisabled = startDate <= new Date(new Date().setHours(0, 0, 0, 0));

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
    setStartDate(days < 0 && date < new Date(new Date().setHours(0, 0, 0, 0)) ? new Date() : date);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-[#5D4037] capitalize">{startDate.toLocaleDateString('es-ES', { month: 'long' })} {startDate.getFullYear()}</span>
        <div className="flex gap-2">
          <button onClick={() => moveWeek(-7)} disabled={isPrevDisabled} className={cn('p-2 rounded-full border transition-colors', isPrevDisabled ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/20')}><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => moveWeek(7)} className="p-2 rounded-full border border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/20 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const dateStr = formatDateKey(date);
          const isSelected = selectedDate === dateStr;
          const isSunday = date.getDay() === 0;
          const isBlocked = blockedDates.has(dateStr);
          const isDisabled = isSunday || (isBlocked && !canSelectBlocked);
          return (
            <motion.button key={dateStr} whileHover={{ scale: isDisabled ? 1 : 1.05 }} whileTap={{ scale: isDisabled ? 1 : 0.95 }} onClick={() => !isDisabled && onSelectDate(dateStr)} disabled={isDisabled} title={isBlocked ? 'Dia bloqueado por administracion' : undefined} className={cn('relative flex flex-col items-center justify-center py-3 rounded-xl border transition-all', isDisabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50' : isBlocked && canSelectBlocked ? 'bg-red-50 border-red-200 text-red-600 hover:border-red-300' : isSelected ? 'bg-[#5D4037] border-[#5D4037] text-white shadow-md' : 'bg-white border-[#E5D3B3]/50 text-[#5D4037] hover:border-[#5D4037]')}>
              {isBlocked && <Lock className={cn('absolute right-2 top-2 h-3 w-3', isSelected ? 'text-white/80' : 'text-red-400')} />}
              <span className={cn('text-[10px] uppercase tracking-widest font-bold mb-1', isSelected ? 'text-white/80' : 'text-[#5D4037]/60')}>{date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</span>
              <span className="text-lg font-serif">{date.getDate()}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
