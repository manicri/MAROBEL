import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelectDate }) => {
  const [startDate, setStartDate] = React.useState(new Date());

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 7);
    setStartDate(d);
  };

  const prevWeek = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - 7);
    // Prevent going before today
    if (d < new Date(new Date().setHours(0,0,0,0))) {
      setStartDate(new Date());
    } else {
      setStartDate(d);
    }
  };

  const isPrevDisabled = startDate <= new Date(new Date().setHours(0,0,0,0));

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-[#5D4037] capitalize">
          {formatMonth(startDate)} {startDate.getFullYear()}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={prevWeek} 
            disabled={isPrevDisabled}
            className={cn(
              "p-2 rounded-full border transition-colors",
              isPrevDisabled ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/20"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextWeek}
            className="p-2 rounded-full border border-[#E5D3B3] text-[#5D4037] hover:bg-[#E5D3B3]/20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr;
          const isSunday = date.getDay() === 0;

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: isSunday ? 1 : 1.05 }}
              whileTap={{ scale: isSunday ? 1 : 0.95 }}
              onClick={() => !isSunday && onSelectDate(dateStr)}
              disabled={isSunday}
              className={cn(
                "flex flex-col items-center justify-center py-3 rounded-xl border transition-all",
                isSunday ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50" :
                isSelected ? "bg-[#5D4037] border-[#5D4037] text-white shadow-md" :
                "bg-white border-[#E5D3B3]/50 text-[#5D4037] hover:border-[#5D4037]"
              )}
            >
              <span className={cn("text-[10px] uppercase tracking-widest font-bold mb-1", isSelected ? "text-white/80" : "text-[#5D4037]/60")}>
                {formatDayName(date)}
              </span>
              <span className="text-lg font-serif">
                {formatDayNumber(date)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
