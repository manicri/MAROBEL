# Configuracion de notificaciones Marobel

Esta web ya tiene el codigo para enviar una notificacion cuando el administrador acepta una cita:

- Correo al cliente con fecha, hora, servicio y notas.
- WhatsApp al cliente con los mismos detalles.

El envio ocurre desde la Edge Function de Supabase `notify-appointment`.

## 1. Crear o verificar la tabla anti-duplicados

En Supabase, entra a **SQL Editor** y ejecuta esto si todavia no tienes la tabla:

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (appointment_id, event_type, recipient)
);

ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;
```

## 2. Activar Realtime para citas

El panel admin escucha cuando una cita cambia a `aceptada`. Verifica en Supabase:

**Database > Replication > Supabase Realtime**

Activa la tabla:

- `public.citas`

Si ya se actualizan las citas en vivo en el panel admin, probablemente esto ya esta listo.

## 3. Configurar secretos de Supabase

En Supabase entra a:

**Project Settings > Edge Functions > Secrets**

Agrega estos secretos:

```txt
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM_EMAIL=Marobel Beauty Studio <reservas@tudominio.com>
WHATSAPP_ACCESS_TOKEN=tu_token_de_meta_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_de_meta
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```

Notas:

- `SUPABASE_SERVICE_ROLE_KEY` sirve para evitar que se envie dos veces la misma confirmacion.
- `RESEND_FROM_EMAIL` debe usar un dominio verificado en Resend para produccion.
- Si todavia no tienes dominio verificado en Resend, puedes probar con el remitente de prueba de Resend, pero tiene limites.

## 4. Desplegar la Edge Function

Si usas Supabase CLI:

```bash
supabase functions deploy notify-appointment
```

Si no usas CLI, crea la funcion en el panel de Supabase con el nombre:

```txt
notify-appointment
```

y copia el contenido de:

```txt
supabase/functions/notify-appointment/index.ts
```

## 5. Importante sobre WhatsApp API

La funcion envia un mensaje de texto por WhatsApp Cloud API. En produccion, Meta puede exigir plantillas aprobadas si el cliente no ha escrito al negocio dentro de la ventana de 24 horas.

Si WhatsApp rechaza el mensaje con un error de plantilla, hay que crear una plantilla aprobada en Meta y ajustar la funcion para usar `type: "template"`.

## 6. Prueba final

1. Entra al panel admin.
2. Abre una cita pendiente.
3. Presiona **Aceptar**.
4. El cliente debe recibir correo y WhatsApp.
5. Si falla, revisa los logs en Supabase: **Edge Functions > notify-appointment > Logs**.
