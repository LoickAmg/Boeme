import { describe, expect, it } from "vitest";

import { generateHomemadePoem } from "./generator";
import { LANGUAGES, LENGTH_IDS, STRUCTURE_IDS, THEME_IDS } from "./types";
import type { GeneratePoemInput } from "./types";

/** RNG déterministe pour des assertions reproductibles (pas de vrai hasard dans les tests). */
function makeSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

const ALL_INPUTS: GeneratePoemInput[] = LANGUAGES.flatMap((language) =>
  THEME_IDS.flatMap((theme) =>
    STRUCTURE_IDS.flatMap((structure) =>
      LENGTH_IDS.map((length) => ({ language, theme, structure, length })),
    ),
  ),
);

describe("generateHomemadePoem", () => {
  it("produces non-empty content for every language × theme × structure × length combination", () => {
    for (const input of ALL_INPUTS) {
      const poem = generateHomemadePoem(input, makeSeededRng(42));
      expect(poem.content.trim().length).toBeGreaterThan(0);
      expect(poem.source).toBe("maison");
    }
  });

  it("always produces exactly 3 lines for a haiku, regardless of length", () => {
    for (const language of LANGUAGES) {
      for (const theme of THEME_IDS) {
        for (const length of LENGTH_IDS) {
          const poem = generateHomemadePoem(
            { language, theme, structure: "haiku", length },
            makeSeededRng(7),
          );
          expect(poem.content.split("\n")).toHaveLength(3);
        }
      }
    }
  });

  it("scales vers_libre line count with length (ouverture + milieu + cloture)", () => {
    const expectedMiddleLines: Record<string, number> = { court: 2, moyen: 4, long: 6 };
    for (const length of LENGTH_IDS) {
      const poem = generateHomemadePoem(
        { language: "fr", theme: "tendre", structure: "vers_libre", length },
        makeSeededRng(11),
      );
      const lineCount = poem.content.split("\n").length;
      expect(lineCount).toBe(expectedMiddleLines[length] + 2);
    }
  });

  it("scales forme_courte_rimee couplet count with length", () => {
    const expectedCouplets: Record<string, number> = { court: 1, moyen: 2, long: 3 };
    for (const length of LENGTH_IDS) {
      const poem = generateHomemadePoem(
        { language: "en", theme: "lumineux", structure: "forme_courte_rimee", length },
        makeSeededRng(99),
      );
      const coupletBlocks = poem.content.split("\n\n");
      expect(coupletBlocks).toHaveLength(expectedCouplets[length]);
      for (const block of coupletBlocks) {
        expect(block.split("\n")).toHaveLength(2);
      }
    }
  });

  it("is deterministic for a given seeded RNG", () => {
    const input: GeneratePoemInput = {
      language: "fr",
      theme: "reveur",
      structure: "vers_libre",
      length: "moyen",
    };
    const first = generateHomemadePoem(input, makeSeededRng(2024));
    const second = generateHomemadePoem(input, makeSeededRng(2024));
    expect(first.content).toBe(second.content);
  });

  it("throws a clear error for an unknown structure", () => {
    const input: GeneratePoemInput = {
      language: "fr",
      theme: "tendre",
      structure: "sonnet" as GeneratePoemInput["structure"],
      length: "court",
    };
    expect(() => generateHomemadePoem(input)).toThrow(/Structure inconnue/);
  });
});
