-- CATALOGO COMPLETO DE SERVICIOS MAROBEL
-- Ejecuta este archivo una vez en Supabase > SQL Editor.
-- Es seguro volver a ejecutarlo: actualiza los servicios existentes por nombre y categoria.

ALTER TABLE public.servicios
ADD COLUMN IF NOT EXISTS precio_desde BOOLEAN NOT NULL DEFAULT false;

INSERT INTO public.categorias (nombre) VALUES
  ('Manicura y pedicura'),
  ('Cejas'),
  ('Pestañas'),
  ('Peluquería'),
  ('Cosmetología'),
  ('Maquillaje')
ON CONFLICT (nombre) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS servicios_nombre_categoria_unique
ON public.servicios (nombre, categoria);

INSERT INTO public.servicios (nombre, descripcion, precio, precio_desde, duracion, categoria)
VALUES
  ('Manicura tradicional', 'Cuidado y acabado tradicional para manos.', 10, false, '', 'Manicura y pedicura'),
  ('Pedicura tradicional', 'Cuidado y acabado tradicional para pies.', 12, false, '', 'Manicura y pedicura'),
  ('Manicura semipermanente', 'Manicura con esmaltado semipermanente de larga duración.', 15, false, '', 'Manicura y pedicura'),
  ('Pedicura semipermanente', 'Pedicura con esmaltado semipermanente de larga duración.', 15, false, '', 'Manicura y pedicura'),
  ('Manicura técnica Soft Gel', 'Extensión de uñas con técnica Soft Gel.', 25, false, '', 'Manicura y pedicura'),
  ('Manicura base Rubber', 'Refuerzo y nivelación de la uña natural con base Rubber.', 20, false, '', 'Manicura y pedicura'),
  ('Manicura con gel de construcción', 'Estructura y refuerzo de uñas con gel de construcción.', 25, true, '', 'Manicura y pedicura'),
  ('Manicura técnica Polygel', 'Extensión o refuerzo de uñas con técnica Polygel.', 25, true, '', 'Manicura y pedicura'),
  ('Manicura técnica en acrílico', 'Extensión de uñas en acrílico. El valor final depende del tamaño.', 25, true, '', 'Manicura y pedicura'),
  ('Manicura técnica Kapping', 'Recubrimiento protector para reforzar la uña natural.', 20, false, '', 'Manicura y pedicura'),

  ('Diseño integral de cejas con henna', 'Incluye visajismo, depilado, laminado y pigmentación con henna.', 35, false, '', 'Cejas'),
  ('Diseño de cejas con laminado e hidratación', 'Incluye visajismo, depilado, laminado e hidratación.', 25, false, '', 'Cejas'),
  ('Visajismo y laminado de cejas', 'Diseño de cejas mediante visajismo y laminado.', 15, false, '', 'Cejas'),
  ('Microblading', 'Técnica pelo a pelo para definir y completar las cejas.', 80, false, '', 'Cejas'),
  ('Microshading', 'Micropigmentación con acabado sombreado para las cejas.', 100, false, '', 'Cejas'),
  ('Efecto polvo', 'Micropigmentación de cejas con acabado suave tipo maquillaje.', 120, false, '', 'Cejas'),
  ('Pigmentación de cejas con henna', 'Definición temporal de las cejas mediante pigmentación con henna.', 15, false, '', 'Cejas'),
  ('Laminado de cejas', 'Peinado y fijación profesional para unas cejas definidas.', 15, false, '', 'Cejas'),

  ('Lifting de pestañas', 'Elevación y curvatura de las pestañas naturales.', 25, false, '', 'Pestañas'),
  ('Lifting de pestañas con pigmentación', 'Lifting acompañado de pigmentación para intensificar el resultado.', 30, false, '', 'Pestañas'),
  ('Pestañas clásicas', 'Extensiones clásicas para un resultado natural y definido.', 30, false, '', 'Pestañas'),
  ('Pestañas con volumen', 'Extensiones con volumen personalizado según el efecto elegido.', 45, true, '', 'Pestañas'),
  ('Pestañas punto por punto', 'Aplicación de pestañas punto por punto.', 20, false, '', 'Pestañas'),

  ('Corte de cabello', 'Corte personalizado según el estilo y largo del cabello.', 10, true, '', 'Peluquería'),
  ('Cepillado', 'Secado y moldeado profesional del cabello.', 10, true, '', 'Peluquería'),
  ('Planchado', 'Alisado temporal y acabado con plancha profesional.', 10, true, '', 'Peluquería'),
  ('Retoque de raíz', 'Tinturado de raíz para un crecimiento máximo de 2 cm.', 35, false, '', 'Peluquería'),
  ('Tinte completo', 'Coloración completa. El precio depende del largo y cantidad de cabello.', 60, true, '', 'Peluquería'),
  ('Balayage', 'Técnica de iluminación degradada y personalizada.', 100, true, '', 'Peluquería'),
  ('Mechas', 'Servicio de iluminación mediante mechas.', 80, true, '', 'Peluquería'),
  ('Rayitos', 'Iluminación fina distribuida en el cabello.', 80, true, '', 'Peluquería'),
  ('Ombré', 'Coloración degradada desde tonos oscuros hacia puntas más claras.', 80, true, '', 'Peluquería'),
  ('Highlights', 'Iluminaciones estratégicas para aportar dimensión y brillo.', 80, true, '', 'Peluquería'),
  ('Peinados', 'Peinado profesional adaptado al evento y estilo deseado.', 25, true, '', 'Peluquería'),
  ('Tratamiento de hidratación', 'Tratamiento para recuperar hidratación, suavidad y brillo.', 25, true, '', 'Peluquería'),
  ('Tratamiento de células madre', 'Tratamiento capilar reparador con células madre.', 30, true, '', 'Peluquería'),
  ('Botox nutritivo', 'Tratamiento nutritivo para mejorar suavidad, brillo y manejabilidad.', 35, true, '', 'Peluquería'),
  ('Reconstrucción capilar', 'Tratamiento intensivo para cabello debilitado o maltratado.', 40, true, '', 'Peluquería'),
  ('Tratamiento antifrizz', 'Tratamiento para controlar el frizz y mejorar la disciplina del cabello.', 50, true, '', 'Peluquería'),
  ('Repolarización capilar', 'Tratamiento profundo para nutrir y recuperar la fibra capilar.', 60, false, '', 'Peluquería'),
  ('Detox capilar', 'Limpieza profunda del cuero cabelludo y la fibra capilar.', 60, false, '', 'Peluquería'),
  ('Taninoplastia', 'Tratamiento de alisado y control de volumen.', 70, true, '', 'Peluquería'),

  ('Limpieza facial express', 'Limpieza facial rápida para refrescar y cuidar la piel.', 25, false, '', 'Cosmetología'),
  ('Limpieza facial profunda', 'Protocolo completo de limpieza y cuidado facial.', 35, false, '', 'Cosmetología'),
  ('Masaje de espalda', 'Masaje localizado para aliviar tensión y favorecer la relajación.', 35, false, '30 min', 'Cosmetología'),
  ('Masaje de cuerpo entero', 'Masaje corporal completo para relajación y bienestar.', 50, false, '60 min', 'Cosmetología'),
  ('Depilación con hilo - Cejas', 'Diseño y depilación de cejas con hilo.', 8, false, '', 'Cosmetología'),
  ('Depilación con hilo - Bigote', 'Depilación de la zona del bigote con hilo.', 7, false, '', 'Cosmetología'),
  ('Depilación con cera - Cejas', 'Depilación de cejas con cera.', 7, false, '', 'Cosmetología'),
  ('Depilación con cera - Bigote', 'Depilación de la zona del bigote con cera.', 5, false, '', 'Cosmetología'),
  ('Depilación con cera - Rostro', 'Depilación facial con cera.', 25, false, '', 'Cosmetología'),
  ('Depilación con cera - Axilas', 'Depilación de axilas con cera.', 12, false, '', 'Cosmetología'),
  ('Depilación con cera - Brazos', 'Depilación de brazos con cera.', 25, false, '', 'Cosmetología'),
  ('Depilación con cera - Media pierna', 'Depilación de media pierna con cera.', 25, false, '', 'Cosmetología'),
  ('Depilación con cera - Pierna entera', 'Depilación de pierna completa con cera.', 35, false, '', 'Cosmetología'),
  ('Depilación con cera - Bikini', 'Depilación de línea de bikini con cera.', 25, false, '', 'Cosmetología'),
  ('Depilación con cera - Bikini brasilero', 'Depilación estilo bikini brasilero con cera.', 35, false, '', 'Cosmetología'),

  ('Maquillaje express', 'Maquillaje ligero y rápido para un acabado fresco.', 25, false, '', 'Maquillaje'),
  ('Maquillaje social', 'Maquillaje profesional para eventos sociales.', 40, false, '', 'Maquillaje'),
  ('Maquillaje de noche', 'Maquillaje de mayor intensidad para eventos nocturnos.', 50, false, '', 'Maquillaje'),
  ('Maquillaje de novia', 'Maquillaje profesional de larga duración para novia.', 70, false, '', 'Maquillaje')
ON CONFLICT (nombre, categoria) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  precio_desde = EXCLUDED.precio_desde,
  duracion = EXCLUDED.duracion;
