"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const TABS = [
  { href: "/", label: "Today", icon: "◎" },
  { href: "/gym", label: "Gym", icon: "🏋" },
  { href: "/shutdown", label: "Shutdown", icon: "🌙" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙" },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
              active
                ? "bg-emerald-500/15 font-semibold text-emerald-300"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <span aria-hidden>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
