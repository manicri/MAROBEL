import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Promotion } from './AdminPromotions';
import { Link } from 'react-router-dom';

export const PublicPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('marobel_promotions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = new Date().toISOString().split('T')[0];
        setPromotions(parsed.filter((promotion: Promotion) => promotion.isActive && promotion.startDate <= now && promotion.endDate >= now));
      } catch (error) {
        console.error('Error parsing promotions', error);
      }
    }
  }, []);

  if (promotions.length === 0) return null;

  return (
    <section id="promociones" className="py-24 bg-[#FAF9F6]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">Ofertas Especiales</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#5D4037] mb-6">Promociones del Mes</h2>
          <p className="text-[#5D4037]/60 font-light leading-relaxed">Aprovecha nuestros paquetes exclusivos disenados para resaltar tu belleza al mejor precio.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo, index) => (
            <motion.div key={promo.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-[#E5D3B3]/20 flex flex-col group">
              <div className="relative h-56 overflow-hidden">
                <img src={promo.imageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop"} alt={promo.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037]/80 to-transparent" />
                {promo.badge && <div className="absolute top-4 right-4 bg-[#E5D3B3] text-[#5D4037] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">{promo.badge}</div>}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-serif text-white mb-1">{promo.name}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-xs"><CalendarIcon className="w-3 h-3" /><span>Valido hasta {new Date(promo.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span></div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-[#5D4037]/70 mb-6 flex-grow leading-relaxed">{promo.description}</p>
                <div className="flex items-end justify-between mb-6 pt-4 border-t border-[#E5D3B3]/20">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/40 block mb-1">Precio Especial</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#8D6E63]">${promo.discountPrice.toFixed(2)}</span>
                      {promo.originalPrice && <span className="text-sm text-[#5D4037]/40 line-through">${promo.originalPrice.toFixed(2)}</span>}
                    </div>
                  </div>
                </div>
                <Link to={`/?promo=${encodeURIComponent(promo.id)}#promociones-servicios`} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#5D4037] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#4a332c] transition-colors shadow-md">
                  Ver servicios incluidos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
