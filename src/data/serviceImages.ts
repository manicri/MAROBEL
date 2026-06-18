const unsplashImage = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=800&q=84`;

const requestedServiceImages: Record<string, string> = {
  Microblading: "https://files.catbox.moe/up89vb.jpg",
  Microshading: "https://files.catbox.moe/xhano1.jpg",
  "Efecto polvo": "https://files.catbox.moe/j2en8h.jpg",
  "Manicura con Rubber Base": "https://files.catbox.moe/gzgcyk.jpg",
  "Manicura con gel de construcción": "https://files.catbox.moe/8v3ety.png",
  "Manicura Polygel": "https://files.catbox.moe/o7tl4p.jpg",
  "Manicura técnica en acrílico": "https://files.catbox.moe/jwl4v1.jpg",
};

const serviceImageIds: Record<string, string> = {
  "Manicura tradicional": "photo-1693776529298-f853f526665e",
  "Manicura semipermanente": "photo-1607779097040-26e80aa78e66",
  "Pedicura tradicional": "photo-1659391542239-9648f307c0b1",
  "Pedicura spa": "photo-1659391542239-9648f307c0b1",
  "Pedicura rusa, solo limpieza": "photo-1632345031435-8727f6897d53",
  "Pedicura semipermanente": "photo-1680540441735-2cdc020037c8",
  "Pedicura con Rubber Base": "photo-1610992015762-45dca7fa3a85",
  "Pedicura con gel de construcción": "photo-1690749138086-7422f71dc159",
  "Manicura técnica Soft Gel": "photo-1604654894610-df63bc536371",

  "Visajismo y laminado de cejas": "photo-1674049406467-824ea37c7184",
  "Pigmentación de cejas con henna": "photo-1567629307995-b9f33097bd30",
  "Visajismo, depilación, laminado e hidratación de cejas": "photo-1512290923902-8a9f81dc236c",
  "Visajismo, depilación, laminado y pigmentación de cejas con henna": "photo-1713085085470-fba013d67e65",

  "Pestañas punto por punto": "photo-1674049406179-d7bf2c263e71",
  "Lifting de pestañas": "photo-1589710751893-f9a6770ad71b",
  "Lifting de pestañas con pigmentación": "photo-1735151226446-1d364b4adc2f",
  "Extensiones de pestañas clásicas": "photo-1639629509821-c54cdd984227",
  "Extensiones de pestañas con volumen": "photo-1548902378-2ec44c906391",

  "Corte de cabello": "photo-1634449571010-02389ed0f9b0",
  Cepillado: "photo-1580618672591-eb180b1a973f",
  Planchado: "photo-1595475884562-073c30d45670",
  "Retoque de raíz, hasta 2 cm de crecimiento": "photo-1560869713-7d0a29430803",
  "Tinte completo": "photo-1605497788044-5a32c7078486",
  Balayage: "photo-1554519934-e32b1629d9ee",
  Mechas: "photo-1574015974293-817f0ebebb74",
  Rayitos: "photo-1600948836101-f9ffda59d250",
  Ombré: "photo-1503951914875-452162b0f3f1",
  Highlights: "photo-1562322140-8baeececf3df",
  Peinados: "photo-1521590832167-7bcbfaa6381f",
  "Tratamiento de hidratación": "photo-1599351431202-1e0f0137899a",
  "Tratamiento con células madre": "photo-1560066984-138dadb4c035",
  "Bótox nutritivo": "photo-1637777269327-c4d5c7944d7b",
  "Tratamiento de reconstrucción capilar": "photo-1605980766335-d3a41c7332a1",
  "Tratamiento antifrizz": "photo-1707979577466-2d6109c68a45",
  "Tratamiento de repolarización capilar": "photo-1470259078422-826894b933aa",
  "Detox capilar": "photo-1544717304-a2db4a7b16ee",
  "Taninoplastia o alisado": "photo-1633681926022-84c23e8cb2d6",

  "Limpieza facial exprés": "photo-1616394584738-fc6e612e71b9",
  "Limpieza facial profunda": "photo-1570172619644-dfd03ed5d881",
  "Masaje de espalda, 30 minutos": "photo-1761718209835-c8586b7dcac0",
  "Masaje de cuerpo entero, 1 hora": "photo-1540555700478-4be289fbecef",
  "Cejas con hilo": "photo-1519823551278-64ac92734fb1",
  "Bozo con hilo": "photo-1643684391140-c5056cfd3436",
  "Bozo con cera": "photo-1552693673-1bf958298935",
  "Cejas con cera": "photo-1731514771613-991a02407132",
  "Axilas con cera": "photo-1761718210089-ba3bb5ccb54f",
  "Rostro completo con cera": "photo-1643684460412-76908d8e5a25",
  "Brazos con cera": "photo-1713824096348-c1956e6da321",
  "Media pierna con cera": "photo-1643685276743-1b52832c58d5",
  "Bikini con cera": "photo-1544161515-4ab6ce6db874",
  "Piernas completas con cera": "photo-1741522509438-a120c0bb5e88",
  "Bikini brasileño con cera": "photo-1531299244174-d247dd4e5a66",

  "Maquillaje exprés": "photo-1596462502278-27bfdc403348",
  "Maquillaje social": "photo-1594465919760-441fe5908ab0",
  "Maquillaje de noche": "photo-1709477542149-f4e0e21d590b",
  "Maquillaje para novia": "photo-1636023730877-233b9237d4ec",
};

const fallbackImage = unsplashImage("photo-1540555700478-4be289fbecef");

export const getServiceImage = (serviceName: string, customImage?: string) => {
  if (requestedServiceImages[serviceName]) return requestedServiceImages[serviceName];
  if (customImage?.trim()) return customImage;
  const photoId = serviceImageIds[serviceName];
  return photoId ? unsplashImage(photoId) : fallbackImage;
};
