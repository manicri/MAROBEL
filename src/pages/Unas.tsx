import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {UNAS_SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
      <FloatingReservationButton />
    </div>
  );
}
