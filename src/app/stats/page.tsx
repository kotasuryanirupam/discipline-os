"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
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
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={weekdayStats}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value) => [`${value}%`, "adherence"] as [string, string]}
              />
              <Bar dataKey="adherence" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={gymData.volume}>
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value) => [`${value} kg`, "volume"] as [string, string]}
                />
                <Bar dataKey="volume" fill="#f87171" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      {gymData.prog.length > 1 && (
        <Card title={`${gymData.exName} · est. 1RM progression`}>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={gymData.prog}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value) => [`${value} kg`, "est. 1RM"] as [string, string]}
                />
                <Line type="monotone" dataKey="orm" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
