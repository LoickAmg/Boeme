import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PoemForm } from "@/components/PoemForm";
import { getDb } from "@/db/client";
import { requireUser } from "@/server/guard";
import { listOwnPoems } from "@/server/poems";

export const metadata: Metadata = { title: "Modifier un poème", robots: { index: false } };

export default async function EditPage({ params }: PageProps<"/ecrire/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/ecrire/${id}`);

  const poemId = Number(id);
  if (!Number.isInteger(poemId) || poemId < 1) notFound();
  const poem = (await listOwnPoems(await getDb(), user)).find((item) => item.id === poemId);
  if (!poem || poem.status === "hidden") notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Modifier mon poème</h1>
      <p className="mt-3 mb-10 text-ink-soft">{poem.status === "published" ? "Ce poème est publié." : "Ce poème est un brouillon, visible de vous seul."}</p>
      <PoemForm
        initial={{
          id: poem.id,
          title: poem.title,
          body: poem.body,
          theme: poem.theme,
          language: poem.language,
          generated: poem.generated,
          published: poem.status === "published",
        }}
      />
    </div>
  );
}
