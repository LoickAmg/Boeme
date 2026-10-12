// Lecture d'un poème importé, entièrement dans le navigateur : rien n'est envoyé au serveur
// avant que le membre n'enregistre son poème. Chargé à la demande (bibliothèques lourdes).
//  - photo / capture : reconnaissance de texte (Tesseract.js, français), fichiers servis par
//    le site (public/ocr, voir scripts/copy-reader-assets.mjs) ;
//  - .docx (Word) : Mammoth ; .odt (LibreOffice) : lecture du XML du document ;
//  - .pdf : pdf.js, ligne par ligne ; .txt / .md : tel quel.

import { importKind, linesToText } from "./tidy";

export type Progress = (ratio: number, label: string) => void;

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

const MAX_BYTES = 15 * 1024 * 1024;

/** Image réduite à 2400 px de côté au plus et passée en niveaux de gris : la reconnaissance
 *  est plus rapide et plus sûre (une photo de téléphone fait souvent 4000 px). */
async function prepareImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.filter = "grayscale(1) contrast(1.15)";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/png"));
  } catch {
    return file; // format que le navigateur ne sait pas dessiner : Tesseract essaiera tel quel
  }
}

async function readImage(file: File, progress: Progress): Promise<string> {
  progress(0, "Préparation de l'image…");
  const image = await prepareImage(file);
  const { createWorker, OEM } = await import("tesseract.js");
  // Adresses complètes : le worker de Tesseract ne résout pas les chemins relatifs au site.
  const here = (path: string) => new URL(path, window.location.origin).href;
  const worker = await createWorker("fra", OEM.LSTM_ONLY, {
    workerPath: here("/ocr/worker.min.js"),
    corePath: here("/ocr/core"),
    langPath: here("/ocr/lang"),
    // Données servies décompressées (voir scripts/copy-reader-assets.mjs).
    gzip: false,
    logger: (m) => {
      if (m.status === "recognizing text") progress(0.15 + m.progress * 0.85, "Lecture du texte…");
      else if (m.status.includes("loading")) progress(Math.min(0.15, m.progress * 0.15), "Chargement de la lecture de texte (une seule fois)…");
    },
  });
  try {
    const { data } = await worker.recognize(image, {}, { text: true, blocks: true });
    // Strophes et titre d'après la position des lignes (la mise en paragraphes du moteur
    // est approximative) ; sinon, le texte brut.
    const lines = data.blocks?.flatMap((block) => block.paragraphs.flatMap((p) => p.lines)) ?? [];
    return lines.length ? linesToText(lines.map((l) => ({ text: l.text, top: l.bbox.y0, bottom: l.bbox.y1 }))) : data.text;
  } finally {
    await worker.terminate();
  }
}

async function readDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  // Mammoth sépare les paragraphes par une ligne vide : un vers par paragraphe est l'usage
  // le plus courant dans Word, on garde donc les lignes vides doublées pour les strophes.
  return value.replace(/\n\n(?!\n)/g, "\n").replace(/\n{2,}/g, "\n\n");
}

async function readOdt(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const xml = await zip.file("content.xml")?.async("string");
  if (!xml) throw new ImportError("Document OpenDocument illisible.");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const TEXT = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
  const lines: string[] = [];
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    const el = node as Element;
    if (el.namespaceURI === TEXT) {
      if (el.localName === "line-break") return "\n";
      if (el.localName === "tab") return " ";
      if (el.localName === "s") return " ".repeat(Number(el.getAttributeNS(TEXT, "c") ?? 1) || 1);
    }
    return Array.from(node.childNodes).map(walk).join("");
  };
  for (const p of Array.from(doc.getElementsByTagNameNS(TEXT, "*"))) {
    if (p.localName === "p" || p.localName === "h") lines.push(walk(p));
  }
  return lines.join("\n");
}

async function readPdf(file: File, progress: Progress): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("/ocr/pdf.worker.min.mjs", window.location.origin).href;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, 30); n++) {
    progress(n / pdf.numPages, `Lecture de la page ${n}…`);
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    // Lignes avec leur hauteur sur la page (l'axe vertical du PDF monte : on l'inverse). Une
    // ligne vide n'existe pas dans un PDF : c'est l'écart entre deux lignes qui révèle les
    // strophes, comme sur une photo.
    const lines: { text: string; top: number; bottom: number }[] = [];
    let text = "";
    let y = 0;
    let height = 0;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      if (!text) {
        y = item.transform[5];
        height = item.height || Math.abs(item.transform[3]) || 10;
      }
      text += item.str;
      if (item.hasEOL) {
        lines.push({ text, top: -y - height, bottom: -y });
        text = "";
      }
    }
    if (text) lines.push({ text, top: -y - height, bottom: -y });
    pages.push(linesToText(lines));
  }
  const text = pages.join("\n\n");
  if (!text.trim()) throw new ImportError("Ce PDF ne contient que des images : prenez plutôt une capture ou une photo de la page.");
  return text;
}

/** Texte brut d'un fichier importé (à passer ensuite à tidyImportedText). */
export async function readPoemFile(file: File, progress: Progress = () => {}): Promise<string> {
  if (file.size > MAX_BYTES) throw new ImportError("Fichier trop lourd (15 Mo au plus).");
  switch (importKind(file)) {
    case "image":
      return readImage(file, progress);
    case "docx":
      return readDocx(file);
    case "odt":
      return readOdt(file);
    case "pdf":
      return readPdf(file, progress);
    case "txt":
    case "md":
      return file.text();
    case "doc":
      throw new ImportError("Ancien format Word (.doc) : ouvrez-le et enregistrez-le en .docx, ou copiez le texte. Une capture d'écran fonctionne aussi.");
    default:
      throw new ImportError("Format non pris en charge : photo, capture, .docx, .odt, .pdf ou .txt.");
  }
}
