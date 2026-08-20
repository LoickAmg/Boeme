import { describe, expect, it } from "vitest";

import { LANGUAGES, THEME_IDS } from "./types";
import { getThemeBank } from "./wordbanks";

describe("getThemeBank", () => {
  it("returns a fully populated bank for every language × theme combination", () => {
    for (const language of LANGUAGES) {
      for (const theme of THEME_IDS) {
        const bank = getThemeBank(language, theme);
        expect(bank.haiku5.length).toBeGreaterThanOrEqual(2);
        expect(bank.haiku7.length).toBeGreaterThanOrEqual(1);
        expect(bank.versLibre.ouverture.length).toBeGreaterThanOrEqual(1);
        expect(bank.versLibre.milieu.length).toBeGreaterThanOrEqual(6);
        expect(bank.versLibre.cloture.length).toBeGreaterThanOrEqual(1);
        expect(bank.couplets.length).toBeGreaterThanOrEqual(3);
        for (const [a, b] of bank.couplets) {
          expect(a.trim().length).toBeGreaterThan(0);
          expect(b.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});
