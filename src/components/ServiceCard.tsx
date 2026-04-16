import React from 'react';
import { motion } from 'framer-motion';
import { useSelection, ServiceItem } from '../context/SelectionContext';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ServicePlaceholder from './ServicePlaceholder';

interface ServiceCardProps {
  key?: React.Key;
  service: ServiceItem;
  imageUrl?: string;
}

export default function ServiceCard({ service, imageUrl }: ServiceCardProps) {
  const { selectedServices, addService, removeService } = useSelection();
  const isSelected = selectedServices.some((s) => s.id === service.id);

  const toggleSelection = () => {
    if (isSelected) {
      removeService(service.id);
    } else {
      addService(service);
    }
  };

  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 border-2 cursor-pointer flex flex-col h-full",
          isSelected ? "border-[#5D4037]" : "border-transparent hover:shadow-lg"
        )
      )}
      onClick={toggleSelection}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={service.name} className="w-full h-48 object-cover" />
      ) : (
        <ServicePlaceholder />
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-[#5D4037]">{service.name}</h3>
          <span className="text-lg font-bold text-[#8D6E63]">${service.price.toFixed(2)}</span>
        </div>
        {service.duration && (
          <p className="text-xs text-[#5D4037]/60 font-medium uppercase tracking-widest mb-3">
            ⏱ {service.duration}
          </p>
        )}
        {service.description && (
          <p className="text-sm text-[#5D4037]/70 mb-6 flex-grow">
            {service.description}
          </p>
        )}
        <button
          className={twMerge(
            clsx(
              "w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-auto",
              isSelected
                ? "bg-[#E5D3B3] text-[#5D4037]"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )
          )}
        >
          {isSelected ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
              Seleccionado
            </>
          ) : (
            "Seleccionar"
          )}
        </button>
      </div>
    </div>
  );
}
