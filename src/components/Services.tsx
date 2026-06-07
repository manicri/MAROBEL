import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Scissors, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import ServicesPromotionsMenu from "./ServicesPromotionsMenu";

interface Category { id: string; nombre: string; }
interface Service { id: string; nombre: string; descripcion: string; categoria: string; precio: number; duracion: string; imagen_url?: string; }

const defaultIcons: Record<string, any> = { Cabello: Scissors, 'Uñas': Star, 'Estética Facial': Sparkles, 'Rituales Spa': Heart };
const defaultImages: Record<string, string> = {
  Cabello: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop",
  'Uñas': "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop",
  'Estética Facial': "https://images.unsplash.com/photo-1570172619245-711f83f5fd19?q=80&w=2070&auto=format&fit=crop",
  'Rituales Spa': "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop",
};

const fallbackServices: Service[] = [
  { id: 'c1', nombre: 'Balayage', descripcion: '', precio: 120, duracion: '120 min', categoria: 'Cabello' },
  { id: 'u1', nombre: 'Acrílicas', descripcion: '', precio: 40, duracion: '90 min', categoria: 'Uñas' },
  { id: 'f1', nombre: 'Limpieza Profunda', descripcion: '', precio: 60, duracion: '60 min', categoria: 'Estética Facial' },
  { id: 'r1', nombre: 'Masaje Relajante', descripcion: '', precio: 70, duracion: '60 min', categoria: 'Rituales Spa' },
];

export default function Services() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: categoryData }, { data: serviceData }] = await Promise.all([
        supabase.from('categorias').select('*'),
        supabase.from('servicios').select('*'),
      ]);
      if (categoryData?.length) setCategories(categoryData);
      setServices(serviceData?.length ? serviceData : fallbackServices);
    };
    fetchData();
    const categoryChannel = supabase.channel('public_categorias').on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, fetchData).subscribe();
    const serviceChannel = supabase.channel('public_servicios').on('postgres_changes', { event: '*', schema: 'public', table: 'servicios' }, fetchData).subscribe();
    return () => { supabase.removeChannel(categoryChannel); supabase.removeChannel(serviceChannel); };
  }, []);

  const displayCategories = categories.length ? categories : [
    { id: '1', nombre: 'Cabello' }, { id: '2', nombre: 'Uñas' }, { id: '3', nombre: 'Estética Facial' }, { id: '4', nombre: 'Rituales Spa' },
  ];

  return (
    <section id="servicios" className="bg-stone-50 py-20 md:py-24">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.4em] text-[#8D6E63]">Experiencia Premium</span>
            <h1 className="mb-5 font-serif text-3xl leading-tight text-[#5D4037] md:text-5xl">Nuestros Servicios de Belleza</h1>
            <p className="mx-auto mb-8 max-w-2xl text-sm font-light leading-relaxed text-[#5D4037]/70 md:text-base">Descubre tratamientos diseñados para realzar tu belleza natural y brindarte un momento de desconexión total.</p>
            <a href="https://wa.me/593969272530" target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-[#E5D3B3] bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-[#FAF9F6]">Contactar por WhatsApp</a>
          </motion.div>
        </div>

        <ServicesPromotionsMenu services={services} />

        <div id="servicios-anchor" className="mb-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayCategories.map((category, index) => {
            const categoryServices = services.filter((service) => service.categoria === category.nombre);
            const Icon = defaultIcons[category.nombre] || Sparkles;
            const image = categoryServices.find((service) => service.imagen_url)?.imagen_url || defaultImages[category.nombre] || defaultImages.Cabello;
            const linkPath = `/servicios?categoria=${encodeURIComponent(category.nombre)}`;
            return (
              <motion.div key={category.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group flex flex-col">
                <div className="relative mb-4 h-[260px] overflow-hidden rounded-2xl shadow-lg">
                  <img src={image} alt={`Servicios de ${category.nombre}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <Icon className="mb-3 h-6 w-6 text-[#E5D3B3]" />
                    <h3 className="mb-2 font-serif text-xl text-white">{category.nombre}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryServices.slice(0, 3).map((service) => <span key={service.id} className="rounded-full border border-white/20 px-2 py-1 text-[7px] uppercase tracking-widest text-white/70">{service.nombre}</span>)}
                      {!categoryServices.length && <span className="rounded-full border border-white/20 px-2 py-1 text-[7px] uppercase tracking-widest text-white/70">Proximamente</span>}
                    </div>
                  </div>
                </div>
                <p className="mb-4 flex-grow px-2 text-xs font-light leading-relaxed text-[#5D4037]/70">Todos los tratamientos de {category.nombre.toLowerCase()} están dentro del mismo catálogo.</p>
                <div className="mt-auto px-2"><Link to={linkPath} className="inline-block w-full rounded-full border border-[#5D4037] py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-[#5D4037] hover:text-white">Ver en el catálogo</Link></div>
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-[2rem] bg-[#FAF9F6] p-6 text-center md:p-12">
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[{ number: '+100', label: 'Clientas Atendidas' }, { number: '+5', label: 'Años de Experiencia' }, { number: '100%', label: 'Atención Profesional' }, { number: '5.0', label: 'Resultados de Calidad' }].map((stat) => (
              <div key={stat.label}><div className="mb-2 font-serif text-3xl font-bold text-[#5D4037]">{stat.number}</div><div className="text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/60">{stat.label}</div></div>
            ))}
          </div>
          <h2 className="mb-8 font-serif text-3xl text-[#5D4037]">Lo que dicen nuestras clientas</h2>
          <div className="grid gap-5 text-left md:grid-cols-3">
            {[{ name: 'María Fernanda', text: 'La atención es increíble y los resultados en mi cabello fueron espectaculares.' }, { name: 'Andrea Gómez', text: 'El ambiente es súper relajante y el personal muy profesional.' }, { name: 'Carla Ruiz', text: 'Los masajes relajantes son de otro mundo. Salí renovada.' }].map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl border border-[#E5D3B3]/20 bg-white p-6 shadow-sm"><div className="mb-3 flex text-[#E5D3B3]">{[...Array(5)].map((_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current" />)}</div><p className="mb-5 text-xs italic leading-relaxed text-[#5D4037]/70">"{testimonial.text}"</p><div className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">{testimonial.name}</div></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
