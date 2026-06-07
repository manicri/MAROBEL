-- Ejecuta este archivo en Supabase > SQL Editor si la carga de imagenes
-- muestra un error de RLS, policy o permisos del bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('servicios-images', 'servicios-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'servicios-images');

CREATE POLICY "Auth Insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'servicios-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Auth Update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'servicios-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'servicios-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Auth Delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'servicios-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
