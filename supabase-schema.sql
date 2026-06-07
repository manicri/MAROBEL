-- MAROBEL COMMAND CENTER v10.0 SCHEMA
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.categorias (nombre) VALUES
('Pestañas'), ('Masajes'), ('Maquillaje'), ('Cabello'), ('Uñas'), ('Estética Facial'), ('Rituales Spa')
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

INSERT INTO public.servicios (nombre, descripcion, precio, duracion, categoria, imagen_url)
SELECT 'Peeling Corporal', 'Renovación profunda de la piel con exfoliación y hidratación intensa.', 80.00, '90 min', 'Rituales Spa', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.servicios WHERE nombre = 'Peeling Corporal');

-- 3. Tabla de Bloqueos
CREATE TABLE IF NOT EXISTS public.bloqueos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME,
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Storage para imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('servicios-images', 'servicios-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'servicios-images');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'servicios-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'servicios-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'servicios-images' AND auth.role() = 'authenticated');

-- 5. Políticas RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada categorias" ON public.categorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura pública servicios" ON public.servicios FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada servicios" ON public.servicios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura pública bloqueos" ON public.bloqueos FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada bloqueos" ON public.bloqueos FOR ALL USING (auth.role() = 'authenticated');

-- 6. Realtime para el panel administrativo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'citas'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.citas;
    END IF;
END $$;

-- 7. Registro privado para evitar mensajes duplicados de WhatsApp
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
-- No se crean políticas públicas: solo la Edge Function con service_role puede acceder.
