import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
import { ServiceSidebar } from '../components/ServiceSidebar';
import { ServiceItem } from '../context/SelectionContext';

const UNAS_SERVICES: ServiceItem[] = [
  { id: 'u1', name: 'Manicura Básica', price: 15, category: 'unas' },
  { id: 'u2', name: 'Pedicura Spa', price: 30, category: 'unas' },
  { id: 'u3', name: 'Uñas Acrílicas', price: 45, category: 'unas' },
  { id: 'u4', name: 'Esmaltado Semipermanente', price: 25, category: 'unas' },
];

export default function Unas() {
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
            Servicios de Uñas
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Luce unas manos y pies impecables. Diseños exclusivos y cuidado profesional para tus uñas.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          <ServiceSidebar />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {UNAS_SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
      <FloatingReservationButton />
    </div>
  );
}
