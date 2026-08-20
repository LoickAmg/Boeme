import { getThemeBank } from "./wordbanks";
import type { GeneratedPoem, GeneratePoemInput, ThemeBank } from "./types";

/** Injectable pour les tests (RNG déterministe) — Math.random par défaut. */
export type Rng = () => number;

const MIDDLE_LINES_BY_LENGTH: Record<GeneratePoemInput["length"], number> = {
  court: 2,
  moyen: 4,
  long: 6,
};

const COUPLETS_BY_LENGTH: Record<GeneratePoemInput["length"], number> = {
  court: 1,
  moyen: 2,
  long: 3,
};

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) {
    throw new Error("Banque de mots vide — impossible de piocher un vers.");
  }
  return items[Math.floor(rng() * items.length)];
}

function pickMany<T>(items: readonly T[], count: number, rng: Rng): T[] {
  const shuffled = shuffle(items, rng);
  if (shuffled.length >= count) {
    return shuffled.slice(0, count);
  }
  // Pas assez de lignes distinctes dans la banque : on complète en
  // repiochant (avec répétition) plutôt que d'échouer.
  const result = [...shuffled];
  while (result.length < count) {
    result.push(pickOne(items, rng));
  }
  return result;
}

function generateHaiku(bank: ThemeBank, rng: Rng): string {
  const [firstFive, secondFive] = pickMany(bank.haiku5, 2, rng);
  const seven = pickOne(bank.haiku7, rng);
  return [firstFive, seven, secondFive].join("\n");
}

function generateVersLibre(bank: ThemeBank, length: GeneratePoemInput["length"], rng: Rng): string {
  const ouverture = pickOne(bank.versLibre.ouverture, rng);
  const cloture = pickOne(bank.versLibre.cloture, rng);
  const milieu = pickMany(bank.versLibre.milieu, MIDDLE_LINES_BY_LENGTH[length], rng);
  return [ouverture, ...milieu, cloture].join("\n");
}

function generateFormeCourteRimee(
  bank: ThemeBank,
  length: GeneratePoemInput["length"],
  rng: Rng,
): string {
  const couplets = pickMany(bank.couplets, COUPLETS_BY_LENGTH[length], rng);
  return couplets.map(([a, b]) => `${a}\n${b}`).join("\n\n");
}

/**
 * Générateur maison : aucune API externe, aucune clé requise. Recombine
 * des vers écrits à la main (par thème/langue/structure) plutôt que de
 * générer du texte "de zéro" — garantit une qualité et une cohérence
 * grammaticale constantes (voir README pour le choix).
 */
export function generateHomemadePoem(input: GeneratePoemInput, rng: Rng = Math.random): GeneratedPoem {
  const bank = getThemeBank(input.language, input.theme);

  switch (input.structure) {
    case "haiku":
      return { content: generateHaiku(bank, rng), source: "maison" };
    case "vers_libre":
      return { content: generateVersLibre(bank, input.length, rng), source: "maison" };
    case "forme_courte_rimee":
      return { content: generateFormeCourteRimee(bank, input.length, rng), source: "maison" };
    default: {
      const exhaustiveCheck: never = input.structure;
      throw new Error(`Structure inconnue : ${exhaustiveCheck}`);
    }
  }
}
