"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavLink {
  href: string;
  label: string;
}

/** Une entrée du menu : un lien, ou un groupe de liens (déroulant sur ordinateur, rubrique sur téléphone). */
export type NavItem = NavLink | { label: string; short: string; children: NavLink[] };

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Groupe déroulant de la barre d'ordinateur ; se referme au clic ailleurs, à Échap ou en changeant de page. */
function DesktopGroup({ label, items, pathname }: { label: string; items: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const active = items.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex items-center gap-1 py-1 transition-colors hover:text-ink ${
          active ? "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:rounded-full after:bg-rose" : ""
        }`}
      >
        {label}
        <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-40 mt-3 w-60 -translate-x-1/2 rounded-2xl border border-linen-deep/70 bg-ivory p-2 shadow-[0_18px_40px_rgba(58,51,45,0.14)]">
          {items.map((item) => {
            const current = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-2.5 ${current ? "bg-rose-soft/50 font-semibold text-ink" : "text-ink-soft hover:bg-linen/60 hover:text-ink"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Navigation principale : page en cours mise en évidence ; sur téléphone, un bouton « Menu »
 * ouvre la liste complète (au lieu de liens serrés sur plusieurs lignes).
 */
export function MainNav({ items, extra, action }: { items: NavItem[]; extra?: React.ReactNode; action?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Le menu se referme dès que la page change (même par un lien hors du menu).
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  const mobileLink = (item: NavLink, nested = false) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        // Une page choisie dans le menu le referme.
        onClick={() => setOpen(false)}
        className={`rounded-xl px-4 py-3 text-base ${nested ? "ml-3" : ""} ${active ? "bg-rose-soft/50 font-semibold text-ink" : "text-ink-soft hover:bg-linen/60"}`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <nav aria-label="Navigation principale" className="hidden items-center gap-x-6 text-sm font-medium text-ink-soft xl:flex xl:gap-x-5">
        {items.map((item) => {
          if ("children" in item) return <DesktopGroup key={item.label} label={item.short} items={item.children} pathname={pathname} />;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative py-1 transition-colors hover:text-ink ${active ? "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:rounded-full after:bg-rose" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 xl:hidden">
        {action}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 text-sm font-semibold text-ink"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="flex w-4 flex-col gap-[3px]">
            <span className={`h-[2px] rounded bg-ink transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`h-[2px] rounded bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-[2px] rounded bg-ink transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
          Menu
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="max-h-[calc(100dvh-5rem)] basis-full overflow-y-auto xl:hidden">
          <nav aria-label="Navigation principale" className="flex flex-col gap-1 border-t border-linen-deep/60 pt-3">
            {items.map((item) =>
              "children" in item ? (
                <div key={item.label} className="mt-2 flex flex-col gap-1 rounded-2xl bg-linen/40 py-2">
                  <p className="px-4 pt-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">{item.label}</p>
                  {item.children.map((child) => mobileLink(child, true))}
                </div>
              ) : (
                mobileLink(item)
              ),
            )}
          </nav>
          {extra ? (
            // Un clic sur « Mon espace », « Connexion »… referme aussi le menu.
            <div onClick={() => setOpen(false)} className="mt-3 flex flex-wrap items-center gap-3 border-t border-linen-deep/60 px-1 pt-3 pb-2 text-sm">
              {extra}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
