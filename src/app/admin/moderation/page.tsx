import type { Metadata } from "next";
import Link from "next/link";

import { featureAction, moderateAction } from "@/app/actions/admin";
import { AdminResetLinkForm } from "@/components/PasswordForms";
import { getDb } from "@/db/client";
import { REPORT_REASON_LABELS } from "@/lib/report";
import { formatDate } from "@/lib/text";
import { requireAdmin } from "@/server/guard";
import { mailConfigured } from "@/server/mail";
import { AUTO_HIDE_REPORTS, listReports, upcomingFeatures } from "@/server/poems";

export const metadata: Metadata = { title: "Modération", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_LABEL = { published: "Publié", draft: "Brouillon", hidden: "Masqué" } as const;

export default async function ModerationPage({ searchParams }: PageProps<"/admin/moderation">) {
  const [, query] = await Promise.all([requireAdmin(), searchParams]);
  const closed = (Array.isArray(query.vue) ? query.vue[0] : query.vue) === "traites";
  const db = await getDb();
  const [reports, features] = await Promise.all([listReports(db, closed ? "closed" : "open"), upcomingFeatures(db)]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl italic text-ink">Modération</h1>
        <Link href="/admin/retours" className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-ivory">
          Retours des lecteurs →
        </Link>
      </div>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Un poème de membre est masqué automatiquement à partir de {AUTO_HIDE_REPORTS} signalements de lecteurs différents. « Classer sans suite » le rétablit ; « Masquer » le garde retiré ; « Supprimer » l&apos;efface définitivement.
      </p>

      <section aria-labelledby="honneur" className="mt-8 rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-4">
        <h2 id="honneur" className="font-serif text-2xl text-ink">
          Mises à l&apos;honneur à venir
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Depuis la page d&apos;un poème de membre : « Mettre à l&apos;honneur ». Il prend la place du poème de la communauté tiré au sort, au premier jour libre.
        </p>
        {features.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Aucune pour l&apos;instant : le poème de la communauté est tiré au sort chaque jour.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {features.map((f) => (
              <li key={f.day} className="flex flex-wrap items-center gap-3">
                <span className="w-24 font-semibold text-ink">{f.day.split("-").reverse().join("/")}</span>
                <Link href={`/poemes/${f.slug}`} className="font-serif text-lg text-ink underline-offset-4 hover:underline">
                  {f.title}
                </Link>
                <span className="text-ink-soft">de {f.authorName}</span>
                <form action={featureAction}>
                  <input type="hidden" name="poemId" value={f.poemId} />
                  <input type="hidden" name="retour" value="/admin/moderation" />
                  <button name="annuler" value="1" className="text-rose-deep underline underline-offset-4">
                    Annuler
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

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
      <section aria-labelledby="acces" className="mt-16 border-t border-linen-deep/50 pt-8">
        <h2 id="acces" className="font-serif text-2xl text-ink">
          Mot de passe perdu d&apos;un membre
        </h2>
        <p className="mt-2 mb-5 max-w-2xl text-sm text-ink-soft">
          {mailConfigured()
            ? "Les membres reçoivent eux-mêmes leur lien par e-mail depuis « Mot de passe oublié ». En cas de souci, vous pouvez créer un lien ici."
            : "L'envoi d'e-mails n'est pas configuré (variables SMTP) : quand un membre vous écrit, vérifiez que la demande vient bien de lui, puis créez un lien ici et transmettez-le-lui."}
        </p>
        <AdminResetLinkForm />
      </section>
    </div>
  );
}
