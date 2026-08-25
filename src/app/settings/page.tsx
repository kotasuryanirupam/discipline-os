"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Card, SectionTitle, KIND_STYLE } from "@/components/ui";
import type { BlockKind, MuscleGroup } from "@/lib/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KINDS: BlockKind[] = ["college", "lab", "deep", "skill", "project", "gym", "rest", "review"];

export default function SettingsPage() {
  const {
    state,
    updateHabit,
    addHabit,
    removeHabit,
    addBlock,
    removeBlock,
    updateSettings,
    cloud,
    auth,
    claimEmail,
    requestMagicLink,
  } = useApp();

  const [newHabit, setNewHabit] = useState({ name: "", icon: "✅", mvd: "" });
  const [blockDay, setBlockDay] = useState(1);
  const [block, setBlock] = useState({ start: "18:00", end: "19:00", label: "", kind: "deep" as BlockKind });
  const [customEx] = useState("");
  const [email, setEmail] = useState("");
  const [authMsg, setAuthMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  async function handleClaim() {
    if (authBusy) return;
    setAuthBusy(true);
    setAuthMsg(null);
    const res = await claimEmail(email.trim());
    setAuthMsg(res);
    setAuthBusy(false);
  }

  async function handleMagic() {
    if (authBusy) return;
    setAuthBusy(true);
    setAuthMsg(null);
    const res = await requestMagicLink(email.trim());
    setAuthMsg(res);
    setAuthBusy(false);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `discipline-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Make it yours</p>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Unified account — one streak across every device */}
      <Card
        title="🔗 Account"
        subtitle={
          cloud === "synced" && auth.email && !auth.isAnonymous
            ? `Signed in as ${auth.email} — streak syncs across all your devices`
            : "Link an email so your phone and PC share ONE account & streak"
        }
      >
        {auth.email && !auth.isAnonymous ? (
          <p className="text-sm text-emerald-400">
            ✅ Unified account active. Log in with this email on any new device to pull your full history.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
              />
              {cloud === "synced" && auth.isAnonymous ? (
                <button
                  onClick={handleClaim}
                  disabled={authBusy}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
                >
                  {authBusy ? "Sending…" : "Keep my data → link email"}
                </button>
              ) : (
                <button
                  onClick={handleMagic}
                  disabled={authBusy}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                >
                  {authBusy ? "Sending…" : "Send magic link"}
                </button>
              )}
            </div>
            {authMsg && (
              <p className={`mt-2 text-xs ${authMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {authMsg.msg}
              </p>
            )}
          </>
        )}
      </Card>

      {/* Ramp mode */}
      <Card title="🌅 Ramp mode" subtitle="5:30am (wk1) → 4:30am (wk2) → 4:00am (wk3+). Prevents burnout crash.">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={state.settings.rampEnabled}
            onChange={(e) => updateSettings({ rampEnabled: e.target.checked })}
            className="h-5 w-5 accent-emerald-500"
          />
          Progressive wake targets enabled
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Start date (ramp anchor)
            <input
              type="date"
              value={state.settings.startDate}
              onChange={(e) => updateSettings({ startDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
            />
          </label>
          <label className="text-xs text-slate-500">
            Caffeine cutoff
            <input
              type="time"
              value={state.settings.caffeineCutoff}
              onChange={(e) => updateSettings({ caffeineCutoff: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
            />
          </label>
        </div>
      </Card>

      {/* Habits editor */}
      <SectionTitle>Habits</SectionTitle>
      <div className="space-y-2">
        {state.habits.map((h) => (
          <Card key={h.id}>
            <div className="flex items-center gap-2">
              <input
                value={h.icon}
                onChange={(e) => updateHabit(h.id, { icon: e.target.value.slice(0, 2) })}
                className="w-12 rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-lg outline-none"
              />
              <div className="flex-1 space-y-1">
                <input
                  value={h.name}
                  onChange={(e) => updateHabit(h.id, { name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60"
                />
                <input
                  value={h.mvdText}
                  placeholder="MVD fallback (e.g., '20 pushups')"
                  onChange={(e) => updateHabit(h.id, { mvdText: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs outline-none focus:border-emerald-400/60"
                />
              </div>
              <button
                onClick={() => removeHabit(h.id)}
                className="rounded-lg bg-white/5 px-2 py-1.5 text-xs text-slate-500 hover:bg-red-500/20 hover:text-red-300"
              >
                delete
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Card title="Add habit">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newHabit.icon}
            onChange={(e) => setNewHabit((p) => ({ ...p, icon: e.target.value.slice(0, 2) }))}
            className="w-12 rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center outline-none"
          />
          <input
            value={newHabit.name}
            onChange={(e) => setNewHabit((p) => ({ ...p, name: e.target.value }))}
            placeholder="Habit name"
            className="min-w-40 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
          />
          <input
            value={newHabit.mvd}
            onChange={(e) => setNewHabit((p) => ({ ...p, mvd: e.target.value }))}
            placeholder="MVD fallback"
            className="min-w-36 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
          />
          <button
            onClick={() => {
              if (!newHabit.name.trim()) return;
              addHabit(newHabit.name.trim(), newHabit.icon || "✅", newHabit.mvd.trim());
              setNewHabit({ name: "", icon: "✅", mvd: "" });
            }}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            Add
          </button>
        </div>
      </Card>

      {/* Schedule editor */}
      <SectionTitle>Schedule blocks</SectionTitle>
      <Card title="Add a block">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            value={blockDay}
            onChange={(e) => setBlockDay(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm outline-none"
          >
            {DAY_NAMES.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={block.start}
            onChange={(e) => setBlock((p) => ({ ...p, start: e.target.value }))}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm outline-none"
          />
          <input
            type="time"
            value={block.end}
            onChange={(e) => setBlock((p) => ({ ...p, end: e.target.value }))}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm outline-none"
          />
          <select
            value={block.kind}
            onChange={(e) => setBlock((p) => ({ ...p, kind: e.target.value as BlockKind }))}
            className={`rounded-lg border px-2 py-2 text-sm outline-none ${KIND_STYLE[block.kind]}`}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={block.label}
            onChange={(e) => setBlock((p) => ({ ...p, label: e.target.value }))}
            placeholder="Label (e.g., 'Client work')"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
          />
          <button
            onClick={() => {
              if (!block.label.trim()) return;
              addBlock({ day: blockDay, start: block.start, end: block.end, label: block.label.trim(), kind: block.kind });
              setBlock({ start: "18:00", end: "19:00", label: "", kind: "deep" });
            }}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            Add
          </button>
        </div>
      </Card>
      <Card subtitle="Tap ✕ to remove">
        <ul className="space-y-1">
          {DAY_NAMES.map((dName, dIdx) => {
            const blocks = state.schedule.filter((b) => b.day === dIdx).sort((a, b) => a.start.localeCompare(b.start));
            if (blocks.length === 0) return null;
            return (
              <li key={dName}>
                <p className="mb-1 mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">{dName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {blocks.map((b) => (
                    <span key={b.id} className={`group flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${KIND_STYLE[b.kind]}`}>
                      <span className="font-mono opacity-70">{b.start}</span> {b.label}
                      <button onClick={() => removeBlock(b.id)} className="ml-0.5 opacity-40 hover:opacity-100">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Custom exercises */}
      <SectionTitle>Custom exercises</SectionTitle>
      <Card>
        <p className="mb-2 text-xs text-slate-500">
          You have {state.exercises.length} exercises. Add more from the Gym tab → “+ custom…” (name + muscle group).
        </p>
        <input
          value={customEx}
          disabled
          placeholder="Managed in the Gym tab"
          className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-500"
        />
        <p className="mt-2 text-[11px] text-slate-600">Split rotation: Day 1 Back+Triceps · Day 2 Chest+Biceps · Day 3 Legs+Shoulders+Abs</p>
      </Card>

      {/* Data */}
      <SectionTitle>Data</SectionTitle>
      <Card>
        <button
          onClick={exportJson}
          className="w-full rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
        >
          ⬇ Export backup (.json)
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Cloud sync: Supabase · anonymous user bound to this browser · last-write-wins per device
        </p>
      </Card>
    </div>
  );
}

// keep TS happy about unused import in strict builds
export type { MuscleGroup };
