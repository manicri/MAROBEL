-- MAROBEL COMMAND CENTER v10.0 SCHEMA
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Tablas principales
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC NOT NULL,
    duracion TEXT,
    categoria TEXT,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.bloqueos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME,
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.categorias (nombre) VALUES
('Pestañas'), ('Masajes'), ('Maquillaje'), ('Cabello'), ('Uñas'), ('Estética Facial'), ('Rituales Spa')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Administradores autorizados
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Consultar acceso admin propio" ON public.admins;
CREATE POLICY "Consultar acceso admin propio" ON public.admins FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()); $$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Ejecuta después de iniciar sesión al menos una vez con la cuenta administradora.
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'crisdelrobbys@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Storage para imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('servicios-images', 'servicios-images', true)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'servicios-images');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'servicios-images' AND public.is_admin());
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'servicios-images' AND public.is_admin());
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'servicios-images' AND public.is_admin());

-- 4. Políticas RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública categorias" ON public.categorias;
DROP POLICY IF EXISTS "Escritura autenticada categorias" ON public.categorias;
DROP POLICY IF EXISTS "Administrar categorias" ON public.categorias;
CREATE POLICY "Lectura pública categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Administrar categorias" ON public.categorias FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lectura pública servicios" ON public.servicios;
DROP POLICY IF EXISTS "Escritura autenticada servicios" ON public.servicios;
DROP POLICY IF EXISTS "Administrar servicios" ON public.servicios;
CREATE POLICY "Lectura pública servicios" ON public.servicios FOR SELECT USING (true);
CREATE POLICY "Administrar servicios" ON public.servicios FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lectura pública bloqueos" ON public.bloqueos;
DROP POLICY IF EXISTS "Escritura autenticada bloqueos" ON public.bloqueos;
DROP POLICY IF EXISTS "Administrar bloqueos" ON public.bloqueos;
CREATE POLICY "Lectura pública bloqueos" ON public.bloqueos FOR SELECT USING (true);
CREATE POLICY "Administrar bloqueos" ON public.bloqueos FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Realtime para el panel
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'citas'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.citas;
    END IF;
END $$;

-- 6. Registro privado para evitar mensajes duplicados de WhatsApp
DROP FUNCTION IF EXISTS public.register_push_subscription(TEXT, TEXT);
DROP TABLE IF EXISTS public.push_subscriptions;
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
