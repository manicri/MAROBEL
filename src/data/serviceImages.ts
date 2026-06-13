const unsplashImage = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=800&q=84`;

const serviceImageIds: Record<string, string> = {
  "Manicura tradicional": "photo-1693776529298-f853f526665e",
  "Pedicura tradicional": "photo-1659391542239-9648f307c0b1",
  "Manicura semipermanente": "photo-1680540441735-2cdc020037c8",
  "Pedicura semipermanente": "photo-1632345031435-8727f6897d53",
  "Manicura técnica Soft Gel": "photo-1604654894610-df63bc536371",
  "Manicura base Rubber": "photo-1610992015762-45dca7fa3a85",
  "Manicura con gel de construcción": "photo-1690749138086-7422f71dc159",
  "Manicura técnica Polygel": "photo-1607779097040-26e80aa78e66",
  "Manicura técnica en acrílico": "photo-1630843599725-32ead7671867",
  "Manicura técnica Kapping": "photo-1612887390768-fb02affea7a6",

  "Diseño integral de cejas con henna": "photo-1713085085470-fba013d67e65",
  "Diseño de cejas con laminado e hidratación": "photo-1512290923902-8a9f81dc236c",
  "Visajismo y laminado de cejas": "photo-1594465919760-441fe5908ab0",
  Microblading: "photo-1535310172250-0dcb6b63324e",
  Microshading: "photo-1561505445-3d89277edf4c",
  "Efecto polvo": "photo-1709477542149-f4e0e21d590b",
  "Pigmentación de cejas con henna": "photo-1567629307995-b9f33097bd30",
  "Laminado de cejas": "photo-1709477542153-5bedab2b5657",

  "Lifting de pestañas": "photo-1589710751893-f9a6770ad71b",
  "Lifting de pestañas con pigmentación": "photo-1735151226446-1d364b4adc2f",
  "Pestañas clásicas": "photo-1639629509821-c54cdd984227",
  "Pestañas con volumen": "photo-1548902378-2ec44c906391",
  "Pestañas punto por punto": "photo-1674049406179-d7bf2c263e71",

  "Corte de cabello": "photo-1634449571010-02389ed0f9b0",
  Cepillado: "photo-1580618672591-eb180b1a973f",
  Planchado: "photo-1595475884562-073c30d45670",
  "Retoque de raíz": "photo-1560869713-7d0a29430803",
  "Tinte completo": "photo-1605497788044-5a32c7078486",
  Balayage: "photo-1554519934-e32b1629d9ee",
  Mechas: "photo-1574015974293-817f0ebebb74",
  Rayitos: "photo-1600948836101-f9ffda59d250",
  Ombré: "photo-1503951914875-452162b0f3f1",
  Highlights: "photo-1562322140-8baeececf3df",
  Peinados: "photo-1521590832167-7bcbfaa6381f",
  "Tratamiento de hidratación": "photo-1599351431202-1e0f0137899a",
  "Tratamiento de células madre": "photo-1560066984-138dadb4c035",
  "Botox nutritivo": "photo-1637777269327-c4d5c7944d7b",
  "Reconstrucción capilar": "photo-1605980766335-d3a41c7332a1",
  "Tratamiento antifrizz": "photo-1707979577466-2d6109c68a45",
  "Repolarización capilar": "photo-1470259078422-826894b933aa",
  "Detox capilar": "photo-1544717304-a2db4a7b16ee",
  Taninoplastia: "photo-1633681926022-84c23e8cb2d6",

  "Limpieza facial express": "photo-1616394584738-fc6e612e71b9",
  "Limpieza facial profunda": "photo-1570172619644-dfd03ed5d881",
  "Masaje de espalda": "photo-1761718209835-c8586b7dcac0",
  "Masaje de cuerpo entero": "photo-1540555700478-4be289fbecef",
  "Depilación con hilo - Cejas": "photo-1512290923902-8a9f81dc236c",
  "Depilación con hilo - Bigote": "photo-1643684391140-c5056cfd3436",
  "Depilación con cera - Cejas": "photo-1731514771613-991a02407132",
  "Depilación con cera - Bigote": "photo-1552693673-1bf958298935",
  "Depilación con cera - Rostro": "photo-1643684460412-76908d8e5a25",
  "Depilación con cera - Axilas": "photo-1761718210089-ba3bb5ccb54f",
  "Depilación con cera - Brazos": "photo-1713824096348-c1956e6da321",
  "Depilación con cera - Media pierna": "photo-1643685276743-1b52832c58d5",
  "Depilación con cera - Pierna entera": "photo-1713085085470-fba013d67e65",
  "Depilación con cera - Bikini": "photo-1761718209835-c8586b7dcac0",
  "Depilación con cera - Bikini brasilero": "photo-1531299244174-d247dd4e5a66",

  "Maquillaje express": "photo-1596462502278-27bfdc403348",
  "Maquillaje social": "photo-1594465919760-441fe5908ab0",
  "Maquillaje de noche": "photo-1709477542149-f4e0e21d590b",
  "Maquillaje de novia": "photo-1636023730877-233b9237d4ec",
};

const fallbackImage = unsplashImage("photo-1540555700478-4be289fbecef");

export const getServiceImage = (serviceName: string, customImage?: string) => {
  if (customImage?.trim()) return customImage;
  const photoId = serviceImageIds[serviceName];
  return photoId ? unsplashImage(photoId) : fallbackImage;
};
