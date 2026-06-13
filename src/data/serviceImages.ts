interface ImageGroup {
  query: string;
  lockStart: number;
  services: string[];
}

const imageGroups: ImageGroup[] = [
  {
    query: "manicure,nails,salon",
    lockStart: 101,
    services: [
      "Manicura tradicional",
      "Pedicura tradicional",
      "Manicura semipermanente",
      "Pedicura semipermanente",
      "Manicura técnica Soft Gel",
      "Manicura base Rubber",
      "Manicura con gel de construcción",
      "Manicura técnica Polygel",
      "Manicura técnica en acrílico",
      "Manicura técnica Kapping",
    ],
  },
  {
    query: "eyebrow,beauty,salon",
    lockStart: 201,
    services: [
      "Diseño integral de cejas con henna",
      "Diseño de cejas con laminado e hidratación",
      "Visajismo y laminado de cejas",
      "Microblading",
      "Microshading",
      "Efecto polvo",
      "Pigmentación de cejas con henna",
      "Laminado de cejas",
    ],
  },
  {
    query: "eyelashes,beauty,salon",
    lockStart: 301,
    services: [
      "Lifting de pestañas",
      "Lifting de pestañas con pigmentación",
      "Pestañas clásicas",
      "Pestañas con volumen",
      "Pestañas punto por punto",
    ],
  },
  {
    query: "hair,salon,stylist",
    lockStart: 401,
    services: [
      "Corte de cabello",
      "Cepillado",
      "Planchado",
      "Retoque de raíz",
      "Tinte completo",
      "Balayage",
      "Mechas",
      "Rayitos",
      "Ombré",
      "Highlights",
      "Peinados",
      "Tratamiento de hidratación",
      "Tratamiento de células madre",
      "Botox nutritivo",
      "Reconstrucción capilar",
      "Tratamiento antifrizz",
      "Repolarización capilar",
      "Detox capilar",
      "Taninoplastia",
    ],
  },
  {
    query: "spa,skincare,beauty",
    lockStart: 501,
    services: [
      "Limpieza facial express",
      "Limpieza facial profunda",
      "Masaje de espalda",
      "Masaje de cuerpo entero",
      "Depilación con hilo - Cejas",
      "Depilación con hilo - Bigote",
      "Depilación con cera - Cejas",
      "Depilación con cera - Bigote",
      "Depilación con cera - Rostro",
      "Depilación con cera - Axilas",
      "Depilación con cera - Brazos",
      "Depilación con cera - Media pierna",
      "Depilación con cera - Pierna entera",
      "Depilación con cera - Bikini",
      "Depilación con cera - Bikini brasilero",
    ],
  },
  {
    query: "makeup,beauty,artist",
    lockStart: 601,
    services: [
      "Maquillaje express",
      "Maquillaje social",
      "Maquillaje de noche",
      "Maquillaje de novia",
    ],
  },
];

const serviceImages = new Map<string, string>(
  imageGroups.flatMap(({ query, lockStart, services }) =>
    services.map((service, index) => [
      service,
      `https://loremflickr.com/1200/800/${query}?lock=${lockStart + index}`,
    ] as const)
  )
);

const fallbackImage = "https://loremflickr.com/1200/800/beauty,salon?lock=999";

export const getServiceImage = (serviceName: string, customImage?: string) => {
  if (customImage?.trim()) return customImage;
  return serviceImages.get(serviceName) || fallbackImage;
};
