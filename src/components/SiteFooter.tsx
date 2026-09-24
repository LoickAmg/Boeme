import Link from "next/link";

import { site } from "@/config/site";

const LINKS = [
  { href: "/charte", label: "Charte de publication" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-linen-deep/60 px-6 py-8 text-center text-xs text-ink-soft sm:px-8">
      <p className="font-serif text-lg italic text-ink">{site.name}</p>
      <p className="mx-auto mt-1">{site.tagline}</p>
      <p className="mx-auto mt-2 max-w-xl">
        Les poèmes de la bibliothèque proviennent de{" "}
        <a href="https://fr.wikisource.org" className="underline underline-offset-2" target="_blank" rel="noopener">
          Wikisource
        </a>{" "}
        et sont dans le domaine public ; chaque poème renvoie vers sa source.
      </p>
      <nav aria-label="Liens légaux" className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
