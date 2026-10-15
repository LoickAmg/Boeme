import type { Metadata } from "next";
import Link from "next/link";

import { manageFeedbackAction } from "@/app/actions/feedback";
import { getDb } from "@/db/client";
import { FEEDBACK_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/server/guard";
import { FEEDBACK_KIND_LABELS, FEEDBACK_STATUS_LABELS, isFeedbackKind, listFeedback } from "@/server/feedback";
import type { FeedbackStatus } from "@/server/feedback";
import { mailConfigured } from "@/server/mail";

export const metadata: Metadata = { title: "Retours des lecteurs", robots: { index: false } };
export const dynamic = "force-dynamic";

const DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  nouveau: "bg-rose-deep text-ivory",
  lu: "bg-linen-deep text-ink",
  traite: "bg-[#4f7a54] text-ivory",
};

export default async function FeedbackAdminPage({ searchParams }: PageProps<"/admin/retours">) {
  await requireAdmin();
  const query = await searchParams;
  const filter = typeof query.filtre === "string" && (FEEDBACK_STATUSES as readonly string[]).includes(query.filtre) ? (query.filtre as FeedbackStatus) : undefined;
  const db = await getDb();
  const [items, all] = await Promise.all([listFeedback(db, { status: filter }), listFeedback(db)]);
  const counts = Object.fromEntries(FEEDBACK_STATUSES.map((s) => [s, all.filter((f) => f.status === s).length])) as Record<FeedbackStatus, number>;

  const pill = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-ink text-ivory" : "border border-linen-deep bg-ivory-soft text-ink-soft hover:border-rose hover:text-ink"}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <Link href="/admin/moderation" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Modération
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic text-ink">Retours des lecteurs</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft">
        Envoyés depuis le bouton « Un avis ? » ou la page{" "}
        <Link href="/avis" className="underline underline-offset-4">
          /avis
        </Link>
        .{" "}
        {mailConfigured()
          ? "Chaque nouveau retour vous est aussi envoyé par e-mail."
          : "L'envoi d'e-mails n'est pas configuré : les retours ne sont visibles qu'ici."}
      </p>

      <nav aria-label="Filtrer" className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/retours" className={pill(!filter)}>
          Tous ({all.length})
        </Link>
        {FEEDBACK_STATUSES.map((status) => (
          <Link key={status} href={`/admin/retours?filtre=${status}`} className={pill(filter === status)}>
            {FEEDBACK_STATUS_LABELS[status]} ({counts[status]})
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="mt-10 text-ink-soft">Aucun retour {filter ? "dans cette catégorie" : "pour l'instant"}.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-linen-deep/60 bg-ivory-soft/50 px-5 py-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-1 font-semibold uppercase tracking-wider ${STATUS_STYLE[item.status]}`}>{FEEDBACK_STATUS_LABELS[item.status]}</span>
                <span className="rounded-full border border-ink/25 px-2.5 py-1 font-semibold uppercase tracking-wider text-ink">
                  {isFeedbackKind(item.kind) ? FEEDBACK_KIND_LABELS[item.kind] : item.kind}
                </span>
                <span className="text-ink-soft">{DATE.format(item.createdAt)}</span>
                {item.page && (
                  <Link href={item.page} className="text-ink-soft underline underline-offset-2 hover:text-ink">
                    {item.page}
                  </Link>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line font-serif text-lg leading-relaxed text-ink">{item.message}</p>
              <p className="mt-3 text-sm text-ink-soft">
                {item.userId ? (
                  <>
                    Par{" "}
                    <Link href={`/membres/${item.userId}`} className="underline underline-offset-2">
                      {item.authorName || "un membre"}
                    </Link>{" "}
                    (membre)
                  </>
                ) : (
                  <>Par {item.authorName || "un visiteur anonyme"}</>
                )}
                {item.contact && (
                  <>
                    {" — "}
                    <a href={`mailto:${item.contact}?subject=${encodeURIComponent("Votre retour sur Boème")}`} className="underline underline-offset-2">
                      répondre à {item.contact}
                    </a>
                  </>
                )}
              </p>
              <form action={manageFeedbackAction} className="mt-4 flex flex-wrap gap-2 text-sm">
                <input type="hidden" name="id" value={item.id} />
                {FEEDBACK_STATUSES.filter((s) => s !== item.status).map((status) => (
                  <button key={status} name="action" value={status} className="rounded-full border border-linen-deep bg-ivory px-3 py-1.5 font-semibold text-ink-soft hover:border-rose hover:text-ink">
                    Marquer « {FEEDBACK_STATUS_LABELS[status]} »
                  </button>
                ))}
                <button name="action" value="supprimer" className="rounded-full px-3 py-1.5 font-semibold text-rose-deep underline underline-offset-4">
                  Supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
