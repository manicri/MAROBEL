import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
}

interface CalendarProps {
  selectedDate: string;
  onSelectSlot: (time: string) => void;
  selectedTime: string | null;
  isAdmin?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectSlot, selectedTime, isAdmin }) => {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const getHours = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getUTCDay(); // 0 = Sun, 6 = Sat
    if (day === 0) return []; // Sunday closed
    const start = day === 6 ? 10 : 9; // Sat starts at 10
    return Array.from({ length: 18 - start + 1 }, (_, i) => `${i + start}:00`);
  };

  const hours = getHours(selectedDate);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      const { data, error } = await supabase
        .from('citas')
        .select('hora')
        .eq('fecha', selectedDate)
        .in('Estado', ['Aceptada', 'Pendiente']);
      
      if (error) {
        console.error('Error fetching booked slots:', error);
        return;
      }

      if (data) {
        setBookedSlots(data.map(d => d.hora));
      }
    };

    fetchBookedSlots();

    // Real-time subscription
    const channel = supabase
      .channel('citas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `fecha=eq.${selectedDate}` }, () => {
        fetchBookedSlots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {hours.map((time) => {
        const isBooked = bookedSlots.includes(time);
        const isSelected = selectedTime === time;

        return (
          <motion.button
            key={time}
            type="button"
            whileHover={{ scale: isBooked ? 1 : 1.05 }}
            whileTap={{ scale: isBooked ? 1 : 0.95 }}
            onClick={() => {
              if (!isBooked) onSelectSlot(time);
            }}
            disabled={isBooked}
            className={cn(
              "p-4 rounded-xl border text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1",
              isBooked ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60" : 
              isSelected ? "bg-[#E5D3B3] border-[#E5D3B3] text-[#5D4037] shadow-[0_0_20px_rgba(229,211,179,0.4)]" :
              "bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20"
            )}
          >
            <span className="text-xs uppercase tracking-tighter opacity-60">Slot</span>
            <span className="text-base">{time}</span>
            <span className="text-[8px] uppercase tracking-widest mt-1">{isBooked ? 'Ocupado' : 'Libre'}</span>
          </motion.button>
        );
      })}
      {hours.length === 0 && (
        <div className="col-span-full py-8 text-center text-[#5D4037]/60 font-medium italic">
          Cerrado los domingos. Por favor selecciona otro día.
        </div>
      )}
    </div>
  );
};
