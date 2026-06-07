import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
import { ServiceSidebar } from '../components/ServiceSidebar';
import PopularServices from '../components/PopularServices';
import { supabase } from '../supabase';
import { ServiceItem } from '../context/SelectionContext';

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchCategoryAndServices = async () => {
      // First, get all categories to match the slug
      const { data: catData } = await supabase.from('categorias').select('*');
      
      let targetCategory = '';
      const fallbackMap: Record<string, string> = {
        'cabello': 'Cabello',
        'unas': 'Uñas',
        'estetica-facial': 'Estética Facial',
        'rituales': 'Rituales Spa'
      };

      if (catData && catData.length > 0) {
        const matched = catData.find(c => 
          c.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') === slug
        );
        if (matched) {
          targetCategory = matched.nombre;
        } else {
          targetCategory = fallbackMap[slug || ''] || slug || '';
        }
      } else {
        targetCategory = fallbackMap[slug || ''] || slug || '';
      }
      
      setCategoryName(targetCategory);

      if (targetCategory) {
        const { data: servData, error } = await supabase
          .from('servicios')
          .select('*')
          .eq('categoria', targetCategory);
        
        if (servData && !error) {
          const mappedServices = servData.map(s => ({
            id: s.id,
            name: s.nombre,
            price: s.precio,
            category: s.categoria as any,
            imageUrl: s.imagen_url,
            description: s.descripcion,
            duration: s.duracion
          }));
          setServices(mappedServices);
        } else {
          // Fallback services if DB fails
          const fallbackServices: Record<string, any[]> = {
            'Cabello': [
              { id: 'c1', name: 'Balayage', price: 120, category: 'Cabello', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop' },
              { id: 'c2', name: 'Corte Dama', price: 35, category: 'Cabello' },
              { id: 'c3', name: 'Alisados', price: 150, category: 'Cabello' },
              { id: 'c4', name: 'Hidratación', price: 45, category: 'Cabello' }
            ],
            'Uñas': [
              { id: 'u1', name: 'Acrílicas', price: 40, category: 'Uñas', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop' },
              { id: 'u2', name: 'Gelish', price: 25, category: 'Uñas' },
              { id: 'u3', name: 'SPA Pedicura', price: 35, category: 'Uñas' },
              { id: 'u4', name: 'Nail Art', price: 15, category: 'Uñas' }
            ],
            'Estética Facial': [
              { id: 'f1', name: 'Limpieza Profunda', price: 60, category: 'Estética Facial', imageUrl: 'https://images.unsplash.com/photo-1570172619245-711f83f5fd19?q=80&w=2070&auto=format&fit=crop' },
              { id: 'f2', name: 'Peeling', price: 85, category: 'Estética Facial' },
              { id: 'f3', name: 'Microdermabrasión', price: 75, category: 'Estética Facial' }
            ],
            'Rituales Spa': [
              { id: 'r1', name: 'Masaje Relajante', price: 70, category: 'Rituales Spa', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop' },
              { id: 'r2', name: 'Piedras Volcánicas', price: 90, category: 'Rituales Spa' },
              { id: 'r3', name: 'Exfoliación', price: 50, category: 'Rituales Spa' },
              { id: 'r4', name: 'Peeling Corporal', description: 'Renovación profunda de la piel con exfoliación y hidratación intensa.', duration: '90 min', price: 80, category: 'Rituales Spa', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop' }
            ]
          };
          setServices(fallbackServices[targetCategory] || []);
        }
      }
    };

    fetchCategoryAndServices();
  }, [slug]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#5D4037] hover:text-[#8D6E63] transition-colors text-sm font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5D4037] mb-4">
            Servicios de {categoryName}
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto mb-8">
            Transforma tu look con nuestros expertos. Utilizamos los mejores productos para cuidar y embellecerte.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/reserva" className="bg-[#5D4037] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4a332c] transition-all shadow-md">
              Consulta disponibilidad
            </Link>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          <ServiceSidebar />
          <div className="flex-1">
            {services.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-[#E5D3B3]/20">
                <p className="text-[#5D4037]/60 font-medium">No hay servicios disponibles en esta categoría por el momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {services.map((service: any) => (
                  <ServiceCard key={service.id} service={service} imageUrl={service.imageUrl} />
                ))}
              </div>
            )}
          </div>
        </div>
        <PopularServices />
      </div>
      <FloatingReservationButton />
    </div>
  );
}
