# Activar notificaciones push de Marobel

El codigo del sitio ya incluye Firebase Cloud Messaging, registro de telefonos y la Edge Function `send-push`. Para activarlo en produccion faltan estos pasos de configuracion.

## Compatibilidad

Esta integracion web con Firebase Cloud Messaging funciona en telefonos Android usando Chrome. Firebase Cloud Messaging para web no es compatible oficialmente con Safari de iPhone. Para iPhone se necesitaria una aplicacion iOS nativa o cambiar a otro proveedor de Web Push.

## 1. Crear la clave VAPID publica

1. Abre Firebase Console y selecciona `gen-lang-client-0393494087`.
2. Ve a Configuracion del proyecto > Cloud Messaging.
3. En `Web Push certificates`, genera una pareja de claves.
4. Copia la clave publica.
5. En Netlify > Site configuration > Environment variables crea:

```text
VITE_FIREBASE_VAPID_KEY=LA_CLAVE_PUBLICA
```

6. Ejecuta un nuevo deploy en Netlify.

## 2. Crear la tabla en Supabase

Ejecuta la seccion 7 de `supabase-schema.sql` en SQL Editor. Esta tabla guarda un token por telefono y la funcion SQL impide que un cliente se marque a si mismo como administrador.

## 3. Crear y desplegar la Edge Function

En Supabase > Edge Functions crea una funcion llamada `send-push` y pega el contenido de:

```text
supabase/functions/send-push/index.ts
```

Desactiva `Verify JWT` para esta funcion. La autenticacion se realiza con el encabezado privado del webhook.

## 4. Configurar secretos de la funcion

En Firebase Console > Configuracion del proyecto > Cuentas de servicio, genera una nueva clave privada JSON.

En Supabase > Edge Functions > Secrets agrega:

```text
FIREBASE_SERVICE_ACCOUNT={JSON COMPLETO DE LA CUENTA DE SERVICIO}
PUSH_WEBHOOK_SECRET=UNA_CLAVE_LARGA_Y_PRIVADA
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya existen automaticamente en las Edge Functions alojadas por Supabase.

## 5. Crear el Database Webhook

En Supabase > Database > Webhooks crea:

- Nombre: `send-reservation-push`
- Tabla: `public.citas`
- Eventos: `INSERT` y `UPDATE`
- Metodo: `POST`
- URL: `https://urrbofvaftsfeiasrceo.supabase.co/functions/v1/send-push`
- Encabezado: `x-webhook-secret` con el mismo valor de `PUSH_WEBHOOK_SECRET`

## 6. Activar un telefono Android

1. Abre Marobel en Chrome e inicia sesion.
2. Pulsa `Activar avisos` en el menu.
3. Acepta el permiso del sistema.

No compartas ni subas a GitHub el JSON de la cuenta de servicio ni `PUSH_WEBHOOK_SECRET`.
