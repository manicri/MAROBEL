import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Check } from 'lucide-react';

interface Appointment {
  id: string;
  fecha: string;
  hora: string;
  Estado: string;
}

interface CalendarProps {
  selectedDate: string;
  onSelectSlot: (time: string) => void;
  selectedTime: string | null;
  isAdmin?: boolean;
  totalDuration?: number;
  selectedProfessional?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectSlot, selectedTime, isAdmin, totalDuration = 60, selectedProfessional = 'any' }) => {
  const [citasDelDia, setCitasDelDia] = useState<{hora: string, Estado: string, profesional?: string}[]>([]);
  const [bloqueosDelDia, setBloqueosDelDia] = useState<{hora: string | null}[]>([]);
  const [isFullDayBlocked, setIsFullDayBlocked] = useState(false);

  const getHours = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getUTCDay(); // 0 = Sun, 6 = Sat
    if (day === 0) return []; // Sunday closed
    const start = day === 6 ? 10 : 9; // Sat starts at 10
    
    // Generate 30-min intervals for better granularity
    const slots = [];
    for (let i = start; i <= 18; i++) {
      slots.push(`${i}:00`);
      if (i !== 18) slots.push(`${i}:30`);
    }
    return slots;
  };

  const hours = useMemo(() => getHours(selectedDate), [selectedDate]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      // Fetch Citas
      const { data: citasData, error: citasError } = await supabase
        .from('citas')
        .select('hora, Estado')
        .eq('fecha', selectedDate);
      
      if (citasError) console.error('Error fetching booked slots:', citasError);
      else if (citasData) {
        // Simulate professional assignment for existing data if needed
        const simulatedData = citasData.map(c => ({
          ...c,
          profesional: 'any' // In a real app, this would come from DB
        }));
        setCitasDelDia(simulatedData);
      }

      // Fetch Bloqueos
      const { data: bloqueosData, error: bloqueosError } = await supabase
        .from('bloqueos')
        .select('hora')
        .eq('fecha', selectedDate);

      if (bloqueosError) {
        console.error('Error fetching bloqueos:', bloqueosError);
      } else if (bloqueosData) {
        setBloqueosDelDia(bloqueosData);
        // Si hay un bloqueo con hora null, todo el día está bloqueado
        setIsFullDayBlocked(bloqueosData.some(b => b.hora === null));
      }
    };

    fetchBookedSlots();

    // Real-time subscription
    const channelCitas = supabase
      .channel('citas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `fecha=eq.${selectedDate}` }, () => {
        fetchBookedSlots();
      })
      .subscribe();

    const channelBloqueos = supabase
      .channel('bloqueos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueos', filter: `fecha=eq.${selectedDate}` }, () => {
        fetchBookedSlots();
      })
      .subscribe();

    // Custom event listener for immediate refresh
    const handleBlockAdded = () => fetchBookedSlots();
    window.addEventListener('marobel-block-added', handleBlockAdded);

    return () => {
      supabase.removeChannel(channelCitas);
      supabase.removeChannel(channelBloqueos);
      window.removeEventListener('marobel-block-added', handleBlockAdded);
    };
  }, [selectedDate, selectedProfessional]);

  const bookedSlots = useMemo(() => {
    const citasBooked = citasDelDia
      .filter(cita => cita.Estado === 'aceptada' || cita.Estado === 'Aceptada')
      .map(cita => {
        const [h, m] = cita.hora.split(':');
        return `${parseInt(h)}:${m === '00' ? '00' : '30'}`; // Normalize
      });
    
    const bloqueosBooked = bloqueosDelDia
      .filter(b => b.hora !== null)
      .map(b => {
        const [h, m] = b.hora!.split(':');
        return `${parseInt(h)}:${m === '00' ? '00' : '30'}`;
      });

    return [...citasBooked, ...bloqueosBooked];
  }, [citasDelDia, bloqueosDelDia]);

  // Calculate if a slot is available based on totalDuration
  const isSlotAvailable = (time: string) => {
    if (isFullDayBlocked) return false;
    
    const startIndex = hours.indexOf(time);
    if (startIndex === -1) return false;

    const slotsNeeded = Math.ceil(totalDuration / 30);
    
    // Check if there are enough slots left in the day
    if (startIndex + slotsNeeded > hours.length) return false;

    // Check if any of the required slots are booked
    for (let i = 0; i < slotsNeeded; i++) {
      if (bookedSlots.includes(hours[startIndex + i])) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {isFullDayBlocked ? (
        <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-[#5D4037] font-bold uppercase tracking-widest text-sm">Día No Disponible</p>
          <p className="text-gray-500 text-xs mt-1">Este día ha sido bloqueado por administración.</p>
        </div>
      ) : hours.length === 0 ? (
        <div className="col-span-full py-8 text-center text-[#5D4037]/60 font-medium italic">
          Cerrado los domingos. Por favor selecciona otro día.
        </div>
      ) : (
        hours.map((time) => {
          const isAvailable = isSlotAvailable(time);
          const isBooked = !isAvailable;
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
                "relative p-4 rounded-xl border text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 overflow-hidden",
                isBooked ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-70 pointer-events-none ocupado" : 
                isSelected ? "bg-[#E5D3B3] border-[#5D4037] text-[#5D4037] shadow-lg ring-2 ring-offset-2 ring-[#5D4037] z-10" :
                "bg-white border-[#E5D3B3]/50 text-[#5D4037] hover:border-[#5D4037] hover:shadow-md"
              )}
            >
              {isBooked && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="w-full h-[1px] bg-gray-800 rotate-45 absolute"></div>
                </div>
              )}
              <span className="text-xs uppercase tracking-tighter opacity-60 flex items-center gap-1">
                {isBooked ? <Lock className="w-3 h-3" /> : isSelected ? <Check className="w-3 h-3" /> : 'Slot'}
              </span>
              <span className={cn("text-base", isBooked && "line-through opacity-70")}>{time}</span>
              <span className="text-[8px] uppercase tracking-widest mt-1">{isBooked ? 'No disponible' : 'Libre'}</span>
            </motion.button>
          );
        })
      )}
    </div>
  );
};
