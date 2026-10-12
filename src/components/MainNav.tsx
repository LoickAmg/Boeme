"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigation principale : page en cours mise en évidence ; sur téléphone, un bouton « Menu »
 * ouvre la liste complète (au lieu de liens serrés sur plusieurs lignes).
 */
export function MainNav({ items, extra, action }: { items: NavItem[]; extra?: React.ReactNode; action?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (mobile: boolean) =>
    items.map((item) => {
      const active = isActive(pathname, item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          // Une page choisie dans le menu le referme.
          onClick={mobile ? () => setOpen(false) : undefined}
          className={
            mobile
              ? `rounded-xl px-4 py-3 text-base ${active ? "bg-rose-soft/50 font-semibold text-ink" : "text-ink-soft hover:bg-linen/60"}`
              : `relative py-1 transition-colors hover:text-ink ${active ? "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:rounded-full after:bg-rose" : ""}`
          }
        >
          {item.label}
        </Link>
      );
    });

  return (
    <>
      <nav aria-label="Navigation principale" className="hidden items-center gap-x-6 text-sm font-medium text-ink-soft lg:flex">
        {links(false)}
      </nav>

      <div className="flex items-center gap-2 lg:hidden">
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
        <div id="menu-mobile" className="basis-full lg:hidden">
          <nav aria-label="Navigation principale" className="flex flex-col gap-1 border-t border-linen-deep/60 pt-3">
            {links(true)}
          </nav>
          {extra ? <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-linen-deep/60 px-1 pt-3 text-sm">{extra}</div> : null}
        </div>
      )}
    </>
  );
}
