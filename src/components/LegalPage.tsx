import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updatedLabel,
  children,
}: {
  title: string;
  updatedLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:px-8 sm:py-16">
      <section className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl italic text-ink sm:text-5xl">{title}</h1>
        <p className="text-xs text-ink-faint">{updatedLabel}</p>
      </section>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink-soft sm:text-base">
        {children}
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-serif text-xl text-ink">{heading}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
