/**
 * Réduit une image pour en faire une couverture : 900 px au plus sur le grand côté, JPEG, en
 * baissant la qualité jusqu'à tenir sous la limite du serveur. Tout se passe dans le navigateur ;
 * les métadonnées de la photo (position GPS, appareil…) disparaissent au passage par le canevas.
 */
const MAX_SIDE = 900;
const MAX_BYTES = 420 * 1024;

export class CoverImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoverImageError";
  }
}

function bytesOf(dataUrl: string): number {
  return Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
}

export async function coverFromFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new CoverImageError("Choisissez une image (photo, capture d'écran…).");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new CoverImageError("Cette image ne s'ouvre pas dans le navigateur. Essayez une photo JPEG ou PNG.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new CoverImageError("Votre navigateur ne permet pas de préparer l'image.");
  context.fillStyle = "#f8f3ec"; // fond ivoire sous les images transparentes
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.85, 0.75, 0.62, 0.5]) {
    const url = canvas.toDataURL("image/jpeg", quality);
    if (bytesOf(url) <= MAX_BYTES) return url;
  }
  throw new CoverImageError("Image trop détaillée, même réduite. Essayez-en une autre.");
}
