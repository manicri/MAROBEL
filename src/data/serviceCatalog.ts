export interface CatalogService {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  seccion: string;
  precio: number;
  precio_desde: boolean;
  duracion?: string;
  imagen_url?: string;
  orden: number;
}

interface CatalogDefinition extends Omit<CatalogService, "id" | "imagen_url" | "orden"> {
  aliases?: string[];
}

const catalog: CatalogDefinition[] = [
  { nombre: "Manicura tradicional", descripcion: "Cuidado, limpieza y acabado tradicional para manos.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 10, precio_desde: false },
  { nombre: "Manicura semipermanente", descripcion: "Esmaltado semipermanente de larga duración.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 15, precio_desde: false },
  { nombre: "Manicura con Rubber Base", aliases: ["Manicura base Rubber"], descripcion: "Refuerzo y nivelación de la uña natural con Rubber Base.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 20, precio_desde: false },
  { nombre: "Manicura técnica Soft Gel", descripcion: "Extensión de uñas con técnica Soft Gel.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: false },
  { nombre: "Manicura con gel de construcción", descripcion: "Construcción y refuerzo de uñas cortas o largas con gel.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: true },
  { nombre: "Manicura Polygel", aliases: ["Manicura técnica Polygel"], descripcion: "Extensión o refuerzo de uñas con técnica Polygel.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: true },
  { nombre: "Manicura técnica en acrílico", descripcion: "Extensión en acrílico; el valor final depende del tamaño.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: true },
  { nombre: "Pedicura spa", descripcion: "Cuidado relajante e hidratante para los pies.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 10, precio_desde: false },
  { nombre: "Pedicura rusa, solo limpieza", descripcion: "Limpieza técnica profunda de uñas y cutículas.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 10, precio_desde: false },
  { nombre: "Pedicura tradicional", descripcion: "Cuidado y acabado tradicional para pies.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 12, precio_desde: false },
  { nombre: "Pedicura semipermanente", descripcion: "Pedicura con esmaltado semipermanente de larga duración.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 15, precio_desde: false },
  { nombre: "Pedicura con Rubber Base", descripcion: "Nivelación y refuerzo de las uñas de los pies con Rubber Base.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 18, precio_desde: false },
  { nombre: "Pedicura con gel de construcción", descripcion: "Refuerzo y estructura con gel de construcción.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 20, precio_desde: false },

  { nombre: "Visajismo y laminado de cejas", descripcion: "Diseño mediante visajismo y laminado profesional.", categoria: "Cejas", seccion: "Diseño y cuidado de cejas", precio: 15, precio_desde: false },
  { nombre: "Pigmentación de cejas con henna", descripcion: "Definición temporal de las cejas mediante henna.", categoria: "Cejas", seccion: "Diseño y cuidado de cejas", precio: 15, precio_desde: false },
  { nombre: "Visajismo, depilación, laminado e hidratación de cejas", aliases: ["Diseño de cejas con laminado e hidratación"], descripcion: "Diseño completo con depilación, laminado e hidratación.", categoria: "Cejas", seccion: "Diseño y cuidado de cejas", precio: 25, precio_desde: false },
  { nombre: "Visajismo, depilación, laminado y pigmentación de cejas con henna", aliases: ["Diseño integral de cejas con henna"], descripcion: "Diseño integral con depilación, laminado y pigmentación con henna.", categoria: "Cejas", seccion: "Diseño y cuidado de cejas", precio: 35, precio_desde: false },
  { nombre: "Microblading", descripcion: "Técnica pelo a pelo para definir y completar las cejas.", categoria: "Cejas", seccion: "Micropigmentación", precio: 80, precio_desde: false },
  { nombre: "Microshading", descripcion: "Micropigmentación con acabado sombreado para las cejas.", categoria: "Cejas", seccion: "Micropigmentación", precio: 100, precio_desde: false },
  { nombre: "Efecto polvo", descripcion: "Micropigmentación con acabado suave tipo maquillaje.", categoria: "Cejas", seccion: "Micropigmentación", precio: 120, precio_desde: false },

  { nombre: "Pestañas punto por punto", descripcion: "Aplicación de pestañas punto por punto.", categoria: "Pestañas", seccion: "Pestañas", precio: 15, precio_desde: false },
  { nombre: "Lifting de pestañas", descripcion: "Elevación y curvatura de las pestañas naturales.", categoria: "Pestañas", seccion: "Pestañas", precio: 25, precio_desde: false },
  { nombre: "Lifting de pestañas con pigmentación", descripcion: "Lifting con pigmentación para intensificar el resultado.", categoria: "Pestañas", seccion: "Pestañas", precio: 30, precio_desde: false },
  { nombre: "Extensiones de pestañas clásicas", aliases: ["Pestañas clásicas"], descripcion: "Extensiones clásicas con resultado natural y definido.", categoria: "Pestañas", seccion: "Pestañas", precio: 30, precio_desde: false },
  { nombre: "Extensiones de pestañas con volumen", aliases: ["Pestañas con volumen"], descripcion: "Extensiones con volumen personalizado.", categoria: "Pestañas", seccion: "Pestañas", precio: 45, precio_desde: false },

  { nombre: "Corte de cabello", descripcion: "Corte personalizado según el estilo y largo del cabello.", categoria: "Peluquería", seccion: "Corte, cepillado y peinados", precio: 20, precio_desde: false },
  { nombre: "Cepillado", descripcion: "Secado y moldeado profesional del cabello.", categoria: "Peluquería", seccion: "Corte, cepillado y peinados", precio: 20, precio_desde: false },
  { nombre: "Planchado", descripcion: "Alisado temporal y acabado con plancha profesional.", categoria: "Peluquería", seccion: "Corte, cepillado y peinados", precio: 20, precio_desde: false },
  { nombre: "Peinados", descripcion: "Peinado profesional adaptado al evento y estilo deseado.", categoria: "Peluquería", seccion: "Corte, cepillado y peinados", precio: 25, precio_desde: true },
  { nombre: "Retoque de raíz, hasta 2 cm de crecimiento", aliases: ["Retoque de raíz"], descripcion: "Tinturado de raíz para un crecimiento máximo de 2 cm.", categoria: "Peluquería", seccion: "Coloración", precio: 35, precio_desde: false },
  { nombre: "Tinte completo", descripcion: "Coloración completa según largo y cantidad de cabello.", categoria: "Peluquería", seccion: "Coloración", precio: 60, precio_desde: true },
  { nombre: "Mechas", descripcion: "Servicio de iluminación mediante mechas.", categoria: "Peluquería", seccion: "Coloración", precio: 80, precio_desde: true },
  { nombre: "Rayitos", descripcion: "Iluminación fina distribuida en el cabello.", categoria: "Peluquería", seccion: "Coloración", precio: 80, precio_desde: true },
  { nombre: "Ombré", descripcion: "Coloración degradada hacia puntas más claras.", categoria: "Peluquería", seccion: "Coloración", precio: 80, precio_desde: true },
  { nombre: "Highlights", descripcion: "Iluminaciones estratégicas para aportar dimensión y brillo.", categoria: "Peluquería", seccion: "Coloración", precio: 80, precio_desde: true },
  { nombre: "Balayage", descripcion: "Técnica de iluminación degradada y personalizada.", categoria: "Peluquería", seccion: "Coloración", precio: 100, precio_desde: true },
  { nombre: "Tratamiento de hidratación", descripcion: "Recupera hidratación, suavidad y brillo.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 25, precio_desde: true },
  { nombre: "Tratamiento con células madre", aliases: ["Tratamiento de células madre"], descripcion: "Tratamiento capilar reparador con células madre.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 30, precio_desde: true },
  { nombre: "Bótox nutritivo", aliases: ["Botox nutritivo"], descripcion: "Tratamiento nutritivo para mejorar suavidad y brillo.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 35, precio_desde: true },
  { nombre: "Tratamiento de reconstrucción capilar", aliases: ["Reconstrucción capilar"], descripcion: "Tratamiento intensivo para cabello debilitado o maltratado.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 40, precio_desde: true },
  { nombre: "Tratamiento antifrizz", descripcion: "Controla el frizz y mejora la disciplina del cabello.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 50, precio_desde: true },
  { nombre: "Tratamiento de repolarización capilar", aliases: ["Repolarización capilar"], descripcion: "Nutre y recupera profundamente la fibra capilar.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 60, precio_desde: false },
  { nombre: "Detox capilar", descripcion: "Limpieza profunda del cuero cabelludo y la fibra capilar.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 60, precio_desde: false },
  { nombre: "Taninoplastia o alisado", aliases: ["Taninoplastia"], descripcion: "Tratamiento de alisado y control de volumen.", categoria: "Peluquería", seccion: "Tratamientos capilares", precio: 70, precio_desde: true },

  { nombre: "Limpieza facial exprés", aliases: ["Limpieza facial express"], descripcion: "Limpieza rápida para refrescar y cuidar la piel.", categoria: "Cosmetología y cuidado facial", seccion: "Limpiezas faciales", precio: 25, precio_desde: false },
  { nombre: "Limpieza facial profunda", descripcion: "Protocolo completo de limpieza y cuidado facial.", categoria: "Cosmetología y cuidado facial", seccion: "Limpiezas faciales", precio: 35, precio_desde: false },
  { nombre: "Masaje de espalda, 30 minutos", aliases: ["Masaje de espalda"], descripcion: "Masaje localizado para aliviar tensión y favorecer la relajación.", categoria: "Cosmetología y cuidado facial", seccion: "Masajes", precio: 35, precio_desde: false, duracion: "30 min" },
  { nombre: "Masaje de cuerpo entero, 1 hora", aliases: ["Masaje de cuerpo entero"], descripcion: "Masaje corporal completo para relajación y bienestar.", categoria: "Cosmetología y cuidado facial", seccion: "Masajes", precio: 50, precio_desde: false, duracion: "60 min" },
  { nombre: "Cejas con hilo", aliases: ["Depilación con hilo - Cejas"], descripcion: "Diseño y depilación de cejas con hilo.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con hilo", precio: 8, precio_desde: false },
  { nombre: "Bozo con hilo", aliases: ["Depilación con hilo - Bigote"], descripcion: "Depilación de la zona del bozo con hilo.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con hilo", precio: 7, precio_desde: false },
  { nombre: "Bozo con cera", aliases: ["Depilación con cera - Bigote"], descripcion: "Depilación de la zona del bozo con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 5, precio_desde: false },
  { nombre: "Cejas con cera", aliases: ["Depilación con cera - Cejas"], descripcion: "Diseño y depilación de cejas con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 10, precio_desde: false },
  { nombre: "Axilas con cera", aliases: ["Depilación con cera - Axilas"], descripcion: "Depilación de axilas con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 12, precio_desde: false },
  { nombre: "Rostro completo con cera", aliases: ["Depilación con cera - Rostro"], descripcion: "Depilación completa del rostro con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 25, precio_desde: false },
  { nombre: "Brazos con cera", aliases: ["Depilación con cera - Brazos"], descripcion: "Depilación de brazos con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 25, precio_desde: false },
  { nombre: "Media pierna con cera", aliases: ["Depilación con cera - Media pierna"], descripcion: "Depilación de media pierna con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 25, precio_desde: false },
  { nombre: "Bikini con cera", aliases: ["Depilación con cera - Bikini"], descripcion: "Depilación de línea de bikini con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 25, precio_desde: false },
  { nombre: "Piernas completas con cera", aliases: ["Depilación con cera - Pierna entera"], descripcion: "Depilación de piernas completas con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 35, precio_desde: false },
  { nombre: "Bikini brasileño con cera", aliases: ["Depilación con cera - Bikini brasilero"], descripcion: "Depilación estilo bikini brasileño con cera.", categoria: "Cosmetología y cuidado facial", seccion: "Depilación con cera", precio: 35, precio_desde: false },

  { nombre: "Maquillaje exprés", aliases: ["Maquillaje express"], descripcion: "Maquillaje ligero y rápido para un acabado fresco.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 25, precio_desde: false },
  { nombre: "Maquillaje social", descripcion: "Maquillaje profesional para eventos sociales.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 40, precio_desde: false },
  { nombre: "Maquillaje de noche", descripcion: "Maquillaje de mayor intensidad para eventos nocturnos.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 50, precio_desde: false },
  { nombre: "Maquillaje para novia", aliases: ["Maquillaje de novia"], descripcion: "Maquillaje profesional de larga duración para novia.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 70, precio_desde: false },
];

export const categoryOrder = [
  "Manicura y pedicura",
  "Cejas",
  "Pestañas",
  "Peluquería",
  "Cosmetología y cuidado facial",
  "Maquillaje profesional",
];

export function buildServiceCatalog(databaseServices: Array<Record<string, unknown>>): CatalogService[] {
  return catalog.map((definition, index) => {
    const names = [definition.nombre, ...(definition.aliases || [])];
    const source = databaseServices.find((service) => names.includes(String(service.nombre || "")));
    return {
      id: source ? String(source.id) : `catalog-${index + 1}`,
      nombre: definition.nombre,
      descripcion: definition.descripcion,
      categoria: definition.categoria,
      seccion: definition.seccion,
      precio: definition.precio,
      precio_desde: definition.precio_desde,
      duracion: definition.duracion,
      imagen_url: source?.imagen_url ? String(source.imagen_url) : undefined,
      orden: index + 1,
    };
  });
}
