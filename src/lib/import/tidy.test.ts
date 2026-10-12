import { describe, expect, it } from "vitest";

import { importKind, linesToText, tidyImportedText } from "./tidy";

describe("mise en forme d'un poème importé", () => {
  it("devine le titre, garde les strophes et nettoie les espaces", () => {
    const { title, body } = tidyImportedText("  « Sous la pluie »  \r\n\r\nLa pluie   tombe sur le toit\n\n\n\nComme un doigt  \nqui frappe\n\n");
    expect(title).toBe("Sous la pluie");
    expect(body).toBe("La pluie tombe sur le toit\n\nComme un doigt\nqui frappe");
  });

  it("recolle les mots coupés en fin de ligne, pas les vraies phrases", () => {
    const { body } = tidyImportedText("Une douce mélan-\ncolie me gagne\nUn trait-\nUnion de vie");
    expect(body).toBe("Une douce mélancolie me gagne\nUn trait-\nUnion de vie");
  });

  it("ne prend pas un premier vers pour un titre", () => {
    expect(tidyImportedText("Je marche dans la nuit,\n\nsans savoir où").title).toBe("");
    expect(tidyImportedText("Un seul vers").title).toBe("");
  });

  it("reconnaît les formats", () => {
    expect(importKind({ name: "photo.HEIC", type: "" })).toBe("image");
    expect(importKind({ name: "x", type: "image/png" })).toBe("image");
    expect(importKind({ name: "poeme.docx", type: "" })).toBe("docx");
    expect(importKind({ name: "vieux.doc", type: "" })).toBe("doc");
    expect(importKind({ name: "a.exe", type: "" })).toBe("unknown");
  });

  it("retrouve titre et strophes d'après la position des lignes sur la photo", () => {
    const line = (text: string, top: number, h = 40) => ({ text, top, bottom: top + h });
    const text = linesToText([
      line("Les lampions du soir", 70, 52),
      line("Quand la ville s'allume en silence,", 190),
      line("Je compte les fenêtres une à une,", 260),
      line("Chacune garde un peu de ma chance", 330),
      line("Et la nuit, douce et opportune,", 470),
      line("Me rend ce que le jour a pris.", 540),
    ]);
    expect(text).toBe(
      "Les lampions du soir\n\nQuand la ville s'allume en silence,\nJe compte les fenêtres une à une,\nChacune garde un peu de ma chance\n\nEt la nuit, douce et opportune,\nMe rend ce que le jour a pris.",
    );
    expect(tidyImportedText(text).title).toBe("Les lampions du soir");
  });
});
