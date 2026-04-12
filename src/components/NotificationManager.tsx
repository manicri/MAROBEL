import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

export function NotificationManager() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Client notifications: Listen for updates on their own appointments
    const clientChannel = supabase
      .channel('client_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'citas',
          filter: `cliente_email=eq.${user.email}`,
        },
        (payload) => {
          const newStatus = payload.new.Estado;
          const service = payload.new.Servicio;
          
          toast.success(`¡Actualización de Cita!`, {
            description: `Tu cita para ${service} ahora está: ${newStatus}`,
            duration: 6000,
          });
        }
      )
      .subscribe();

    // Admin notifications: Listen for new appointments created by any client
    let adminChannel: any = null;
    if (isAdmin) {
      adminChannel = supabase
        .channel('admin_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'citas',
          },
          (payload) => {
            const clientName = payload.new.Nombre_cliente;
            const service = payload.new.Servicio;
            const date = payload.new.fecha;
            const time = payload.new.hora;

            toast.info(`¡Nueva Reserva!`, {
              description: `${clientName} ha reservado ${service} para el ${date} a las ${time}`,
              duration: 8000,
            });
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(clientChannel);
      if (adminChannel) supabase.removeChannel(adminChannel);
    };
  }, [user, isAdmin]);

  return null;
}
