"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import type { Sky, Star } from "@/lib/constellation";

type Filter = "tous" | "classic" | "member";

/** Étoiles de fond (décor), toujours les mêmes. */
function backdrop(width: number, height: number) {
  let seed = 11;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  return Array.from({ length: 260 }, () => ({ x: rnd() * width, y: rnd() * height, r: 0.4 + rnd() * 1.1, o: 0.15 + rnd() * 0.45 }));
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Carte du ciel des poèmes : glisser pour se déplacer, molette ou deux doigts pour zoomer,
 * survoler une étoile pour lire son titre, cliquer pour ouvrir le poème.
 */
export function SkyMap({ sky }: { sky: Sky }) {
  const router = useRouter();
  const svg = useRef<SVGSVGElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<{ star: Star; left: number; top: number } | null>(null);
  const [filter, setFilter] = useState<Filter>("tous");
  const [query, setQuery] = useState("");
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0);
  const pinch = useRef<{ dist: number; k: number } | null>(null);
  const decor = useMemo(() => backdrop(sky.width, sky.height), [sky.width, sky.height]);
  const needle = normalize(query.trim());

  /** Pixels écran → unités du ciel (la carte remplit le cadre ; sur téléphone, on la parcourt au doigt). */
  function ratio(): number {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return 1;
    return 1 / Math.max(box.width / sky.width, box.height / sky.height);
  }

  function zoomAt(factor: number, clientX: number, clientY: number) {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const r = ratio();
    // Point du ciel sous le curseur, avant et après : on garde ce point immobile.
    const offsetX = (box.width * r - sky.width) / 2;
    const offsetY = (box.height * r - sky.height) / 2;
    const px = (clientX - box.left) * r - offsetX;
    const py = (clientY - box.top) * r - offsetY;
    setView((v) => {
      const k = Math.max(0.6, Math.min(6, v.k * factor));
      const wx = (px - v.x) / v.k;
      const wy = (py - v.y) / v.k;
      return { k, x: px - wx * k, y: py - wy * k };
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), k: view.k };
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const target = (pinch.current.k * dist) / pinch.current.dist;
      zoomAt(target / view.k, (a.x + b.x) / 2, (a.y + b.y) / 2);
      moved.current += 10;
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    // Capturé seulement une fois le glissement commencé : un simple clic reste sur l'étoile.
    if (moved.current > 6 && !(e.currentTarget as Element).hasPointerCapture(e.pointerId)) (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const r = ratio();
    setView((v) => ({ ...v, x: v.x + dx * r, y: v.y + dy * r }));
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  function visible(star: Star): boolean {
    if (filter !== "tous" && star.origin !== filter) return false;
    if (needle && !normalize(`${star.title} ${star.authorName}`).includes(needle)) return false;
    return true;
  }
  const matches = needle ? sky.stars.filter(visible).length : null;

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full border border-linen-deep bg-ivory-soft p-1 text-sm">
          {(
            [
              ["tous", "Tous"],
              ["classic", "Classiques"],
              ["member", "Communauté"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`rounded-full px-3 py-1 ${filter === id ? "bg-ink text-ivory" : "text-ink-soft"}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-linen-deep bg-ivory-soft px-4 py-1.5 text-sm sm:max-w-xs">
          <span className="sr-only">Chercher une étoile</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher une étoile (titre, poète)…" className="w-full bg-transparent outline-none placeholder:text-ink-faint" />
        </label>
        {matches !== null && (
          <span className="text-sm text-ink-soft">
            {matches} étoile{matches > 1 ? "s" : ""}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button type="button" aria-label="Zoomer" onClick={() => zoomAt(1.4, (svg.current?.getBoundingClientRect().left ?? 0) + (svg.current?.clientWidth ?? 0) / 2, (svg.current?.getBoundingClientRect().top ?? 0) + (svg.current?.clientHeight ?? 0) / 2)} className="h-9 w-9 rounded-full border border-linen-deep bg-ivory-soft text-lg">
            +
          </button>
          <button type="button" aria-label="Dézoomer" onClick={() => zoomAt(1 / 1.4, (svg.current?.getBoundingClientRect().left ?? 0) + (svg.current?.clientWidth ?? 0) / 2, (svg.current?.getBoundingClientRect().top ?? 0) + (svg.current?.clientHeight ?? 0) / 2)} className="h-9 w-9 rounded-full border border-linen-deep bg-ivory-soft text-lg">
            −
          </button>
          <button type="button" onClick={() => setView({ x: 0, y: 0, k: 1 })} className="rounded-full border border-linen-deep bg-ivory-soft px-3 text-sm">
            Recentrer
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_50%_10%,#2a1f3d_0%,#141026_55%,#0b0918_100%)] shadow-[0_20px_50px_rgba(20,16,38,0.35)]">
        <svg
          ref={svg}
          viewBox={`0 0 ${sky.width} ${sky.height}`}
          preserveAspectRatio="xMidYMid slice"
          className="block h-[70vh] min-h-[480px] w-full touch-none select-none"
          role="img"
          aria-label={`Constellation de ${sky.stars.length} poèmes, regroupés par thème`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => setHover(null)}
          onWheel={(e) => zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY)}
        >
          <g fill="#ffffff">
            {decor.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
            ))}
          </g>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {sky.clusters.map((c) => (
              <text key={c.id} x={c.x} y={c.labelY} textAnchor="middle" className="pointer-events-none fill-[#ddc0bd] font-serif italic" fontSize={40} opacity={0.55}>
                {c.label}
              </text>
            ))}
            <g stroke="#ddc0bd" strokeWidth={1.2 / view.k} opacity={0.45}>
              {sky.links.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
            </g>
            {sky.stars.map((star) => {
              const on = visible(star);
              const color = star.origin === "member" ? "#e8b9b5" : "#fbf3df";
              return (
                <a
                  key={star.id}
                  href={`/poemes/${star.slug}`}
                  aria-label={`${star.title}, ${star.authorName}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (moved.current < 6) router.push(`/poemes/${star.slug}`);
                  }}
                  onPointerEnter={(e) => {
                    const box = svg.current?.getBoundingClientRect();
                    if (box) setHover({ star, left: e.clientX - box.left, top: e.clientY - box.top });
                  }}
                  onPointerLeave={() => setHover((h) => (h?.star.id === star.id ? null : h))}
                  className="cursor-pointer focus:outline-none"
                  style={{ opacity: on ? 1 : 0.12 }}
                >
                  <circle cx={star.x} cy={star.y} r={(star.r * 3.2) / Math.sqrt(view.k)} fill={color} opacity={0.12} />
                  <circle cx={star.x} cy={star.y} r={star.r / Math.sqrt(view.k)} fill={color} className="twinkle" style={{ animationDelay: `${(star.id % 9) * 0.5}s` }} />
                  {/* Zone de clic confortable au doigt. */}
                  <circle cx={star.x} cy={star.y} r={14 / view.k} fill="transparent" />
                </a>
              );
            })}
          </g>
        </svg>

        {hover && (
          <div className="pointer-events-none absolute z-10 max-w-64 -translate-x-1/2 rounded-xl bg-ivory/95 px-4 py-2 shadow-lg" style={{ left: hover.left, top: hover.top - 70 }}>
            <p className="font-serif text-lg italic leading-tight text-ink">{hover.star.title}</p>
            <p className="text-xs text-ink-soft">
              {hover.star.authorName}
              {hover.star.origin === "member" ? " · communauté" : ""}
              {hover.star.favoriteCount ? ` · ♡ ${hover.star.favoriteCount}` : ""}
            </p>
          </div>
        )}
        <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-ivory/60">Glissez pour voyager · molette ou deux doigts pour zoomer · cliquez une étoile pour lire</p>
      </div>
    </div>
  );
}
