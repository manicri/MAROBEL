const unsplashImage = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=800&q=82`;

const referenceImages: Record<string, string[]> = {
  "Manicura y pedicura": [
    unsplashImage("photo-1693776529298-f853f526665e"),
    unsplashImage("photo-1659391542239-9648f307c0b1"),
    unsplashImage("photo-1680540441735-2cdc020037c8"),
  ],
  Cejas: [
    unsplashImage("photo-1713085085470-fba013d67e65"),
    unsplashImage("photo-1718720410616-8a03416f9f4d"),
  ],
  Pestañas: [
    unsplashImage("photo-1718720410616-8a03416f9f4d"),
    unsplashImage("photo-1713085085470-fba013d67e65"),
  ],
  Peluquería: [
    unsplashImage("photo-1634449571010-02389ed0f9b0"),
    unsplashImage("photo-1605980766335-d3a41c7332a1"),
    unsplashImage("photo-1707979577466-2d6109c68a45"),
    unsplashImage("photo-1470259078422-826894b933aa"),
  ],
  Cosmetología: [
    unsplashImage("photo-1713085085470-fba013d67e65"),
    unsplashImage("photo-1544161515-4ab6ce6db874"),
    unsplashImage("photo-1540555700478-4be289fbecef"),
  ],
  Maquillaje: [
    unsplashImage("photo-1713771295889-eacfced8de80"),
  ],
};

const hairServices = new Set([
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
]);

const serviceCategory = (serviceName: string) => {
  if (serviceName.startsWith("Manicura") || serviceName.startsWith("Pedicura")) return "Manicura y pedicura";
  if (serviceName.includes("pestañas")) return "Pestañas";
  if (serviceName.includes("cejas") || ["Microblading", "Microshading", "Efecto polvo"].includes(serviceName)) return "Cejas";
  if (hairServices.has(serviceName)) return "Peluquería";
  if (serviceName.startsWith("Maquillaje")) return "Maquillaje";
  return "Cosmetología";
};

export const getServiceImage = (serviceName: string, customImage?: string) => {
  if (customImage?.trim()) return customImage;
  const images = referenceImages[serviceCategory(serviceName)];
  const imageIndex = Array.from(serviceName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  ) % images.length;
  return images[imageIndex];
};
