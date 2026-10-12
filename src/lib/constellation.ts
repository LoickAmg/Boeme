// Disposition de la constellation : chaque thème est une constellation (les poèmes sans thème
// forment les « étoiles errantes »), chaque poème une étoile placée de façon stable (sa
// position dépend de son identifiant : elle ne bouge pas d'une visite à l'autre), d'autant
// plus brillante qu'elle est aimée. Quelques traits relient les plus brillantes, comme sur une
// carte du ciel.

export interface SkyPoem {
  id: number;
  slug: string;
  title: string;
  authorName: string;
  theme: string;
  origin: "classic" | "reference" | "member";
  favoriteCount: number;
}

export interface Star extends SkyPoem {
  x: number;
  y: number;
  r: number;
}

export interface Cluster {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Position du nom, sous la constellation. */
  labelY: number;
  count: number;
}

export interface Sky {
  width: number;
  height: number;
  stars: Star[];
  clusters: Cluster[];
  links: [number, number, number, number][];
}

/** Deux nombres pseudo-aléatoires stables (0 à 1) tirés d'un identifiant. */
function hash2(id: number): [number, number] {
  let t = (id * 2654435761) >>> 0;
  const next = () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  return [next(), next()];
}

export function layoutSky(poems: SkyPoem[], themes: readonly { id: string; label: string }[]): Sky {
  const width = 2000;
  const height = 1300;
  const groups = [...themes.map((t) => ({ id: t.id, label: t.label })), { id: "", label: "Étoiles errantes" }];
  const byGroup = new Map<string, SkyPoem[]>(groups.map((g) => [g.id, []]));
  for (const p of poems) (byGroup.get(byGroup.has(p.theme) ? p.theme : "") ?? []).push(p);
  const present = groups.filter((g) => (byGroup.get(g.id)?.length ?? 0) > 0);

  const clusters: Cluster[] = present.map((g, i) => {
    // Sur une grande ellipse, un peu irrégulière pour ne pas faire « horloge ».
    const angle = (i / present.length) * Math.PI * 2 - Math.PI / 2;
    const wobble = i % 2 === 0 ? 1 : 0.78;
    return {
      id: g.id || "errantes",
      label: g.label,
      x: width / 2 + Math.cos(angle) * 760 * wobble,
      y: height / 2 + Math.sin(angle) * 470 * wobble,
      labelY: 0,
      count: byGroup.get(g.id)?.length ?? 0,
    };
  });

  const stars: Star[] = [];
  const links: Sky["links"] = [];
  present.forEach((g, i) => {
    const members = byGroup.get(g.id) ?? [];
    const c = clusters[i];
    const spread = 60 + Math.sqrt(members.length) * 16;
    c.labelY = c.y + spread * 0.8 + 44;
    const placed = members.map((p) => {
      const [u, v] = hash2(p.id);
      const angle = u * Math.PI * 2;
      const dist = Math.sqrt(v) * spread;
      return { ...p, x: c.x + Math.cos(angle) * dist, y: c.y + Math.sin(angle) * dist * 0.8, r: Math.min(9, 2.8 + Math.log1p(p.favoriteCount) * 1.6) };
    });
    stars.push(...placed);

    // Tracé de la constellation : les plus brillantes, reliées de proche en proche.
    const bright = [...placed].sort((a, b) => b.r - a.r || a.id - b.id).slice(0, 7);
    if (bright.length > 1) {
      const path = [bright.shift()!];
      while (bright.length) {
        const last = path[path.length - 1];
        let best = 0;
        for (let k = 1; k < bright.length; k++) {
          if (Math.hypot(bright[k].x - last.x, bright[k].y - last.y) < Math.hypot(bright[best].x - last.x, bright[best].y - last.y)) best = k;
        }
        path.push(bright.splice(best, 1)[0]);
      }
      for (let k = 1; k < path.length; k++) links.push([path[k - 1].x, path[k - 1].y, path[k].x, path[k].y]);
    }
  });

  return { width, height, stars, clusters, links };
}
