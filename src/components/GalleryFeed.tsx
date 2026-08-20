"use client";

import { useState } from "react";

import { PoemCard } from "@/components/PoemCard";
import type { Poem } from "@/db/schema";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";

interface GalleryFeedProps {
  initialPoems: Poem[];
  initialHasMore: boolean;
}

export function GalleryFeed({ initialPoems, initialHasMore }: GalleryFeedProps) {
  const { dict } = useLocale();
  const [poems, setPoems] = useState(initialPoems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function loadMore() {
    setStatus("loading");
    try {
      const response = await fetch(
        `/api/poems?limit=${GALLERY_PAGE_SIZE}&offset=${poems.length}`,
      );
      if (!response.ok) {
        throw new Error("Échec du chargement.");
      }
      const data = (await response.json()) as { poems: Poem[]; hasMore: boolean };
      setPoems((current) => [...current, ...data.poems]);
      setHasMore(data.hasMore);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  if (poems.length === 0) {
    return <p className="text-sm text-ink-soft">{dict.gallery.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {poems.map((poem) => (
          <PoemCard key={poem.id} poem={poem} />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-full border border-linen-deep bg-ivory-soft px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-rose hover:text-rose-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? dict.gallery.loading : dict.gallery.loadMore}
          </button>
          {status === "error" && (
            <p className="text-sm text-rose-deep">{dict.gallery.loadError}</p>
          )}
        </div>
      )}
    </div>
  );
}
