import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import FloatingReservationButton from '../components/FloatingReservationButton';
import { ServiceSidebar } from '../components/ServiceSidebar';
import { ServiceItem } from '../context/SelectionContext';

const CABELLO_SERVICES: ServiceItem[] = [
  { id: 'c1', name: 'Corte de Cabello', price: 25, category: 'cabello' },
  { id: 'c2', name: 'Tinte Completo', price: 80, category: 'cabello' },
  { id: 'c3', name: 'Balayage', price: 120, category: 'cabello' },
  { id: 'c4', name: 'Tratamiento Capilar', price: 45, category: 'cabello' },
];

export default function Cabello() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5D4037] mb-4">
            Servicios de Cabello
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Transforma tu look con nuestros expertos en estilismo. Utilizamos los mejores productos para cuidar y embellecer tu cabello.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          <ServiceSidebar />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {CABELLO_SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
      <FloatingReservationButton />
    </div>
  );
}
