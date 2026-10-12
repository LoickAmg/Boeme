// Copie dans public/ocr les fichiers de lecture des poèmes importés, servis par le site
// lui-même (aucun appel à un serveur tiers : l'image ou le document ne quitte jamais
// l'appareil du lecteur) :
// - reconnaissance de texte (Tesseract.js) : script du worker, moteurs LSTM (avec et sans
//   SIMD, le navigateur prend le meilleur qu'il sait exécuter), données du français ;
// - lecture des PDF (pdf.js) : son worker.
// Lancé après chaque installation (postinstall), donc aussi sur Vercel.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const out = path.resolve("public/ocr");
const copies = [
  ["node_modules/tesseract.js/dist/worker.min.js", "worker.min.js"],
  ["node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js", "core/tesseract-core-lstm.wasm.js"],
  ["node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js", "core/tesseract-core-simd-lstm.wasm.js"],
  ["node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js", "core/tesseract-core-relaxedsimd-lstm.wasm.js"],
  ["node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"],
];

for (const [from, to] of copies) {
  const src = path.resolve(from);
  if (!fs.existsSync(src)) {
    console.warn(`copy-reader-assets : ${from} introuvable (dépendances pas encore installées ?)`);
    continue;
  }
  const dest = path.join(out, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}
// Données du français décompressées : certains filtres réseau (antivirus, proxys d'entreprise)
// bloquent les fichiers « .gz » ; l'hébergeur compresse de toute façon à l'envoi.
const lang = path.resolve("node_modules/@tesseract.js-data/fra/4.0.0_best_int/fra.traineddata.gz");
if (fs.existsSync(lang)) {
  fs.mkdirSync(path.join(out, "lang"), { recursive: true });
  fs.writeFileSync(path.join(out, "lang/fra.traineddata"), zlib.gunzipSync(fs.readFileSync(lang)));
  fs.rmSync(path.join(out, "lang/fra.traineddata.gz"), { force: true });
}
console.log("Fichiers de lecture des poèmes importés copiés dans public/ocr.");
