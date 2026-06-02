import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useSelection } from "../context/SelectionContext";

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { selectedServices } = useSelection();
  const count = selectedServices.length;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 text-white hover:text-[#E5D3B3] transition-colors group"
      aria-label="Abrir carrito de servicios"
    >
      <div className="relative">
        <ShoppingBag className="w-6 h-6" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-[#E5D3B3] text-[#5D4037] text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">
        {count > 0 ? `${count} servicio${count > 1 ? "s" : ""}` : "Carrito"}
      </span>
    </button>
  );
}

