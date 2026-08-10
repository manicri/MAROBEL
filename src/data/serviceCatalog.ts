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
  imagen_ajuste?: "cover" | "contain";
  imagen_posicion?: string;
  orden: number;
}

interface CatalogDefinition extends Omit<CatalogService, "id" | "imagen_url" | "orden"> {
  aliases?: string[];
}

const catalog: CatalogDefinition[] = [
  { nombre: "Manicura tradicional", descripcion: "Cuidado, limpieza y acabado tradicional para manos.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 10, precio_desde: false },
  { nombre: "Manicura semipermanente", descripcion: "Esmaltado semipermanente de larga duraciÃ³n.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 15, precio_desde: false },
  { nombre: "Manicura con Rubber Base", aliases: ["Manicura base Rubber"], descripcion: "Refuerzo y nivelaciÃ³n de la uÃ±a natural con Rubber Base.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 20, precio_desde: false },
  { nombre: "Manicura tÃ©cnica Soft Gel", descripcion: "ExtensiÃ³n de uÃ±as con tÃ©cnica Soft Gel.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: false },
  { nombre: "Manicura con gel de construcciÃ³n", descripcion: "ConstrucciÃ³n y refuerzo de uÃ±as cortas o largas con gel.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: true },
  { nombre: "Manicura Polygel", aliases: ["Manicura tÃ©cnica Polygel"], descripcion: "ExtensiÃ³n o refuerzo de uÃ±as con tÃ©cnica Polygel.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: true },
  { nombre: "Manicura en acrÃ­lico", aliases: ["Manicura tÃ©cnica en acrÃ­lico"], descripcion: "ExtensiÃ³n en acrÃ­lico; el valor final depende del tamaÃ±o.", categoria: "Manicura y pedicura", seccion: "Manicura", precio: 25, precio_desde: true },
  { nombre: "Pedicura spa", descripcion: "Cuidado relajante e hidratante para los pies.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 10, precio_desde: false },
  { nombre: "Pedicura bÃ¡sica", aliases: ["Pedicura rusa, solo limpieza"], descripcion: "Limpieza tÃ©cnica profunda de uÃ±as y cutÃ­culas.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 10, precio_desde: false },
  { nombre: "Pedicura tradicional", descripcion: "Cuidado y acabado tradicional para pies.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 12, precio_desde: false },
  { nombre: "Pedicura semipermanente", descripcion: "Pedicura con esmaltado semipermanente de larga duraciÃ³n.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 15, precio_desde: false },
  { nombre: "Pedicura Spa + Semipermanente", descripcion: "Pedicura spa con esmaltado semipermanente.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 25, precio_desde: false },
  { nombre: "Pedicura con Rubber Base", descripcion: "NivelaciÃ³n y refuerzo de las uÃ±as de los pies con Rubber Base.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 18, precio_desde: false },
  { nombre: "Pedicura con gel de construcciÃ³n", descripcion: "Refuerzo y estructura con gel de construcciÃ³n.", categoria: "Manicura y pedicura", seccion: "Pedicura", precio: 20, precio_desde: false },

  { nombre: "Visajismo y laminado de cejas", descripcion: "DiseÃ±o mediante visajismo y laminado profesional.", categoria: "Cejas", seccion: "DiseÃ±o y cuidado de cejas", precio: 15, precio_desde: false },
  { nombre: "PigmentaciÃ³n de cejas con henna", descripcion: "DefiniciÃ³n temporal de las cejas mediante henna.", categoria: "Cejas", seccion: "DiseÃ±o y cuidado de cejas", precio: 15, precio_desde: false },
  { nombre: "Visajismo, depilaciÃ³n, laminado e hidrataciÃ³n de cejas", aliases: ["DiseÃ±o de cejas con laminado e hidrataciÃ³n"], descripcion: "DiseÃ±o completo con depilaciÃ³n, laminado e hidrataciÃ³n.", categoria: "Cejas", seccion: "DiseÃ±o y cuidado de cejas", precio: 25, precio_desde: false },
  { nombre: "Visajismo, depilaciÃ³n, laminado y pigmentaciÃ³n de cejas con henna", aliases: ["DiseÃ±o integral de cejas con henna"], descripcion: "DiseÃ±o integral con depilaciÃ³n, laminado y pigmentaciÃ³n con henna.", categoria: "Cejas", seccion: "DiseÃ±o y cuidado de cejas", precio: 35, precio_desde: false },
  { nombre: "Microblading", descripcion: "TÃ©cnica pelo a pelo para definir y completar las cejas.", categoria: "Cejas", seccion: "MicropigmentaciÃ³n", precio: 80, precio_desde: false },
  { nombre: "Microshading", descripcion: "MicropigmentaciÃ³n con acabado sombreado para las cejas.", categoria: "Cejas", seccion: "MicropigmentaciÃ³n", precio: 100, precio_desde: false },
  { nombre: "Efecto polvo", descripcion: "MicropigmentaciÃ³n con acabado suave tipo maquillaje.", categoria: "Cejas", seccion: "MicropigmentaciÃ³n", precio: 120, precio_desde: false },

  { nombre: "PestaÃ±as punto por punto", descripcion: "AplicaciÃ³n de pestaÃ±as punto por punto.", categoria: "PestaÃ±as", seccion: "PestaÃ±as", precio: 15, precio_desde: false },
  { nombre: "Lifting de pestaÃ±as", descripcion: "ElevaciÃ³n y curvatura de las pestaÃ±as naturales.", categoria: "PestaÃ±as", seccion: "PestaÃ±as", precio: 25, precio_desde: false },
  { nombre: "Lifting de pestaÃ±as con pigmentaciÃ³n", descripcion: "Lifting con pigmentaciÃ³n para intensificar el resultado.", categoria: "PestaÃ±as", seccion: "PestaÃ±as", precio: 30, precio_desde: false },
  { nombre: "Extensiones de pestaÃ±as clÃ¡sicas", aliases: ["PestaÃ±as clÃ¡sicas"], descripcion: "Extensiones clÃ¡sicas con resultado natural y definido.", categoria: "PestaÃ±as", seccion: "PestaÃ±as", precio: 30, precio_desde: false },
  { nombre: "Extensiones de pestaÃ±as con volumen", aliases: ["PestaÃ±as con volumen"], descripcion: "Extensiones con volumen personalizado.", categoria: "PestaÃ±as", seccion: "PestaÃ±as", precio: 45, precio_desde: false },

  { nombre: "Corte de cabello", descripcion: "Corte personalizado segÃºn el estilo y largo del cabello.", categoria: "PeluquerÃ­a", seccion: "Corte, cepillado y peinados", precio: 20, precio_desde: false },
  { nombre: "Cepillado", descripcion: "Secado y moldeado profesional del cabello.", categoria: "PeluquerÃ­a", seccion: "Corte, cepillado y peinados", precio: 20, precio_desde: false },
  { nombre: "Planchado", descripcion: "Alisado temporal y acabado con plancha profesional.", categoria: "PeluquerÃ­a", seccion: "Corte, cepillado y peinados", precio: 20, precio_desde: false },
  { nombre: "Peinados", descripcion: "Peinado profesional adaptado al evento y estilo deseado.", categoria: "PeluquerÃ­a", seccion: "Corte, cepillado y peinados", precio: 25, precio_desde: true },
  { nombre: "Retoque de raÃ­z, hasta 2 cm de crecimiento", aliases: ["Retoque de raÃ­z"], descripcion: "Tinturado de raÃ­z para un crecimiento mÃ¡ximo de 2 cm.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 35, precio_desde: false },
  { nombre: "Tinte completo", descripcion: "ColoraciÃ³n completa segÃºn largo y cantidad de cabello.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 60, precio_desde: true },
  { nombre: "Mechas", descripcion: "Servicio de iluminaciÃ³n mediante mechas.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 80, precio_desde: true },
  { nombre: "Rayitos", descripcion: "IluminaciÃ³n fina distribuida en el cabello.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 80, precio_desde: true },
  { nombre: "OmbrÃ©", descripcion: "ColoraciÃ³n degradada hacia puntas mÃ¡s claras.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 80, precio_desde: true },
  { nombre: "Highlights", descripcion: "Iluminaciones estratÃ©gicas para aportar dimensiÃ³n y brillo.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 80, precio_desde: true },
  { nombre: "Balayage", descripcion: "TÃ©cnica de iluminaciÃ³n degradada y personalizada.", categoria: "PeluquerÃ­a", seccion: "ColoraciÃ³n", precio: 100, precio_desde: true },
  { nombre: "Tratamiento de hidrataciÃ³n", descripcion: "Recupera hidrataciÃ³n, suavidad y brillo.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 25, precio_desde: true },
  { nombre: "Tratamiento con cÃ©lulas madre", aliases: ["Tratamiento de cÃ©lulas madre"], descripcion: "Tratamiento capilar reparador con cÃ©lulas madre.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 30, precio_desde: true },
  { nombre: "BÃ³tox nutritivo", aliases: ["Botox nutritivo"], descripcion: "Tratamiento nutritivo para mejorar suavidad y brillo.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 35, precio_desde: true },
  { nombre: "Tratamiento de reconstrucciÃ³n capilar", aliases: ["ReconstrucciÃ³n capilar"], descripcion: "Tratamiento intensivo para cabello debilitado o maltratado.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 40, precio_desde: true },
  { nombre: "Tratamiento antifrizz", descripcion: "Controla el frizz y mejora la disciplina del cabello.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 50, precio_desde: true },
  { nombre: "Tratamiento de repolarizaciÃ³n capilar", aliases: ["RepolarizaciÃ³n capilar"], descripcion: "Nutre y recupera profundamente la fibra capilar.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 60, precio_desde: false },
  { nombre: "Detox capilar", descripcion: "Limpieza profunda del cuero cabelludo y la fibra capilar.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 60, precio_desde: false },
  { nombre: "Taninoplastia o alisado", aliases: ["Taninoplastia"], descripcion: "Tratamiento de alisado y control de volumen.", categoria: "PeluquerÃ­a", seccion: "Tratamientos capilares", precio: 70, precio_desde: true },

  { nombre: "Limpieza facial exprÃ©s", aliases: ["Limpieza facial express"], descripcion: "Limpieza rÃ¡pida para refrescar y cuidar la piel.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "Limpiezas faciales", precio: 25, precio_desde: false },
  { nombre: "Limpieza facial profunda", descripcion: "Protocolo completo de limpieza y cuidado facial.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "Limpiezas faciales", precio: 35, precio_desde: false },
  { nombre: "Masaje de espalda, 30 minutos", aliases: ["Masaje de espalda"], descripcion: "Masaje localizado para aliviar tensiÃ³n y favorecer la relajaciÃ³n.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "Masajes", precio: 35, precio_desde: false, duracion: "30 min" },
  { nombre: "Masaje de cuerpo entero, 1 hora", aliases: ["Masaje de cuerpo entero"], descripcion: "Masaje corporal completo para relajaciÃ³n y bienestar.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "Masajes", precio: 50, precio_desde: false, duracion: "60 min" },
  { nombre: "Cejas con hilo", aliases: ["DepilaciÃ³n con hilo - Cejas"], descripcion: "DiseÃ±o y depilaciÃ³n de cejas con hilo.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con hilo", precio: 8, precio_desde: false },
  { nombre: "Bozo con hilo", aliases: ["DepilaciÃ³n con hilo - Bigote"], descripcion: "DepilaciÃ³n de la zona del bozo con hilo.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con hilo", precio: 7, precio_desde: false },
  { nombre: "Bozo con cera", aliases: ["DepilaciÃ³n con cera - Bigote"], descripcion: "DepilaciÃ³n de la zona del bozo con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 5, precio_desde: false },
  { nombre: "Cejas con cera", aliases: ["DepilaciÃ³n con cera - Cejas"], descripcion: "DiseÃ±o y depilaciÃ³n de cejas con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 10, precio_desde: false },
  { nombre: "Axilas con cera", aliases: ["DepilaciÃ³n con cera - Axilas"], descripcion: "DepilaciÃ³n de axilas con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 12, precio_desde: false },
  { nombre: "Rostro completo con cera", aliases: ["DepilaciÃ³n con cera - Rostro"], descripcion: "DepilaciÃ³n completa del rostro con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 25, precio_desde: false },
  { nombre: "Brazos con cera", aliases: ["DepilaciÃ³n con cera - Brazos"], descripcion: "DepilaciÃ³n de brazos con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 25, precio_desde: false },
  { nombre: "Media pierna con cera", aliases: ["DepilaciÃ³n con cera - Media pierna"], descripcion: "DepilaciÃ³n de media pierna con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 25, precio_desde: false },
  { nombre: "Bikini con cera", aliases: ["DepilaciÃ³n con cera - Bikini"], descripcion: "DepilaciÃ³n de lÃ­nea de bikini con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 25, precio_desde: false },
  { nombre: "Piernas completas con cera", aliases: ["DepilaciÃ³n con cera - Pierna entera"], descripcion: "DepilaciÃ³n de piernas completas con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 35, precio_desde: false },
  { nombre: "Bikini brasileÃ±o con cera", aliases: ["DepilaciÃ³n con cera - Bikini brasilero"], descripcion: "DepilaciÃ³n estilo bikini brasileÃ±o con cera.", categoria: "CosmetologÃ­a y cuidado facial", seccion: "DepilaciÃ³n con cera", precio: 35, precio_desde: false },

  { nombre: "Maquillaje exprÃ©s", aliases: ["Maquillaje express"], descripcion: "Maquillaje ligero y rÃ¡pido para un acabado fresco.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 25, precio_desde: false },
  { nombre: "Maquillaje social", descripcion: "Maquillaje profesional para eventos sociales.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 40, precio_desde: false },
  { nombre: "Maquillaje de noche", descripcion: "Maquillaje de mayor intensidad para eventos nocturnos.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 50, precio_desde: false },
  { nombre: "Maquillaje para novia", aliases: ["Maquillaje de novia"], descripcion: "Maquillaje profesional de larga duraciÃ³n para novia.", categoria: "Maquillaje profesional", seccion: "Maquillaje profesional", precio: 70, precio_desde: false },
];

export const categoryOrder = [
  "Manicura y pedicura",
  "Cejas",
  "PestaÃ±as",
  "PeluquerÃ­a",
  "CosmetologÃ­a y cuidado facial",
  "Maquillaje profesional",
];

export function buildServiceCatalog(databaseServices: Array<Record<string, unknown>>): CatalogService[] {
  const matchedIds = new Set<string>();
  const catalogServices = catalog.map((definition, index) => {
    const names = [definition.nombre, ...(definition.aliases || [])];
    const source = databaseServices.find((service) => names.includes(String(service.nombre || "")));
    if (source?.id) matchedIds.add(String(source.id));
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
      imagen_ajuste: source?.imagen_ajuste === "contain" ? "contain" : "cover",
      imagen_posicion: source?.imagen_posicion ? String(source.imagen_posicion) : "center",
      orden: index + 1,
    };
  });

  const customServices = databaseServices
    .filter((service) => service.id && !matchedIds.has(String(service.id)))
    .map((service, index) => ({
      id: String(service.id),
      nombre: String(service.nombre || "Servicio"),
      descripcion: String(service.descripcion || ""),
      categoria: String(service.categoria || "Otros"),
      seccion: String(service.subcategoria || service.categoria || "Otros"),
      precio: Number(service.precio || 0),
      precio_desde: Boolean(service.precio_desde),
      duracion: service.duracion ? String(service.duracion) : undefined,
      imagen_url: service.imagen_url ? String(service.imagen_url) : undefined,
      imagen_ajuste: service.imagen_ajuste === "contain" ? "contain" as const : "cover" as const,
      imagen_posicion: service.imagen_posicion ? String(service.imagen_posicion) : "center",
      orden: catalogServices.length + index + 1,
    }));

  return [...catalogServices, ...customServices];
}

