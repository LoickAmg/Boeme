import type { Metadata } from "next";
import Link from "next/link";

import { SkyMap } from "@/components/SkyMap";
import { getDb } from "@/db/client";
import { layoutSky } from "@/lib/constellation";
import { THEMES } from "@/lib/themes";
import { listConstellation } from "@/server/poems";

export const metadata: Metadata = {
  title: "Constellation",
  description: "Tous les poèmes de Boème en carte du ciel : une étoile par poème, une constellation par thème.",
  alternates: { canonical: "/constellation" },
};
export const dynamic = "force-dynamic";

export default async function ConstellationPage() {
  const sky = layoutSky(await listConstellation(await getDb()), THEMES);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Se perdre</p>
      <h1 className="mt-2 font-serif text-5xl italic text-ink sm:text-6xl">La constellation</h1>
      <p className="mt-3 mb-8 max-w-2xl text-ink-soft">
        Chaque étoile est un poème, chaque constellation un thème. Les classiques brillent d&apos;ivoire, ceux de la communauté de rose ; plus un poème est aimé, plus son étoile est
        vive.
      </p>
      <SkyMap sky={sky} />
      <nav aria-label="Constellations" className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Les constellations</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {sky.clusters.map((c) => (
            <li key={c.id}>
              <Link
                href={c.id === "errantes" ? "/bibliotheque" : `/bibliotheque?theme=${c.id}`}
                className="inline-block rounded-full border border-linen-deep bg-ivory-soft px-3 py-1.5 text-ink-soft hover:border-rose hover:text-ink"
              >
                {c.label} · {c.count}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
