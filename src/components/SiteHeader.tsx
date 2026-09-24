import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { site } from "@/config/site";
import type { User } from "@/db/schema";

const NAV = [
  { href: "/bibliotheque", label: "Bibliothèque" },
  { href: "/poetes", label: "Poètes" },
  { href: "/communaute", label: "Communauté" },
  { href: "/generateur", label: "Générateur" },
];

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="border-b border-linen-deep/60">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-5 sm:px-8">
        <Link href="/" className="font-serif text-3xl italic tracking-wide text-ink">
          {site.name}
        </Link>

        <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/ecrire" className="rounded-full bg-rose px-4 py-2 font-semibold text-ink transition-colors hover:bg-rose-soft">
            Écrire
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin/moderation" className="font-medium text-ink-soft transition-colors hover:text-ink">
                  Modération
                </Link>
              )}
              <Link href="/compte" className="font-medium text-ink-soft transition-colors hover:text-ink">
                {user.name}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="font-medium text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <Link href="/compte/connexion" className="font-medium text-ink-soft transition-colors hover:text-ink">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
