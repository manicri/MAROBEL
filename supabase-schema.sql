-- MAROBEL COMMAND CENTER v10.0 SCHEMA
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insertar categorías iniciales (Azar)
INSERT INTO public.categorias (nombre) VALUES 
('Pestañas'), 
('Masajes'), 
('Maquillaje'),
('Cabello'),
('Uñas'),
('Estética Facial'),
('Rituales Spa')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Tabla de Servicios
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

-- Insertar servicio inicial (Peeling Corporal)
INSERT INTO public.servicios (nombre, descripcion, precio, duracion, categoria, imagen_url)
SELECT 'Peeling Corporal', 'Renovación profunda de la piel con exfoliación y hidratación intensa.', 80.00, '90 min', 'Rituales Spa', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop'
WHERE NOT EXISTS (
    SELECT 1 FROM public.servicios WHERE nombre = 'Peeling Corporal'
);

-- 3. Tabla de Bloqueos (Calendario)
CREATE TABLE IF NOT EXISTS public.bloqueos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME, -- Si es NULL, bloquea todo el día
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Storage Bucket para Imágenes de Servicios
INSERT INTO storage.buckets (id, name, public) VALUES ('servicios-images', 'servicios-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (Permitir lectura pública y escritura autenticada)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'servicios-images');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'servicios-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'servicios-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'servicios-images' AND auth.role() = 'authenticated');

-- 5. Políticas RLS para las nuevas tablas (Lectura pública, escritura autenticada)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada categorias" ON public.categorias FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública servicios" ON public.servicios FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada servicios" ON public.servicios FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública bloqueos" ON public.bloqueos FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada bloqueos" ON public.bloqueos FOR ALL USING (auth.role() = 'authenticated');

-- 6. Realtime para notificaciones de reservas
-- Este bloque es seguro aunque la tabla citas ya esté habilitada.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'citas'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.citas;
    END IF;
END $$;

-- 7. Tokens de telefonos para Firebase Cloud Messaging
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_is_admin_idx ON public.push_subscriptions(is_admin);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura propia push" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Eliminar push propio" ON public.push_subscriptions;

CREATE POLICY "Lectura propia push" ON public.push_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Eliminar push propio" ON public.push_subscriptions
FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.register_push_subscription(p_token TEXT, p_user_agent TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_email TEXT := COALESCE(auth.jwt() ->> 'email', '');
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesion para activar notificaciones';
    END IF;

    INSERT INTO public.push_subscriptions (token, user_id, email, is_admin, user_agent, updated_at)
    VALUES (
        p_token,
        auth.uid(),
        current_email,
        current_email = 'crisdelrobbys@gmail.com',
        p_user_agent,
        NOW()
    )
    ON CONFLICT (token) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        email = EXCLUDED.email,
        is_admin = EXCLUDED.is_admin,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.register_push_subscription(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_push_subscription(TEXT, TEXT) TO authenticated;
