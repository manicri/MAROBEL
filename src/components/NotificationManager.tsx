import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

const showBrowserNotification = (title: string, body: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (window.Notification.permission !== 'granted') return;

  new window.Notification(title, {
    body,
    icon: '/favicon.png',
    tag: `marobel-${title}-${body}`,
  });
};

const notifyOnce = (key: string, title: string, description: string, kind: 'success' | 'info' = 'info') => {
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, 'true');

  toast[kind](title, {
    description,
    duration: 8000,
  });
  showBrowserNotification(title, description);
};

export function NotificationManager() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkUpcomingAppointments = async () => {
      if (isAdmin) return;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .eq('cliente_email', user.email)
        .in('Estado', ['aceptada', 'Aceptada'])
        .in('fecha', [todayStr, tomorrowStr]);

      if (error || !data) return;

      data.forEach((appointment) => {
        const reminderKey = `reminder_${appointment.cita}_${appointment.fecha}`;
        if (localStorage.getItem(reminderKey)) return;

        const dayText = appointment.fecha === todayStr ? 'HOY' : 'MAÑANA';
        const description = `Tienes una cita para ${appointment.Servicio} ${dayText} a las ${appointment.hora}. ¡Te esperamos!`;

        toast('¡Recordatorio de cita!', {
          description,
          duration: 10000,
          icon: '📅',
        });
        showBrowserNotification('Recordatorio de cita', description);
        localStorage.setItem(reminderKey, 'true');
      });
    };

    checkUpcomingAppointments();

    const clientChannel = supabase
      .channel(`client_notifications_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'citas' },
        (payload) => {
          const appointment = payload.new;
          const belongsToClient = appointment.Usuario_id === user.id || appointment.cliente_email === user.email;
          if (!belongsToClient || isAdmin) return;

          const description = `${appointment.Servicio} para el ${appointment.fecha} a las ${appointment.hora}. Te avisaremos cuando sea confirmada.`;
          notifyOnce(`client_created_${appointment.cita || appointment.id}`, '¡Reserva recibida!', description, 'success');
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'citas' },
        (payload) => {
          const appointment = payload.new;
          const belongsToClient = appointment.Usuario_id === user.id || appointment.cliente_email === user.email;
          if (!belongsToClient || isAdmin || payload.old?.Estado === appointment.Estado) return;

          const description = `Tu cita para ${appointment.Servicio} ahora está: ${appointment.Estado}.`;
          notifyOnce(
            `client_status_${appointment.cita || appointment.id}_${appointment.Estado}`,
            '¡Actualización de cita!',
            description,
            'success'
          );
        }
      )
      .subscribe();

    let adminChannel: ReturnType<typeof supabase.channel> | null = null;
    if (isAdmin) {
      adminChannel = supabase
        .channel(`admin_notifications_${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'citas' },
          (payload) => {
            const appointment = payload.new;
            const description = `${appointment.Nombre_cliente} reservó ${appointment.Servicio} para el ${appointment.fecha} a las ${appointment.hora}.`;
            notifyOnce(
              `admin_created_${appointment.cita || appointment.id}`,
              '¡Nueva reserva!',
              description,
              'info'
            );
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
