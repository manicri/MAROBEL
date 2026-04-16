import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Edit2, Plus, Image as ImageIcon, Tag, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  originalPrice?: number;
  discountPrice: number;
  services: string[]; // IDs of included services
  imageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  badge?: 'OFERTA' | 'POPULAR' | 'LIMITADO' | '';
}

interface AdminPromotionsProps {
  services: any[];
}

export const AdminPromotions: React.FC<AdminPromotionsProps> = ({ services }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<Partial<Promotion>>({
    name: '',
    description: '',
    discountPrice: 0,
    services: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    badge: 'OFERTA'
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('marobel_promotions');
    if (saved) {
      try {
        setPromotions(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing promotions', e);
      }
    }
  }, []);

  // Save to localStorage whenever promotions change
  useEffect(() => {
    localStorage.setItem('marobel_promotions', JSON.stringify(promotions));
  }, [promotions]);

  const handleSave = () => {
    if (!currentPromo.name || !currentPromo.description || !currentPromo.discountPrice || !currentPromo.startDate || !currentPromo.endDate) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (currentPromo.id) {
      // Update
      setPromotions(prev => prev.map(p => p.id === currentPromo.id ? currentPromo as Promotion : p));
      toast.success('Promoción actualizada exitosamente');
    } else {
      // Create
      const newPromo: Promotion = {
        ...(currentPromo as Promotion),
        id: `promo_${Date.now()}`
      };
      setPromotions(prev => [...prev, newPromo]);
      toast.success('Promoción creada exitosamente');
    }

    setIsEditing(false);
    setCurrentPromo({
      name: '',
      description: '',
      discountPrice: 0,
      services: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      badge: 'OFERTA'
    });
  };

  const handleDelete = (id: string) => {
    toast(`¿Estás seguro de eliminar esta promoción?`, {
      action: {
        label: 'Eliminar',
        onClick: () => {
          setPromotions(prev => prev.filter(p => p.id !== id));
          toast.success('Promoción eliminada');
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const toggleStatus = (id: string) => {
    setPromotions(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = !p.isActive;
        toast.success(`Promoción ${newStatus ? 'activada' : 'desactivada'}`);
        return { ...p, isActive: newStatus };
      }
      return p;
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setCurrentPromo(prev => {
      const currentServices = prev.services || [];
      if (currentServices.includes(serviceId)) {
        return { ...prev, services: currentServices.filter(id => id !== serviceId) };
      } else {
        return { ...prev, services: [...currentServices, serviceId] };
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-[#5D4037]">Gestión de Promociones</h2>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-[#5D4037] text-white rounded-full px-6 text-xs uppercase tracking-widest font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Promoción
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <h3 className="text-xl font-serif text-[#5D4037] mb-6">
              {currentPromo.id ? 'Editar Promoción' : 'Crear Nueva Promoción'}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Nombre de la Promoción *</Label>
                  <Input 
                    value={currentPromo.name || ''} 
                    onChange={e => setCurrentPromo({...currentPromo, name: e.target.value})}
                    className="bg-[#FAF9F6] border-none rounded-xl h-12"
                    placeholder="Ej: Especial Día de la Madre"
                  />
                </div>
                
                <div>
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Descripción *</Label>
                  <textarea 
                    value={currentPromo.description || ''} 
                    onChange={e => setCurrentPromo({...currentPromo, description: e.target.value})}
                    className="w-full bg-[#FAF9F6] border-none rounded-xl p-4 text-sm min-h-[100px] outline-none resize-none"
                    placeholder="Describe los beneficios de esta promoción..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Precio Original ($)</Label>
                    <Input 
                      type="number"
                      value={currentPromo.originalPrice || ''} 
                      onChange={e => setCurrentPromo({...currentPromo, originalPrice: parseFloat(e.target.value)})}
                      className="bg-[#FAF9F6] border-none rounded-xl h-12"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Precio Promocional ($) *</Label>
                    <Input 
                      type="number"
                      value={currentPromo.discountPrice || ''} 
                      onChange={e => setCurrentPromo({...currentPromo, discountPrice: parseFloat(e.target.value)})}
                      className="bg-[#FAF9F6] border-none rounded-xl h-12"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Fecha Inicio *</Label>
                    <Input 
                      type="date"
                      value={currentPromo.startDate || ''} 
                      onChange={e => setCurrentPromo({...currentPromo, startDate: e.target.value})}
                      className="bg-[#FAF9F6] border-none rounded-xl h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Fecha Fin *</Label>
                    <Input 
                      type="date"
                      value={currentPromo.endDate || ''} 
                      onChange={e => setCurrentPromo({...currentPromo, endDate: e.target.value})}
                      className="bg-[#FAF9F6] border-none rounded-xl h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">URL de Imagen (Opcional)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={currentPromo.imageUrl || ''} 
                      onChange={e => setCurrentPromo({...currentPromo, imageUrl: e.target.value})}
                      className="bg-[#FAF9F6] border-none rounded-xl h-12 flex-1"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  {currentPromo.imageUrl && (
                    <div className="mt-4 h-32 rounded-xl overflow-hidden">
                      <img src={currentPromo.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Etiqueta (Badge)</Label>
                  <select 
                    value={currentPromo.badge || ''}
                    onChange={e => setCurrentPromo({...currentPromo, badge: e.target.value as any})}
                    className="w-full bg-[#FAF9F6] border-none rounded-xl h-12 px-4 outline-none text-sm text-[#5D4037]"
                  >
                    <option value="">Ninguna</option>
                    <option value="OFERTA">OFERTA</option>
                    <option value="POPULAR">POPULAR</option>
                    <option value="LIMITADO">LIMITADO</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5D4037]/60 mb-2 block">Servicios Incluidos</Label>
                  <div className="bg-[#FAF9F6] rounded-xl p-4 h-48 overflow-y-auto space-y-2">
                    {services.map(service => (
                      <label key={service.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={(currentPromo.services || []).includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="accent-[#5D4037] w-4 h-4"
                        />
                        <span className="text-sm text-[#5D4037]">{service.nombre} <span className="text-xs opacity-50">(${service.precio})</span></span>
                      </label>
                    ))}
                    {services.length === 0 && (
                      <p className="text-xs text-center text-[#5D4037]/50 py-4">No hay servicios disponibles. Agrega servicios primero.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#E5D3B3]/20">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPromo({
                    name: '', description: '', discountPrice: 0, services: [], 
                    startDate: new Date().toISOString().split('T')[0], 
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
                    isActive: true, badge: 'OFERTA'
                  });
                }}
                className="rounded-full px-8 text-xs uppercase tracking-widest font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-[#5D4037] text-white rounded-full px-8 text-xs uppercase tracking-widest font-bold"
              >
                Guardar Promoción
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {promotions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#E5D3B3]/20">
              <Tag className="w-12 h-12 text-[#E5D3B3] mx-auto mb-4" />
              <h3 className="text-xl font-serif text-[#5D4037] mb-2">No hay promociones</h3>
              <p className="text-[#5D4037]/60 text-sm">Crea tu primera promoción para atraer más clientes.</p>
            </div>
          ) : (
            promotions.map(promo => (
              <Card key={promo.id} className={`border-none shadow-md bg-white rounded-2xl overflow-hidden transition-all ${!promo.isActive ? 'opacity-60' : ''}`}>
                <div className="flex flex-col md:flex-row">
                  {promo.imageUrl && (
                    <div className="w-full md:w-48 h-48 md:h-auto">
                      <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-serif font-bold text-[#5D4037]">{promo.name}</h3>
                          {promo.badge && (
                            <span className="bg-[#E5D3B3] text-[#5D4037] text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                              {promo.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleStatus(promo.id)}
                            className={`p-2 rounded-full transition-colors ${promo.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                            title={promo.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {promo.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentPromo(promo);
                              setIsEditing(true);
                            }}
                            className="p-2 bg-[#E5D3B3]/20 text-[#5D4037] rounded-full hover:bg-[#E5D3B3]/40 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(promo.id)}
                            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#5D4037]/70 mb-4">{promo.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-[#5D4037]/60 mb-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{promo.startDate} al {promo.endDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{promo.services.length} servicios incluidos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-end gap-3 mt-auto">
                      <span className="text-2xl font-bold text-[#8D6E63]">${promo.discountPrice.toFixed(2)}</span>
                      {promo.originalPrice && (
                        <span className="text-sm text-[#5D4037]/40 line-through mb-1">${promo.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
