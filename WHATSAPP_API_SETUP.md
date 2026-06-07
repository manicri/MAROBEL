# Activar WhatsApp Cloud API en Marobel

El codigo ya envia automaticamente:

- Una confirmacion al cliente cuando solicita una reserva.
- Una alerta al WhatsApp del administrador cuando entra una reserva.
- Una actualizacion al cliente cuando la cita se acepta o rechaza.

WhatsApp exige plantillas aprobadas para estos mensajes porque son iniciados por la empresa.

## 1. Preparar Meta WhatsApp Business

1. Entra en Meta for Developers y crea una app de tipo Business.
2. Agrega el producto WhatsApp.
3. En WhatsApp > API Setup registra el numero empresarial.
4. Obtén el `Phone number ID`.
5. Crea un token permanente de System User con permiso `whatsapp_business_messaging`.

Para pruebas puedes usar el numero de prueba de Meta, pero solo enviara a destinatarios agregados como testers.

## 2. Crear las plantillas

En WhatsApp Manager > Message templates crea estas plantillas como categoria `UTILITY` y lenguaje Espanol (`es`). Respeta el orden de variables.

### `reserva_recibida`

```text
Hola {{1}}, recibimos tu solicitud en Marobel para {{2}}, el {{3}} a las {{4}}. Te avisaremos cuando sea confirmada.
```

Ejemplos: Ana / Uñas acrilicas / 2026-06-10 / 10:30

### `nueva_reserva_admin`

```text
Nueva reserva: {{1}} solicito {{2}} para el {{3}} a las {{4}}. WhatsApp del cliente: {{5}}.
```

Ejemplos: Ana / Uñas acrilicas / 2026-06-10 / 10:30 / 593999999999

### `estado_reserva`

```text
Hola {{1}}, tu cita de {{2}} para el {{3}} a las {{4}} fue {{5}}.
```

Ejemplos: Ana / Uñas acrilicas / 2026-06-10 / 10:30 / aceptada

Espera hasta que Meta marque las tres plantillas como `APPROVED`.

## 3. Preparar Supabase

Ejecuta la seccion 7 de `supabase-schema.sql`. Solo crea el registro que evita mensajes duplicados.

En Supabase > Edge Functions crea `send-whatsapp`, pega `supabase/functions/send-whatsapp/index.ts` y desactiva `Verify JWT`.

## 4. Secretos de la Edge Function

En Supabase > Edge Functions > Secrets agrega:

```text
WHATSAPP_ACCESS_TOKEN=TOKEN_PERMANENTE_DE_META
WHATSAPP_PHONE_NUMBER_ID=PHONE_NUMBER_ID_DE_META
WHATSAPP_ADMIN_PHONE=593969272530
WHATSAPP_WEBHOOK_SECRET=UNA_CLAVE_LARGA_Y_PRIVADA
WHATSAPP_GRAPH_VERSION=v25.0
WHATSAPP_TEMPLATE_LANGUAGE=es
WHATSAPP_TEMPLATE_CUSTOMER_CREATED=reserva_recibida
WHATSAPP_TEMPLATE_ADMIN_CREATED=nueva_reserva_admin
WHATSAPP_TEMPLATE_STATUS=estado_reserva
```

No subas el token de Meta ni `WHATSAPP_WEBHOOK_SECRET` a GitHub.

## 5. Database Webhook

En Supabase > Database > Webhooks crea:

- Nombre: `send-reservation-whatsapp`
- Tabla: `public.citas`
- Eventos: `INSERT` y `UPDATE`
- Metodo: `POST`
- URL: `https://urrbofvaftsfeiasrceo.supabase.co/functions/v1/send-whatsapp`
- Encabezado: `x-webhook-secret` con el mismo valor de `WHATSAPP_WEBHOOK_SECRET`

## 6. Numeros telefonicos

Los clientes deben escribir su WhatsApp con codigo de pais. La funcion tambien convierte numeros ecuatorianos como `0969272530` a `593969272530`.

Haz una reserva de prueba. Revisa Edge Functions > Logs y Database > Webhooks > Logs si el mensaje no llega.
