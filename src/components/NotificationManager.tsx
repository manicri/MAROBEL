import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

export function NotificationManager() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check for upcoming appointments (reminders)
    const checkUpcomingAppointments = async () => {
      if (isAdmin) return; // Admins don't need personal reminders here

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .eq('cliente_email', user.email)
        .eq('Estado', 'Aceptada')
        .in('fecha', [todayStr, tomorrowStr]);

      if (error || !data) return;

      data.forEach(app => {
        // Use localStorage to avoid spamming the reminder on every reload
        const reminderKey = `reminder_${app.cita}_${app.fecha}`;
        if (!localStorage.getItem(reminderKey)) {
          const isToday = app.fecha === todayStr;
          const dayText = isToday ? 'HOY' : 'MAÑANA';
          
          toast('¡Recordatorio de Cita!', {
            description: `Tienes una cita para ${app.Servicio} ${dayText} a las ${app.hora}. ¡Te esperamos!`,
            duration: 10000,
            icon: '📅',
          });
          
          localStorage.setItem(reminderKey, 'true');
        }
      });
    };

    checkUpcomingAppointments();

    // Client notifications: Listen for updates on their own appointments
    const clientChannel = supabase
      .channel('client_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'citas',
        },
        (payload) => {
          // Filter on the client side since Supabase filters might fail without replica identity
          if (payload.new.cliente_email === user.email) {
            const newStatus = payload.new.Estado;
            const service = payload.new.Servicio;
            
            toast.success(`¡Actualización de Cita!`, {
              description: `Tu cita para ${service} ahora está: ${newStatus}`,
              duration: 6000,
            });
          }
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
