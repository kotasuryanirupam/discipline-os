"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { Card, SectionTitle } from "@/components/ui";
import { computeStreak, todayStr, addDays, est1RM } from "@/lib/engine";
import type { HabitStatus } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StatsPage() {
  const { state } = useApp();
  const today = todayStr();

  const activeHabits = state.habits.filter((h) => h.active);

  // ── Heatmap data: last 91 days (13 weeks), GitHub-style columns ───────────
  const heatmap = useMemo(() => {
    const cells: { date: string; level: number; pct: number }[] = [];
    for (let i = 90; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayLogs = state.dailyLogs[date] ?? {};
      const scored = activeHabits.filter(
        (h) => dayLogs[h.id] === "done" || dayLogs[h.id] === "mvd",
      ).length;
      const mvdCount = activeHabits.filter((h) => dayLogs[h.id] === "mvd").length;
      const pct = activeHabits.length ? scored / activeHabits.length : 0;
      // level 0..4 (MVD counts at half weight for color intensity)
      const level =
        pct === 0 ? 0 : Math.min(4, Math.round(pct * 3 + (mvdCount > 0 ? 1 : 0)));
      cells.push({ date, level, pct });
    }
    return cells;
  }, [state.dailyLogs, activeHabits, today]);

  const LEVEL_COLOR = [
    "bg-white/5",
    "bg-emerald-900",
    "bg-emerald-700",
    "bg-emerald-500",
    "bg-emerald-300",
  ];

  // ── Adherence by weekday (last 28 days) ───────────────────────────────────
  const weekdayStats = useMemo(() => {
    const sums = Array.from({ length: 7 }, () => ({ total: 0, hit: 0 }));
    for (let i = 27; i >= 0; i--) {
      const date = addDays(today, -i);
      const logs = state.dailyLogs[date] ?? {};
      const dow = new Date(date + "T00:00:00").getDay();
      const scored = activeHabits.filter((h) => logs[h.id] === "done" || logs[h.id] === "mvd").length;
      if (Object.keys(logs).length === 0 && scored === 0) continue; // skip unlogged days
      sums[dow].total += 1;
      sums[dow].hit += scored / Math.max(1, activeHabits.length);
    }
    return sums.map((s, i) => ({
      day: DAYS[i],
      adherence: s.total ? Math.round((s.hit / s.total) * 100) : 0,
    }));
  }, [state.dailyLogs, activeHabits, today]);

  // ── Gym: weekly volume + bench progression ────────────────────────────────
  const gymData = useMemo(() => {
    const sessionsByDate = new Map<string, string[]>();
    for (const s of state.sessions) {
      sessionsByDate.set(s.date, [...(sessionsByDate.get(s.date) ?? []), s.id]);
    }
    const weeks = new Map<string, number>();
    for (const [date, ids] of sessionsByDate) {
      const vol = state.setLogs
        .filter((l) => ids.includes(l.sessionId))
        .reduce((sum, l) => sum + l.weightKg * l.reps, 0);
      const wk = weekKey(date);
      weeks.set(wk, (weeks.get(wk) ?? 0) + vol);
    }
    const volume = [...weeks.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([wk, vol]) => ({ week: wk.slice(5), volume: vol }));

    // Progression: heaviest single-set est. 1RM per day for the first logged exercise
    const benchEx = state.exercises.find((e) =>
      state.setLogs.some((l) => l.exerciseId === e.id),
    );
    let prog: { date: string; orm: number }[] = [];
    if (benchEx) {
      prog = Object.entries(
        state.setLogs.reduce<Record<string, number>>((acc, l) => {
          if (l.exerciseId !== benchEx.id) return acc;
          const v = est1RM(l.weightKg, l.reps);
          acc[l.sessionId] = Math.max(acc[l.sessionId] ?? 0, v);
          return acc;
        }, {}),
      )
        .map(([sid, orm]) => ({
          date: state.sessions.find((s) => s.id === sid)?.date ?? "",
          orm: Math.round(orm * 10) / 10,
        }))
        .filter((p) => p.date)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14);
    }
    return { volume, prog, exName: benchEx?.name ?? "" };
  }, [state.sessions, state.setLogs, state.exercises]);

  const gymDaysLast28 = useMemo(() => {
    let n = 0;
    for (let i = 27; i >= 0; i--) {
      const date = addDays(today, -i);
      if (state.sessions.some((s) => s.date === date)) n++;
    }
    return n;
  }, [state.sessions, today]);

  // ── Best / worst streak summary ──────────────────────────────────────────
  const summaries = activeHabits.map((h) => {
    const map: Record<string, HabitStatus> = {};
    for (const [d, logs] of Object.entries(state.dailyLogs)) {
      const st = logs[h.id];
      if (st) map[d] = st;
    }
    const info = computeStreak(map, today);
    return { habit: h, ...info };
  });
  const topStreak = [...summaries].sort((a, b) => b.current - a.current)[0];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-violet-400">Receipts</p>
        <h1 className="text-2xl font-bold text-white">Stats</h1>
      </div>

      <SectionTitle>Consistency heatmap · 13 weeks</SectionTitle>
      <Card>
        <HeatGrid cells={heatmap} colors={LEVEL_COLOR} />
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-500">
          less
          {LEVEL_COLOR.map((c, i) => (
            <span key={i} className={`h-3 w-3 rounded-[3px] ${c}`} />
          ))}
          more
        </div>
      </Card>

      <SectionTitle>Adherence by weekday · last 4 weeks</SectionTitle>
      <Card>
        <div className="flex h-[180px] items-end justify-between gap-2 px-1">
          {weekdayStats.map((d) => (
            <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[10px] font-medium text-slate-400">{d.adherence}%</span>
              <div
                title={`${d.day}: ${d.adherence}% adherence`}
                className="w-full max-w-12 rounded-t-md bg-emerald-400 transition-all hover:bg-emerald-300"
                style={{ height: `${Math.max(d.adherence, 1.5)}%` }}
              />
              <span className="text-[11px] text-slate-500">{d.day}</span>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Gym</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-slate-500">Sessions · 28d</p>
          <p className="text-2xl font-bold text-white">{gymDaysLast28}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Top streak</p>
          <p className="truncate text-sm font-semibold text-orange-300">
            🔥 {topStreak ? `${topStreak.habit.icon} ${topStreak.current}d` : "—"}
          </p>
        </Card>
      </div>
      {gymData.volume.length > 0 && (
        <Card title="Weekly volume (kg)" subtitle="Total kg lifted per week">
          <div className="flex h-[180px] items-end justify-between gap-2 px-1">
            {gymData.volume.map((v) => {
              const max = Math.max(...gymData.volume.map((x) => x.volume), 1);
              return (
                <div key={v.week} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400">{Math.round(v.volume)}</span>
                  <div
                    title={`Week of ${v.week}: ${Math.round(v.volume)} kg`}
                    className="w-full max-w-12 rounded-t-md bg-red-400 transition-all hover:bg-red-300"
                    style={{ height: `${Math.max((v.volume / max) * 100, 1.5)}%` }}
                  />
                  <span className="text-[11px] text-slate-500">{v.week}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {gymData.prog.length > 1 && (
        <Card title={`${gymData.exName} · est. 1RM progression`}>
          <ProgressionSparkline data={gymData.prog} />
        </Card>
      )}

      {/* Per-habit table */}
      <SectionTitle>Per-habit</SectionTitle>
      <Card>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="pb-2">Habit</th>
              <th className="pb-2 text-right">Current</th>
              <th className="pb-2 text-right">Best</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.habit.id} className="border-t border-white/5">
                <td className="py-2">
                  {s.habit.icon} {s.habit.name}
                </td>
                <td className={`py-2 text-right ${s.warn ? "font-bold text-amber-300" : "text-orange-300"}`}>
                  🔥 {s.current}
                </td>
                <td className="py-2 text-right text-slate-400">🏆 {s.best}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function weekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function HeatGrid({
  cells,
  colors,
}: {
  cells: { date: string; level: number; pct: number }[];
  colors: string[];
}) {
  return (
    <div className="flex flex-wrap gap-1" style={{ maxHeight: 130, overflow: "hidden" }}>
      {cells.map((c) => (
        <span
          key={c.date}
          title={`${c.date} · ${Math.round(c.pct * 100)}%`}
          className={`h-3.5 w-3.5 rounded-[3px] ${colors[c.level]}`}
        />
      ))}
    </div>
  );
}

/** Dependency-free SVG progression chart — renders instantly, no animation flakiness. */
function ProgressionSparkline({ data }: { data: { date: string; orm: number }[] }) {
  const W = 660;
  const H = 180;
  const PAD = { l: 44, r: 14, t: 14, b: 26 };
  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.orm);
  const yMin = Math.min(...ys) * 0.92;
  const yMax = Math.max(...ys) * 1.05;
  const px = (i: number) =>
    PAD.l + (i / Math.max(1, xs.length - 1)) * (W - PAD.l - PAD.r);
  const py = (v: number) =>
    H - PAD.b - ((v - yMin) / Math.max(0.001, yMax - yMin)) * (H - PAD.t - PAD.b);

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.orm).toFixed(1)}`).join(" ");
  const area = `${path} L${px(data.length - 1).toFixed(1)},${H - PAD.b} L${px(0).toFixed(1)},${H - PAD.b} Z`;
  const ticks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[180px] w-full" role="img" aria-label="1RM progression chart">
        <defs>
          <linearGradient id="ormFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={py(t)} y2={py(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={PAD.l - 6} y={py(t) + 3.5} textAnchor="end" fontSize="10" fill="#64748b">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {data
          .filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)
          .map((d) => {
            const idx = data.indexOf(d);
            return (
              <text key={d.date + idx} x={px(idx)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#64748b">
                {d.date.slice(5)}
              </text>
            );
          })}
        <path d={area} fill="url(#ormFill)" />
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={d.date + i} cx={px(i)} cy={py(d.orm)} r="3" fill="#38bdf8">
            <title>{`${d.date} · est. 1RM ${d.orm} kg`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
