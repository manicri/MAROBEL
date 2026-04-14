import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
import { ServiceSidebar } from '../components/ServiceSidebar';
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
      if (catData) {
        const matched = catData.find(c => 
          c.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') === slug
        );
        if (matched) {
          targetCategory = matched.nombre;
          setCategoryName(matched.nombre);
        } else {
          // Fallback for hardcoded routes
          const fallbackMap: Record<string, string> = {
            'cabello': 'Cabello',
            'unas': 'Uñas',
            'estetica-facial': 'Estética Facial',
            'rituales': 'Rituales Spa'
          };
          targetCategory = fallbackMap[slug || ''] || slug || '';
          setCategoryName(targetCategory);
        }
      }

      if (targetCategory) {
        const { data: servData } = await supabase
          .from('servicios')
          .select('*')
          .eq('categoria', targetCategory);
        
        if (servData) {
          const mappedServices = servData.map(s => ({
            id: s.id,
            name: s.nombre,
            price: s.precio,
            category: s.categoria as any,
            imageUrl: s.imagen_url
          }));
          setServices(mappedServices);
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
          <p className="text-stone-600 max-w-2xl mx-auto">
            Transforma tu look con nuestros expertos. Utilizamos los mejores productos para cuidar y embellecerte.
          </p>
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
      </div>
      <FloatingReservationButton />
    </div>
  );
}
