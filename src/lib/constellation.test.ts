import { describe, expect, it } from "vitest";

import { layoutSky } from "./constellation";
import type { SkyPoem } from "./constellation";

const THEMES = [
  { id: "amour", label: "Amour" },
  { id: "mer", label: "Mer" },
];

const poem = (id: number, theme: string, favoriteCount = 0): SkyPoem => ({ id, slug: `p${id}`, title: `P${id}`, authorName: "X", theme, origin: "classic", favoriteCount });

describe("constellation", () => {
  it("une constellation par thème présent, les poèmes sans thème à part", () => {
    const sky = layoutSky([poem(1, "amour"), poem(2, "amour"), poem(3, ""), poem(4, "inconnu")], THEMES);
    expect(sky.clusters.map((c) => c.label)).toEqual(["Amour", "Étoiles errantes"]);
    expect(sky.clusters.find((c) => c.id === "errantes")?.count).toBe(2);
    expect(sky.stars).toHaveLength(4);
  });

  it("place chaque étoile toujours au même endroit, dans le ciel, plus grande si aimée", () => {
    const a = layoutSky([poem(1, "mer"), poem(2, "mer", 30)], THEMES);
    const b = layoutSky([poem(1, "mer"), poem(2, "mer", 30)], THEMES);
    expect(a.stars).toEqual(b.stars);
    for (const s of a.stars) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(a.width);
      expect(s.y).toBeGreaterThan(0);
      expect(s.y).toBeLessThan(a.height);
    }
    expect(a.stars[1].r).toBeGreaterThan(a.stars[0].r);
    expect(a.links).toHaveLength(1);
  });
});
