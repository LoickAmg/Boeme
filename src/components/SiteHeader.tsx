import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { MainNav } from "@/components/MainNav";
import type { NavItem } from "@/components/MainNav";
import { site } from "@/config/site";
import type { User } from "@/db/schema";

export const NAV: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/bibliotheque", label: "Bibliothèque" },
  { href: "/poetes", label: "Poètes" },
  { href: "/communaute", label: "Communauté" },
  { href: "/cadavre-exquis", label: "Cadavre exquis" },
  { href: "/constellation", label: "Constellation" },
  { href: "/generateur", label: "Générateur" },
];

function Account({ user }: { user: User | null }) {
  return user ? (
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
  );
}

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-linen-deep/60 bg-ivory/90 backdrop-blur-md">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 sm:px-8">
        <Link href="/" className="font-serif text-3xl italic tracking-wide text-ink" aria-label={`${site.name}, accueil`}>
          {site.name}
        </Link>

        <MainNav
          items={NAV}
          extra={<Account user={user} />}
          action={
            <Link href="/ecrire" className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft">
              Écrire
            </Link>
          }
        />

        <div className="hidden flex-wrap items-center gap-x-4 gap-y-2 text-sm xl:flex">
          <Link href="/ecrire" className="rounded-full bg-rose px-4 py-2 font-semibold text-ink transition-colors hover:bg-rose-soft">
            Écrire
          </Link>
          <Account user={user} />
        </div>
      </div>
    </header>
  );
}
