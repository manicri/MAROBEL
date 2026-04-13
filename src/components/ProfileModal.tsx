import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ displayName, phone });
      toast.success('Perfil actualizado correctamente');
      onClose();
    } catch (error: any) {
      toast.error('Error al actualizar el perfil', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, we might get an error. We'll show a friendly message.
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('El bucket "avatars" no existe en Supabase Storage. Por favor créalo para subir imágenes.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ photoURL: publicUrl });
      toast.success('Foto de perfil actualizada');
    } catch (error: any) {
      toast.error('Error al subir la foto', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5D4037]/40 hover:text-[#5D4037] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-2xl font-serif text-[#5D4037] mb-6 text-center">Mi Perfil</h3>

          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#E5D3B3]/30 relative">
                <img 
                  src={profile?.photoURL || user.user_metadata?.avatar_url || 'https://via.placeholder.com/150'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#5D4037]/50 mt-3 font-bold">
              Cambiar Foto
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">Nombre Completo</Label>
              <Input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-[#FAF9F6] border-none h-12 rounded-xl text-sm" 
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#5D4037]/80 uppercase text-[10px] tracking-[0.2em] font-bold">Teléfono / WhatsApp</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#FAF9F6] border-none h-12 rounded-xl text-sm" 
                placeholder="0987654321"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading}
              className="w-full bg-[#5D4037] hover:bg-[#4a332c] text-white h-12 rounded-full text-xs uppercase tracking-[0.2em] font-bold mt-4"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
