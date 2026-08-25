"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Card, SectionTitle, KIND_STYLE } from "@/components/ui";
import { computeStreak, todayStr, wakeTarget } from "@/lib/engine";
import type { HabitStatus } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmt12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function TodayPage() {
  const { state, ready, setStatus, setWakeActual, ensureWakeTarget } = useApp();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const today = now ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` : "";
  const weekday = now ? now.getDay() : 1;

  const target = wakeTarget(state.settings, today || todayStr());
  useEffect(() => {
    if (today) ensureWakeTarget(today, target);
  }, [today, target, ensureWakeTarget]);

  const wake = state.wakeLogs[today];
  const dayLogs = state.dailyLogs[today] ?? {};

  const blocks = useMemo(
    () =>
      state.schedule
        .filter((b) => b.day === weekday)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [state.schedule, weekday],
  );

  if (!ready) {
    return <p className="mt-10 text-center text-sm text-slate-500">Loading your day…</p>;
  }

  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

  // Overall day progress
  const activeHabits = state.habits.filter((h) => h.active);
  const doneCount = activeHabits.filter((h) => dayLogs[h.id] === "done" || dayLogs[h.id] === "mvd").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400">
            {DAYS[weekday]} {now ? `· ${now.toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : ""}
          </p>
          <h1 className="text-2xl font-bold text-white">Today</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Day score</p>
          <p className="text-xl font-bold text-white">
            {doneCount}/{activeHabits.length}
          </p>
        </div>
      </div>

      {/* Never miss twice banner */}
      {activeHabits.some((h) => computeStreak(collectFor(state.dailyLogs, h.id), today).warn) && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠️ <strong>Never miss twice.</strong> One habit slipped yesterday — today&apos;s only job is showing up.
        </div>
      )}

      {/* Wake card */}
      <Card title="⏰ Wake-up" subtitle={`Ramp target: ${fmt12(target)}`}>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="time"
            value={wake?.actual ?? ""}
            onChange={(e) => setWakeActual(today, e.target.value || null)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
          />
          {wake?.actual ? (
            wake.actual <= target ? (
              <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-sm font-semibold text-emerald-300">
                ✅ On target
              </span>
            ) : (
              <span className="rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-sm text-amber-200">
                {Math.round((toMin(wake.actual) - toMin(target)) / 60 * 10) / 10}h late — still counts
              </span>
            )
          ) : (
            <span className="text-xs text-slate-500">Log the time you actually got out of bed</span>
          )}
        </div>
      </Card>

      {/* Schedule */}
      <SectionTitle>Today&apos;s blocks</SectionTitle>
      <Card>
        <ul className="space-y-2">
          {blocks.map((b) => {
            const isNow = nowMin >= toMin(b.start) && nowMin < toMin(b.end);
            const isPast = nowMin >= toMin(b.end);
            return (
              <li
                key={b.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${KIND_STYLE[b.kind]} ${
                  isNow ? "ring-2 ring-emerald-400/60" : ""
                } ${isPast ? "opacity-40" : ""}`}
              >
                <span className="w-32 shrink-0 font-mono text-xs opacity-80">
                  {fmt12(b.start)}–{fmt12(b.end)}
                </span>
                <span className="flex-1 text-sm">{b.label}</span>
                {isNow && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">NOW</span>}
              </li>
            );
          })}
          {blocks.length === 0 && <li className="py-2 text-sm text-slate-500">Rest day — no blocks scheduled.</li>}
        </ul>
      </Card>

      {/* Habits */}
      <SectionTitle>Habits</SectionTitle>
      <div className="space-y-2">
        {activeHabits.map((h) => {
          const st: HabitStatus | undefined = dayLogs[h.id];
          const streak = computeStreak(collectFor(state.dailyLogs, h.id), today);
          const isGym = h.id === "h-gym";
          return (
            <Card key={h.id} className={st === "missed" ? "border-red-500/20" : ""}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {h.icon} {h.name}
                  </p>
                  {h.mvdText ? <p className="mt-0.5 text-xs text-slate-500">MVD: {h.mvdText}</p> : null}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setStatus(today, h.id, st === "done" ? null : "done")}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      st === "done" ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    ✓ Done
                  </button>
                  {h.mvdText ? (
                    <button
                      onClick={() => setStatus(today, h.id, st === "mvd" ? null : "mvd")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        st === "mvd" ? "bg-sky-500 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      ~ MVD
                    </button>
                  ) : null}
                  <button
                    onClick={() => setStatus(today, h.id, st === "missed" ? null : "missed")}
                    title="Mark missed"
                    className={`rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      st === "missed" ? "bg-red-500/80 text-white" : "bg-white/5 text-slate-500 hover:bg-white/10"
                    }`}
                  >
                    ✗
                  </button>
                  <span className={`ml-1 w-14 text-right text-xs ${streak.warn ? "font-bold text-amber-300" : "text-orange-300"}`}>
                    🔥 {streak.current}
                  </span>
                </div>
                {isGym && (
                  <Link href="/gym" className="text-xs text-red-300 underline decoration-dotted hover:text-red-200">
                    open tracker →
                  </Link>
                )}
              </div>
              {streak.warn ? (
                <p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
                  Missed once — this is the day that decides everything.
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/** Pull one habit's statuses across all dates into the map shape engine wants */
function collectFor(
  dailyLogs: Record<string, Record<string, HabitStatus>>,
  habitId: string,
): Record<string, HabitStatus> {
  const out: Record<string, HabitStatus> = {};
  for (const [date, byHabit] of Object.entries(dailyLogs)) {
    const s = byHabit[habitId];
    if (s) out[date] = s;
  }
  return out;
}
