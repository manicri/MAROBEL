import { supabase } from "../supabase";

export const SERVICE_IMAGE_OWNER = "crisdelrobbys@gmail.com";
export const SERVICE_IMAGE_WIDTH = 1600;
export const SERVICE_IMAGE_HEIGHT = 900;

export async function uploadServiceImage(file: File, userId: string): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Elige una imagen JPG, PNG o WebP");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("La imagen no puede superar los 10 MB");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = sourceUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo leer la imagen"));
    });
    const scale = Math.min(1, SERVICE_IMAGE_WIDTH / image.naturalWidth, SERVICE_IMAGE_HEIGHT / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("No se pudo preparar la imagen")), "image/webp", 0.9);
    });
    const path = `${userId}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from("servicios-images").upload(path, blob, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw error;
    return supabase.storage.from("servicios-images").getPublicUrl(path).data.publicUrl;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
