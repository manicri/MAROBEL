import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { useSelection } from "../context/SelectionContext";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { selectedServices, removeService, total, totalDuration, clearSelection } = useSelection();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/reserva");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF9F6] z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5D3B3]/30 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5D4037] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#E5D3B3]" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-[#5D4037]">Tu Selección</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#5D4037]/50 font-bold">
                    {selectedServices.length} {selectedServices.length === 1 ? "servicio" : "servicios"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center hover:bg-[#E5D3B3]/40 transition-colors"
              >
                <X className="w-4 h-4 text-[#5D4037]" />
              </button>
            </div>

            {/* Services list */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
              {selectedServices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center px-8 pb-16"
                >
                  <div className="w-20 h-20 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center mb-6">
                    <Sparkles className="w-9 h-9 text-[#E5D3B3]" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#5D4037] mb-3">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-sm text-[#5D4037]/60 font-light leading-relaxed mb-8">
                    Explora nuestros servicios y añade los que desees a tu reserva.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      const el = document.getElementById("servicios");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-[#5D4037] text-white px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-[#4a332c] transition-colors"
                  >
                    Ver Servicios
                  </button>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence>
                    {selectedServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm border border-[#E5D3B3]/20"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#5D4037] text-sm mb-1 truncate">
                            {service.name}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/50">
                            <span>{service.category}</span>
                            {service.duration && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[#E5D3B3] inline-block" />
                                <span>{service.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-[#8D6E63] text-base">
                            ${service.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeService(service.id)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear all */}
                  <button
                    onClick={clearSelection}
                    className="w-full text-center text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/40 hover:text-red-400 transition-colors py-2"
                  >
                    Vaciar selección
                  </button>
                </>
              )}
            </div>

            {/* Footer with total and checkout */}
            {selectedServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-6 bg-white border-t border-[#E5D3B3]/30 space-y-4"
              >
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#5D4037]/60 font-medium">
                    <span>{selectedServices.length} servicios seleccionados</span>
                    <span>{totalDuration} min en total</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#5D4037] uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-serif font-bold text-[#5D4037]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#5D4037] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4a332c] transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  Finalizar Reserva
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[10px] text-[#5D4037]/40 font-light">
                  Podrás elegir fecha y horario en el siguiente paso
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

