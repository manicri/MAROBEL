-- Cambio puntual: renombrar Polygel y conservar el ID existente.
-- Ejecuta en Supabase > SQL Editor si ya corriste el catalogo completo antes.

UPDATE public.servicios
SET nombre = 'Manicura Polygel'
WHERE nombre = 'Manicura técnica Polygel';

UPDATE public.servicios
SET nombre = 'Manicura Polygel'
WHERE nombre = 'Manicura tecnica de pygel';
