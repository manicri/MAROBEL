import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
import { ServiceSidebar } from '../components/ServiceSidebar';
import { ServiceItem } from '../context/SelectionContext';

const RITUALES_SERVICES: ServiceItem[] = [
  { id: 'r1', name: 'Ritual Relajante', price: 60, category: 'rituales' },
  { id: 'r2', name: 'Ritual Renovador', price: 90, category: 'rituales' },
  { id: 'r3', name: 'Ritual Marobel', price: 150, category: 'rituales' },
];

export default function Rituales() {
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
            Rituales
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Desconecta del mundo y reconecta contigo misma con nuestros rituales exclusivos de relajación y belleza.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          <ServiceSidebar />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {RITUALES_SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
      <FloatingReservationButton />
    </div>
  );
}
