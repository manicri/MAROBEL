import { motion, AnimatePresence } from 'framer-motion';
import { useSelection } from '../context/SelectionContext';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingReservationButton() {
  const { selectedServices, total } = useSelection();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {selectedServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 right-6 z-40"
        >
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const element = document.getElementById('reservas');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="bg-[#5D4037] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-[#4a332c] transition-colors"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-[#E5D3B3] text-[#5D4037] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {selectedServices.length}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold uppercase tracking-wider">Finalizar Reserva</span>
              <span className="text-xs text-white/80">${total.toFixed(2)}</span>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
