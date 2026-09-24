import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PoemCard } from "@/components/PoemCard";
import { getDb } from "@/db/client";
import { formatDate } from "@/lib/text";
import { getMemberProfile, listPoems } from "@/server/poems";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/membres/[id]">): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberProfile(await getDb(), id);
  return member ? { title: member.name } : { title: "Membre introuvable", robots: { index: false } };
}

export default async function MemberPage({ params }: PageProps<"/membres/[id]">) {
  const { id } = await params;
  const db = await getDb();
  const member = await getMemberProfile(db, id);
  if (!member) notFound();

  const result = await listPoems(db, { origin: "member", userId: member.id, pageSize: 60 });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Membre depuis {formatDate(member.createdAt)}</p>
      <h1 className="mt-2 font-serif text-5xl italic text-ink">{member.name}</h1>
      {member.bio && <p className="mt-4 max-w-2xl whitespace-pre-line leading-relaxed text-ink-soft">{member.bio}</p>}

      <h2 className="mt-12 font-serif text-3xl text-ink">
        {result.total} poème{result.total > 1 ? "s" : ""} publié{result.total > 1 ? "s" : ""}
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {result.items.map((poem) => (
          <PoemCard key={poem.id} poem={poem} />
        ))}
      </div>
    </div>
  );
}
