"use client";

import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/5 bg-white/[0.03] p-4 shadow-sm ${className}`}
    >
      {title ? (
        <header className="mb-3">
          <h2 className="text-sm font-semibold tracking-wide text-slate-300">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-slate-500 first:mt-0">
      {children}
    </h2>
  );
}

export const KIND_STYLE: Record<string, string> = {
  college: "border-slate-600/40 bg-slate-500/10 text-slate-300",
  lab: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  deep: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  skill: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  project: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  gym: "border-red-500/30 bg-red-500/10 text-red-200",
  rest: "border-teal-500/20 bg-teal-500/5 text-teal-200/80",
  review: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100",
};
