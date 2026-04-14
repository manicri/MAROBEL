import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

interface Category {
  id: string;
  nombre: string;
}

interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  duracion: string;
  imagen_url?: string;
}

const defaultIcons: Record<string, any> = {
  'Cabello': Scissors,
  'Uñas': Star,
  'Estética Facial': Sparkles,
  'Rituales Spa': Heart,
};

const defaultImages: Record<string, string> = {
  'Cabello': "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop",
  'Uñas': "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop",
  'Estética Facial': "https://images.unsplash.com/photo-1570172619245-711f83f5fd19?q=80&w=2070&auto=format&fit=crop",
  'Rituales Spa': "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop",
};

export default function Services() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from('categorias').select('*');
      const { data: servData } = await supabase.from('servicios').select('*');
      
      if (catData) setCategories(catData);
      if (servData) setServices(servData);
    };

    fetchData();

    const channelCat = supabase.channel('public_categorias')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, fetchData)
      .subscribe();
      
    const channelServ = supabase.channel('public_servicios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'servicios' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channelCat);
      supabase.removeChannel(channelServ);
    };
  }, []);

  // Fallback to hardcoded if DB is empty
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', nombre: 'Cabello' },
    { id: '2', nombre: 'Uñas' },
    { id: '3', nombre: 'Estética Facial' },
    { id: '4', nombre: 'Rituales Spa' }
  ];

  return (
    <section id="servicios" className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Nuestra Colección
            </span>
            <h2 className="text-5xl md:text-6xl font-serif text-[#5D4037] mb-8">
              Servicios Exclusivos
            </h2>
            <p className="text-[#5D4037]/60 font-light leading-relaxed">
              Cada tratamiento es un ritual diseñado para realzar tu belleza natural 
              y brindarte un momento de desconexión total.
            </p>
          </motion.div>
        </div>

        <div id="servicios-anchor" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCategories.map((category, index) => {
            const categoryServices = services.filter(s => s.categoria === category.nombre);
            const Icon = defaultIcons[category.nombre] || Sparkles;
            const firstImage = categoryServices.find(s => s.imagen_url)?.imagen_url || defaultImages[category.nombre] || "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop";
            const linkPath = `/${category.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col"
              >
                <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6 shadow-2xl">
                  <img
                    src={firstImage}
                    alt={category.nombre}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037] via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <Icon className="w-8 h-8 text-[#E5D3B3] mb-4" />
                    <h3 className="text-2xl font-serif text-white mb-2">{category.nombre}</h3>
                    <div className="flex flex-wrap gap-2">
                      {categoryServices.slice(0, 4).map(item => (
                        <span key={item.id} className="text-[8px] uppercase tracking-widest text-white/60 border border-white/20 px-2 py-1 rounded-full">
                          {item.nombre}
                        </span>
                      ))}
                      {categoryServices.length === 0 && (
                        <span className="text-[8px] uppercase tracking-widest text-white/60 border border-white/20 px-2 py-1 rounded-full">
                          Próximamente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#5D4037]/70 font-light leading-relaxed px-4 mb-6 flex-grow">
                  Descubre nuestros servicios exclusivos de {category.nombre.toLowerCase()} diseñados para tu bienestar.
                </p>
                <div className="px-4 mt-auto">
                  <Link 
                    to={linkPath}
                    className="inline-block w-full text-center py-3 rounded-full border-2 border-[#5D4037] text-[#5D4037] font-bold text-xs uppercase tracking-widest hover:bg-[#5D4037] hover:text-white transition-colors duration-300"
                  >
                    Ver Servicios
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
