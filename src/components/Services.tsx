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
      const { data: catData, error: catError } = await supabase.from('categorias').select('*');
      const { data: servData, error: servError } = await supabase.from('servicios').select('*');
      
      if (catData && catData.length > 0 && !catError) {
        setCategories(catData);
      }
      if (servData && servData.length > 0 && !servError) {
        setServices(servData);
      } else {
        // Fallback services
        setServices([
          { id: 'c1', nombre: 'Balayage', descripcion: '', precio: 120, duracion: '120 min', categoria: 'Cabello' },
          { id: 'c2', nombre: 'Corte Dama', descripcion: '', precio: 35, duracion: '45 min', categoria: 'Cabello' },
          { id: 'c3', nombre: 'Alisados', descripcion: '', precio: 150, duracion: '180 min', categoria: 'Cabello' },
          { id: 'c4', nombre: 'Hidratación', descripcion: '', precio: 45, duracion: '60 min', categoria: 'Cabello' },
          { id: 'u1', nombre: 'Acrílicas', descripcion: '', precio: 40, duracion: '90 min', categoria: 'Uñas' },
          { id: 'u2', nombre: 'Gelish', descripcion: '', precio: 25, duracion: '45 min', categoria: 'Uñas' },
          { id: 'u3', nombre: 'SPA Pedicura', descripcion: '', precio: 35, duracion: '60 min', categoria: 'Uñas' },
          { id: 'u4', nombre: 'Nail Art', descripcion: '', precio: 15, duracion: '30 min', categoria: 'Uñas' },
          { id: 'f1', nombre: 'Limpieza Profunda', descripcion: '', precio: 60, duracion: '60 min', categoria: 'Estética Facial' },
          { id: 'f2', nombre: 'Peeling', descripcion: '', precio: 85, duracion: '60 min', categoria: 'Estética Facial' },
          { id: 'f3', nombre: 'Microdermabrasión', descripcion: '', precio: 75, duracion: '60 min', categoria: 'Estética Facial' },
          { id: 'r1', nombre: 'Masaje Relajante', descripcion: '', precio: 70, duracion: '60 min', categoria: 'Rituales Spa' },
          { id: 'r2', nombre: 'Piedras Volcánicas', descripcion: '', precio: 90, duracion: '90 min', categoria: 'Rituales Spa' },
          { id: 'r3', nombre: 'Exfoliación', descripcion: '', precio: 50, duracion: '45 min', categoria: 'Rituales Spa' },
          { id: 'r4', nombre: 'Peeling Corporal', descripcion: 'Renovación profunda de la piel con exfoliación y hidratación intensa.', precio: 80, duracion: '90 min', categoria: 'Rituales Spa', imagen_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop' }
        ]);
      }
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
    <section id="servicios" className="py-32 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Experiencia Premium
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4037] mb-6 leading-tight">
              Nuestros Servicios de Belleza en Marobel Beauty Studio
            </h1>
            <p className="text-[#5D4037]/70 font-light leading-relaxed text-lg mb-10 max-w-2xl mx-auto">
              Descubre nuestros tratamientos diseñados para realzar tu belleza natural y brindarte un momento de desconexión total en La Alborada, Guayaquil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="#reserva" 
                className="bg-[#5D4037] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#4a332c] transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Reservar cita
              </a>
              <a 
                href="https://wa.me/593969272530" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-[#5D4037] border border-[#E5D3B3] px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#FAF9F6] transition-all w-full sm:w-auto"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

        <div id="servicios-anchor" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
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
                    alt={`Servicios de ${category.nombre} en Guayaquil`}
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


        {/* Confianza y Prueba Social */}
        <div className="bg-[#FAF9F6] rounded-[3rem] p-8 md:p-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: '+100', label: 'Clientas Atendidas' },
              { number: '+5', label: 'Años de Experiencia' },
              { number: '100%', label: 'Atención Profesional' },
              { number: '5.0', label: 'Resultados de Calidad' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-serif text-[#5D4037] font-bold mb-2">{stat.number}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#5D4037]/60 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037] mb-12">Lo que dicen nuestras clientas</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { name: 'María Fernanda', text: 'El mejor spa en Guayaquil. La atención es increíble y los resultados en mi cabello fueron espectaculares. ¡100% recomendado!' },
              { name: 'Andrea Gómez', text: 'Me hice las uñas acrílicas y quedé fascinada. El ambiente es súper relajante y el personal muy profesional.' },
              { name: 'Carla Ruiz', text: 'Los masajes relajantes son de otro mundo. Salí renovada. Definitivamente volveré a Marobel.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-[#E5D3B3]/20">
                <div className="flex text-[#E5D3B3] mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[#5D4037]/70 italic mb-6 text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="font-bold text-[#5D4037] text-sm uppercase tracking-wider">{testimonial.name}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-16">
            <p className="text-[#5D4037] font-serif text-2xl mb-6">¿Lista para tu momento de belleza?</p>
            <a href="#reservas" className="inline-block bg-[#5D4037] text-white px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#4a332c] transition-all shadow-lg hover:shadow-xl">
              Agenda tu cita hoy
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
