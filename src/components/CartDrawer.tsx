import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelection } from "../context/SelectionContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { selectedServices, removeService, total, totalDuration, clearSelection } = useSelection();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    onClose();
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-[#FAF9F6] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5D3B3]/30 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5D4037]"><ShoppingBag className="h-5 w-5 text-[#E5D3B3]" /></div>
                <div>
                  <h2 className="font-serif text-xl text-[#5D4037]">Tu Selección</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/50">{selectedServices.length} {selectedServices.length === 1 ? "servicio" : "servicios"}</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5D3B3]/20 transition hover:bg-[#E5D3B3]/40"><X className="h-4 w-4 text-[#5D4037]" /></button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
              {selectedServices.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center px-8 pb-16 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E5D3B3]/20"><Sparkles className="h-9 w-9 text-[#E5D3B3]" /></div>
                  <h3 className="mb-3 font-serif text-2xl text-[#5D4037]">Tu carrito está vacío</h3>
                  <p className="mb-8 text-sm font-light leading-relaxed text-[#5D4037]/60">Explora el catálogo y elige los servicios que deseas reservar.</p>
                  <button onClick={() => goTo("/servicios")} className="rounded-full bg-[#5D4037] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#4a332c]">Ver servicios</button>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence>
                    {selectedServices.map((service, index) => (
                      <motion.div key={service.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5D3B3]/20 bg-white p-5 shadow-sm">
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 truncate text-sm font-bold text-[#5D4037]">{service.name}</h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/50">
                            <span>{service.category}</span>
                            {service.duration && <><span className="inline-block h-1 w-1 rounded-full bg-[#E5D3B3]" /><span>{service.duration}</span></>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-base font-bold text-[#8D6E63]">${service.price.toFixed(2)}</span>
                          <button onClick={() => removeService(service.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-400 transition hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button onClick={() => goTo("/servicios")} className="w-full rounded-xl border border-[#E5D3B3] bg-white py-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:border-[#5D4037]">Agregar más servicios</button>
                  <button onClick={clearSelection} className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/40 transition hover:text-red-400">Vaciar selección</button>
                </>
              )}
            </div>

            {selectedServices.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 border-t border-[#E5D3B3]/30 bg-white px-6 py-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-[#5D4037]/60"><span>{selectedServices.length} servicios seleccionados</span><span>{totalDuration} min en total</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm font-bold uppercase tracking-widest text-[#5D4037]">Total</span><span className="font-serif text-2xl font-bold text-[#5D4037]">${total.toFixed(2)}</span></div>
                </div>
                <button onClick={() => goTo("/reserva")} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#5D4037] py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#4a332c] hover:shadow-lg active:scale-[0.98]">Finalizar reserva<ArrowRight className="h-4 w-4" /></button>
                <p className="text-center text-[10px] font-light text-[#5D4037]/40">Podrás elegir fecha y horario en el siguiente paso</p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
