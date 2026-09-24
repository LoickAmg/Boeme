import type { Metadata } from "next";
import Link from "next/link";

import { moderateAction } from "@/app/actions/admin";
import { getDb } from "@/db/client";
import { REPORT_REASON_LABELS } from "@/lib/report";
import { formatDate } from "@/lib/text";
import { requireAdmin } from "@/server/guard";
import { AUTO_HIDE_REPORTS, listReports } from "@/server/poems";

export const metadata: Metadata = { title: "Modération", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_LABEL = { published: "Publié", draft: "Brouillon", hidden: "Masqué" } as const;

export default async function ModerationPage({ searchParams }: PageProps<"/admin/moderation">) {
  const [, query] = await Promise.all([requireAdmin(), searchParams]);
  const closed = (Array.isArray(query.vue) ? query.vue[0] : query.vue) === "traites";
  const reports = await listReports(await getDb(), closed ? "closed" : "open");

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Modération</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Un poème de membre est masqué automatiquement à partir de {AUTO_HIDE_REPORTS} signalements de lecteurs différents. « Classer sans suite » le rétablit ; « Masquer » le garde retiré ; « Supprimer » l&apos;efface définitivement.
      </p>

      <nav aria-label="Filtre" className="mt-6 flex gap-4 text-sm font-medium">
        <Link href="/admin/moderation" aria-current={!closed ? "page" : undefined} className={!closed ? "text-ink underline underline-offset-4" : "text-ink-soft hover:text-ink"}>
          À traiter
        </Link>
        <Link href="/admin/moderation?vue=traites" aria-current={closed ? "page" : undefined} className={closed ? "text-ink underline underline-offset-4" : "text-ink-soft hover:text-ink"}>
          Traités
        </Link>
      </nav>

      {reports.length === 0 ? (
        <p className="mt-10 text-ink-soft">{closed ? "Aucun signalement traité." : "Aucun signalement à traiter."}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-serif text-xl text-ink">
                  <Link href={`/poemes/${report.poemSlug}`} className="underline-offset-4 hover:underline">
                    {report.poemTitle}
                  </Link>{" "}
                  <span className="text-sm text-ink-soft">de {report.authorName}</span>
                </p>
                <p className="text-xs text-ink-soft">
                  {STATUS_LABEL[report.poemStatus]} · {formatDate(report.createdAt)}
                </p>
              </div>
              <p className="mt-2 text-sm text-ink">
                <strong>{REPORT_REASON_LABELS[report.reason]}</strong>
                {report.reporterName ? ` — signalé par ${report.reporterName}` : ""}
              </p>
              {report.note && <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{report.note}</p>}

              <form action={moderateAction} className="mt-4 flex flex-wrap gap-3 text-sm">
                <input type="hidden" name="reportId" value={report.id} />
                {(report.poemStatus === "published" || report.poemStatus === "draft") && report.poemOrigin === "member" && !closed && (
                  <button name="action" value="hide" className="rounded-full bg-ink px-4 py-2 font-semibold text-ivory transition-colors hover:bg-rose-deep">
                    Masquer
                  </button>
                )}
                <button name="action" value="dismiss" className="rounded-full border border-linen-deep bg-ivory px-4 py-2 font-semibold text-ink-soft transition-colors hover:border-rose hover:text-ink">
                  {report.poemStatus === "hidden" ? "Classer sans suite et rétablir" : "Classer sans suite"}
                </button>
                {report.poemOrigin === "member" && (
                  <button name="action" value="delete" className="rounded-full border border-rose-deep px-4 py-2 font-semibold text-rose-deep transition-colors hover:bg-rose-soft/40">
                    Supprimer le poème
                  </button>
                )}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
