import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Sparkles, Heart, Droplets, Star } from 'lucide-react';
import { supabase } from '../supabase';

const defaultIcons: Record<string, any> = {
  'Cabello': Scissors,
  'Uñas': Star,
  'Estética Facial': Sparkles,
  'Rituales Spa': Heart,
};

interface Category {
  id: string;
  nombre: string;
}

export const ServiceSidebar: React.FC = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categorias').select('*');
      if (data) setCategories(data);
    };

    fetchCategories();

    const channel = supabase.channel('sidebar_categorias')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, fetchCategories)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', nombre: 'Cabello' },
    { id: '2', nombre: 'Uñas' },
    { id: '3', nombre: 'Estética Facial' },
    { id: '4', nombre: 'Rituales Spa' }
  ];

  return (
    <aside className="w-full md:w-64 bg-white rounded-3xl shadow-xl border border-[#E5D3B3]/20 p-6 h-fit shrink-0">
      <h3 className="text-sm font-bold text-[#5D4037] uppercase tracking-widest mb-6 border-b border-[#E5D3B3]/30 pb-4">
        Nuestros Servicios
      </h3>
      <nav className="flex flex-col gap-2">
        {displayCategories.map((category) => {
          const path = `/${category.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`;
          const isActive = location.pathname === path;
          const Icon = defaultIcons[category.nombre] || Sparkles;
          
          return (
            <Link
              key={category.id}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[#5D4037] text-white shadow-md' 
                  : 'text-[#5D4037]/70 hover:bg-[#E5D3B3]/20 hover:text-[#5D4037]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E5D3B3]' : ''}`} />
              <span className="font-medium text-sm">{category.nombre}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
