import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Sparkles, Heart, Droplets } from 'lucide-react';

const services = [
  { path: '/cabello', name: 'Cabello', icon: Scissors },
  { path: '/unas', name: 'Uñas', icon: Sparkles },
  { path: '/estetica-facial', name: 'Estética Facial', icon: Heart },
  { path: '/rituales', name: 'Rituales', icon: Droplets },
];

export const ServiceSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-full md:w-64 bg-white rounded-3xl shadow-xl border border-[#E5D3B3]/20 p-6 h-fit shrink-0">
      <h3 className="text-sm font-bold text-[#5D4037] uppercase tracking-widest mb-6 border-b border-[#E5D3B3]/30 pb-4">
        Nuestros Servicios
      </h3>
      <nav className="flex flex-col gap-2">
        {services.map((service) => {
          const isActive = location.pathname === service.path;
          const Icon = service.icon;
          return (
            <Link
              key={service.path}
              to={service.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[#5D4037] text-white shadow-md' 
                  : 'text-[#5D4037]/70 hover:bg-[#E5D3B3]/20 hover:text-[#5D4037]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E5D3B3]' : ''}`} />
              <span className="font-medium text-sm">{service.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
