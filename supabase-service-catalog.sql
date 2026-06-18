-- CATALOGO ORDENADO DE SERVICIOS MAROBEL
-- Ejecuta este archivo una vez en Supabase > SQL Editor.
-- Actualiza nombres y precios, agrega servicios nuevos y conserva los IDs existentes cuando es posible.

ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS precio_desde BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS orden INTEGER;
ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS subcategoria TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS servicios_nombre_categoria_unique
ON public.servicios (nombre, categoria);

-- Renombrar registros existentes para conservar sus IDs e imágenes.
UPDATE public.servicios SET nombre = 'Manicura con Rubber Base' WHERE nombre = 'Manicura base Rubber';
UPDATE public.servicios SET nombre = 'Manicura Polygel' WHERE nombre = 'Manicura técnica Polygel';
UPDATE public.servicios SET nombre = 'Manicura en acrílico' WHERE nombre = 'Manicura técnica en acrílico';
UPDATE public.servicios SET nombre = 'Pedicura básica' WHERE nombre = 'Pedicura rusa, solo limpieza';
UPDATE public.servicios SET nombre = 'Visajismo, depilación, laminado e hidratación de cejas' WHERE nombre = 'Diseño de cejas con laminado e hidratación';
UPDATE public.servicios SET nombre = 'Visajismo, depilación, laminado y pigmentación de cejas con henna' WHERE nombre = 'Diseño integral de cejas con henna';
UPDATE public.servicios SET nombre = 'Extensiones de pestañas clásicas' WHERE nombre = 'Pestañas clásicas';
UPDATE public.servicios SET nombre = 'Extensiones de pestañas con volumen' WHERE nombre = 'Pestañas con volumen';
UPDATE public.servicios SET nombre = 'Retoque de raíz, hasta 2 cm de crecimiento' WHERE nombre = 'Retoque de raíz';
UPDATE public.servicios SET nombre = 'Tratamiento con células madre' WHERE nombre = 'Tratamiento de células madre';
UPDATE public.servicios SET nombre = 'Bótox nutritivo' WHERE nombre = 'Botox nutritivo';
UPDATE public.servicios SET nombre = 'Tratamiento de reconstrucción capilar' WHERE nombre = 'Reconstrucción capilar';
UPDATE public.servicios SET nombre = 'Tratamiento de repolarización capilar' WHERE nombre = 'Repolarización capilar';
UPDATE public.servicios SET nombre = 'Taninoplastia o alisado' WHERE nombre = 'Taninoplastia';
UPDATE public.servicios SET nombre = 'Limpieza facial exprés' WHERE nombre = 'Limpieza facial express';
UPDATE public.servicios SET nombre = 'Masaje de espalda, 30 minutos' WHERE nombre = 'Masaje de espalda';
UPDATE public.servicios SET nombre = 'Masaje de cuerpo entero, 1 hora' WHERE nombre = 'Masaje de cuerpo entero';
UPDATE public.servicios SET nombre = 'Cejas con hilo' WHERE nombre = 'Depilación con hilo - Cejas';
UPDATE public.servicios SET nombre = 'Bozo con hilo' WHERE nombre = 'Depilación con hilo - Bigote';
UPDATE public.servicios SET nombre = 'Bozo con cera' WHERE nombre = 'Depilación con cera - Bigote';
UPDATE public.servicios SET nombre = 'Cejas con cera' WHERE nombre = 'Depilación con cera - Cejas';
UPDATE public.servicios SET nombre = 'Axilas con cera' WHERE nombre = 'Depilación con cera - Axilas';
UPDATE public.servicios SET nombre = 'Rostro completo con cera' WHERE nombre = 'Depilación con cera - Rostro';
UPDATE public.servicios SET nombre = 'Brazos con cera' WHERE nombre = 'Depilación con cera - Brazos';
UPDATE public.servicios SET nombre = 'Media pierna con cera' WHERE nombre = 'Depilación con cera - Media pierna';
UPDATE public.servicios SET nombre = 'Bikini con cera' WHERE nombre = 'Depilación con cera - Bikini';
UPDATE public.servicios SET nombre = 'Piernas completas con cera' WHERE nombre = 'Depilación con cera - Pierna entera';
UPDATE public.servicios SET nombre = 'Bikini brasileño con cera' WHERE nombre = 'Depilación con cera - Bikini brasilero';
UPDATE public.servicios SET nombre = 'Maquillaje exprés' WHERE nombre = 'Maquillaje express';
UPDATE public.servicios SET nombre = 'Maquillaje para novia' WHERE nombre = 'Maquillaje de novia';
UPDATE public.servicios SET categoria = 'Cosmetología y cuidado facial' WHERE categoria = 'Cosmetología';
UPDATE public.servicios SET categoria = 'Maquillaje profesional' WHERE categoria = 'Maquillaje';

DELETE FROM public.servicios WHERE nombre IN ('Manicura técnica Kapping', 'Laminado de cejas');

INSERT INTO public.categorias (nombre) VALUES
  ('Manicura y pedicura'), ('Cejas'), ('Pestañas'), ('Peluquería'),
  ('Cosmetología y cuidado facial'), ('Maquillaje profesional')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.servicios
  (nombre, descripcion, precio, precio_desde, duracion, categoria, subcategoria, orden)
VALUES
  ('Manicura tradicional', 'Cuidado, limpieza y acabado tradicional para manos.', 10, false, '', 'Manicura y pedicura', 'Manicura', 1),
  ('Manicura semipermanente', 'Esmaltado semipermanente de larga duración.', 15, false, '', 'Manicura y pedicura', 'Manicura', 2),
  ('Manicura con Rubber Base', 'Refuerzo y nivelación de la uña natural con Rubber Base.', 20, false, '', 'Manicura y pedicura', 'Manicura', 3),
  ('Manicura técnica Soft Gel', 'Extensión de uñas con técnica Soft Gel.', 25, false, '', 'Manicura y pedicura', 'Manicura', 4),
  ('Manicura con gel de construcción', 'Construcción y refuerzo de uñas cortas o largas con gel.', 25, true, '', 'Manicura y pedicura', 'Manicura', 5),
  ('Manicura Polygel', 'Extensión o refuerzo de uñas con técnica Polygel.', 25, true, '', 'Manicura y pedicura', 'Manicura', 6),
  ('Manicura en acrílico', 'Extensión en acrílico; el valor final depende del tamaño.', 25, true, '', 'Manicura y pedicura', 'Manicura', 7),
  ('Pedicura spa', 'Cuidado relajante e hidratante para los pies.', 10, false, '', 'Manicura y pedicura', 'Pedicura', 8),
  ('Pedicura básica', 'Limpieza técnica profunda de uñas y cutículas.', 10, false, '', 'Manicura y pedicura', 'Pedicura', 9),
  ('Pedicura tradicional', 'Cuidado y acabado tradicional para pies.', 12, false, '', 'Manicura y pedicura', 'Pedicura', 10),
  ('Pedicura semipermanente', 'Pedicura con esmaltado semipermanente.', 15, false, '', 'Manicura y pedicura', 'Pedicura', 11),
  ('Pedicura Spa + Semipermanente', 'Pedicura spa con esmaltado semipermanente.', 25, false, '', 'Manicura y pedicura', 'Pedicura', 12),
  ('Pedicura con Rubber Base', 'Nivelación y refuerzo con Rubber Base.', 18, false, '', 'Manicura y pedicura', 'Pedicura', 13),
  ('Pedicura con gel de construcción', 'Refuerzo y estructura con gel de construcción.', 20, false, '', 'Manicura y pedicura', 'Pedicura', 14),

  ('Visajismo y laminado de cejas', 'Diseño mediante visajismo y laminado.', 15, false, '', 'Cejas', 'Diseño y cuidado de cejas', 15),
  ('Pigmentación de cejas con henna', 'Definición temporal mediante henna.', 15, false, '', 'Cejas', 'Diseño y cuidado de cejas', 16),
  ('Visajismo, depilación, laminado e hidratación de cejas', 'Diseño completo con hidratación.', 25, false, '', 'Cejas', 'Diseño y cuidado de cejas', 17),
  ('Visajismo, depilación, laminado y pigmentación de cejas con henna', 'Diseño integral con henna.', 35, false, '', 'Cejas', 'Diseño y cuidado de cejas', 18),
  ('Microblading', 'Técnica pelo a pelo para definir las cejas.', 80, false, '', 'Cejas', 'Micropigmentación', 19),
  ('Microshading', 'Micropigmentación con acabado sombreado.', 100, false, '', 'Cejas', 'Micropigmentación', 20),
  ('Efecto polvo', 'Micropigmentación con acabado suave tipo maquillaje.', 120, false, '', 'Cejas', 'Micropigmentación', 21),

  ('Pestañas punto por punto', 'Aplicación de pestañas punto por punto.', 15, false, '', 'Pestañas', 'Pestañas', 22),
  ('Lifting de pestañas', 'Elevación y curvatura de pestañas naturales.', 25, false, '', 'Pestañas', 'Pestañas', 23),
  ('Lifting de pestañas con pigmentación', 'Lifting con pigmentación.', 30, false, '', 'Pestañas', 'Pestañas', 24),
  ('Extensiones de pestañas clásicas', 'Extensiones clásicas con resultado natural.', 30, false, '', 'Pestañas', 'Pestañas', 25),
  ('Extensiones de pestañas con volumen', 'Extensiones con volumen personalizado.', 45, false, '', 'Pestañas', 'Pestañas', 26),

  ('Corte de cabello', 'Corte personalizado.', 20, false, '', 'Peluquería', 'Corte, cepillado y peinados', 27),
  ('Cepillado', 'Secado y moldeado profesional.', 20, false, '', 'Peluquería', 'Corte, cepillado y peinados', 28),
  ('Planchado', 'Alisado temporal con plancha profesional.', 20, false, '', 'Peluquería', 'Corte, cepillado y peinados', 29),
  ('Peinados', 'Peinado profesional para eventos.', 25, true, '', 'Peluquería', 'Corte, cepillado y peinados', 30),
  ('Retoque de raíz, hasta 2 cm de crecimiento', 'Tinturado de raíz hasta 2 cm.', 35, false, '', 'Peluquería', 'Coloración', 31),
  ('Tinte completo', 'Coloración completa según largo y cantidad.', 60, true, '', 'Peluquería', 'Coloración', 32),
  ('Mechas', 'Iluminación mediante mechas.', 80, true, '', 'Peluquería', 'Coloración', 33),
  ('Rayitos', 'Iluminación fina distribuida.', 80, true, '', 'Peluquería', 'Coloración', 34),
  ('Ombré', 'Coloración degradada hacia puntas claras.', 80, true, '', 'Peluquería', 'Coloración', 35),
  ('Highlights', 'Iluminaciones estratégicas.', 80, true, '', 'Peluquería', 'Coloración', 36),
  ('Balayage', 'Iluminación degradada y personalizada.', 100, true, '', 'Peluquería', 'Coloración', 37),
  ('Tratamiento de hidratación', 'Recupera hidratación, suavidad y brillo.', 25, true, '', 'Peluquería', 'Tratamientos capilares', 38),
  ('Tratamiento con células madre', 'Tratamiento capilar reparador.', 30, true, '', 'Peluquería', 'Tratamientos capilares', 39),
  ('Bótox nutritivo', 'Tratamiento nutritivo para suavidad y brillo.', 35, true, '', 'Peluquería', 'Tratamientos capilares', 40),
  ('Tratamiento de reconstrucción capilar', 'Tratamiento para cabello debilitado.', 40, true, '', 'Peluquería', 'Tratamientos capilares', 41),
  ('Tratamiento antifrizz', 'Control del frizz y disciplina capilar.', 50, true, '', 'Peluquería', 'Tratamientos capilares', 42),
  ('Tratamiento de repolarización capilar', 'Nutrición profunda de la fibra capilar.', 60, false, '', 'Peluquería', 'Tratamientos capilares', 43),
  ('Detox capilar', 'Limpieza profunda capilar.', 60, false, '', 'Peluquería', 'Tratamientos capilares', 44),
  ('Taninoplastia o alisado', 'Alisado y control de volumen.', 70, true, '', 'Peluquería', 'Tratamientos capilares', 45),

  ('Limpieza facial exprés', 'Limpieza rápida para refrescar la piel.', 25, false, '', 'Cosmetología y cuidado facial', 'Limpiezas faciales', 46),
  ('Limpieza facial profunda', 'Protocolo completo de limpieza facial.', 35, false, '', 'Cosmetología y cuidado facial', 'Limpiezas faciales', 47),
  ('Masaje de espalda, 30 minutos', 'Masaje localizado para aliviar tensión.', 35, false, '30 min', 'Cosmetología y cuidado facial', 'Masajes', 48),
  ('Masaje de cuerpo entero, 1 hora', 'Masaje corporal completo.', 50, false, '60 min', 'Cosmetología y cuidado facial', 'Masajes', 49),
  ('Cejas con hilo', 'Diseño y depilación de cejas con hilo.', 8, false, '', 'Cosmetología y cuidado facial', 'Depilación con hilo', 50),
  ('Bozo con hilo', 'Depilación del bozo con hilo.', 7, false, '', 'Cosmetología y cuidado facial', 'Depilación con hilo', 51),
  ('Bozo con cera', 'Depilación del bozo con cera.', 5, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 52),
  ('Cejas con cera', 'Diseño y depilación de cejas con cera.', 10, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 53),
  ('Axilas con cera', 'Depilación de axilas con cera.', 12, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 54),
  ('Rostro completo con cera', 'Depilación completa del rostro.', 25, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 55),
  ('Brazos con cera', 'Depilación de brazos con cera.', 25, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 56),
  ('Media pierna con cera', 'Depilación de media pierna.', 25, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 57),
  ('Bikini con cera', 'Depilación de línea de bikini.', 25, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 58),
  ('Piernas completas con cera', 'Depilación de piernas completas.', 35, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 59),
  ('Bikini brasileño con cera', 'Depilación estilo bikini brasileño.', 35, false, '', 'Cosmetología y cuidado facial', 'Depilación con cera', 60),

  ('Maquillaje exprés', 'Maquillaje ligero y rápido.', 25, false, '', 'Maquillaje profesional', 'Maquillaje profesional', 61),
  ('Maquillaje social', 'Maquillaje para eventos sociales.', 40, false, '', 'Maquillaje profesional', 'Maquillaje profesional', 62),
  ('Maquillaje de noche', 'Maquillaje de mayor intensidad.', 50, false, '', 'Maquillaje profesional', 'Maquillaje profesional', 63),
  ('Maquillaje para novia', 'Maquillaje profesional de larga duración.', 70, false, '', 'Maquillaje profesional', 'Maquillaje profesional', 64)
ON CONFLICT (nombre, categoria) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  precio_desde = EXCLUDED.precio_desde,
  duracion = EXCLUDED.duracion,
  subcategoria = EXCLUDED.subcategoria,
  orden = EXCLUDED.orden;
