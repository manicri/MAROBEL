import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
import { ServiceItem } from '../context/SelectionContext';

const FACIAL_SERVICES: ServiceItem[] = [
  { id: 'f1', name: 'Limpieza Facial Profunda', price: 50, category: 'estetica-facial' },
  { id: 'f2', name: 'Tratamiento Anti-Edad', price: 85, category: 'estetica-facial' },
  { id: 'f3', name: 'Peeling Químico', price: 110, category: 'estetica-facial' },
  { id: 'f4', name: 'Hidratación Intensiva', price: 60, category: 'estetica-facial' },
];

export default function EsteticaFacial() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5D4037] mb-4">
            Estética Facial
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Rejuvenece y cuida tu piel con nuestros tratamientos faciales avanzados. Resultados visibles desde la primera sesión.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FACIAL_SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
      <FloatingReservationButton />
    </div>
  );
}
