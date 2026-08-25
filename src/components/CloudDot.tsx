"use client";

import { useApp } from "@/lib/store";

const LABEL: Record<string, { text: string; cls: string }> = {
  local: { text: "Local only", cls: "bg-slate-500" },
  connecting: { text: "Syncing…", cls: "bg-amber-400 animate-pulse" },
  synced: { text: "Cloud synced", cls: "bg-emerald-400" },
  offline: { text: "Offline — changes queued locally", cls: "bg-red-400" },
  error: { text: "Sync error", cls: "bg-red-500" },
};

export default function CloudDot() {
  const { cloud } = useApp();
  const l = LABEL[cloud] ?? LABEL.local;
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className={`h-2 w-2 rounded-full ${l.cls}`} />
      <span className="hidden md:inline">{l.text}</span>
    </span>
  );
}
