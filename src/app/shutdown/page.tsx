"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Card } from "@/components/ui";
import { todayStr, addDays, wakeTarget } from "@/lib/engine";

export default function ShutdownPage() {
  const { state, saveShutdown } = useApp();
  const today = todayStr();

  const existing = state.shutdown[today];
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [tasks, setTasks] = useState<string[]>(
    existing?.tasks.map((t) => t.text) ?? ["", "", ""],
  );
  const [packed, setPacked] = useState(existing?.packedGymBag ?? false);
  const [savedFlash, setSavedFlash] = useState(false);

  const tomorrow = addDays(today, 1);
  const target = wakeTarget(state.settings, tomorrow);

  const yesterdayEntry = state.shutdown[addDays(today, -1)];
  const yTasks = yesterdayEntry?.tasks ?? [];

  const canSave = tasks.some((t) => t.trim().length > 0) || rating > 0;

  const shutdownStreak = useMemo(() => {
    let n = 0;
    let d = addDays(today, -1);
    while (state.shutdown[d]) {
      n++;
      d = addDays(d, -1);
    }
    return n;
  }, [state.shutdown, today]);

  function doSave() {
    saveShutdown({
      date: today,
      rating: rating > 0 ? rating : null,
      tasks: tasks
        .filter((t) => t.trim())
        .map((t) => ({ text: t.trim(), done: false })),
      packedGymBag: packed,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  function toggleYesterdayTask(index: number) {
    const e = state.shutdown[addDays(today, -1)];
    if (!e) return;
    saveShutdown({
      ...e,
      tasks: e.tasks.map((x, j) => (j === index ? { ...x, done: !x.done } : x)),
    });
  }

  const emoji = rating >= 4 ? "🔥" : rating === 3 ? "🙂" : rating > 0 ? "😤" : "";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-sky-400">9:30 PM · screens down</p>
        <h1 className="text-2xl font-bold text-white">Shutdown Ritual</h1>
        <p className="mt-1 text-xs text-slate-500">
          Decide tonight. Execute tomorrow. Your 4am brain only follows orders.
        </p>
      </div>

      {/* Rate the day */}
      <Card title="How was today?" subtitle={emoji ? `You're feeling ${emoji}` : "Tap a score"}>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              aria-label={`Rate ${n}`}
              className={`h-11 flex-1 rounded-xl text-lg font-bold transition-colors ${
                rating >= n ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {rating >= n ? "★" : "☆"}
            </button>
          ))}
          <span className="ml-1 w-10 self-center text-sm text-slate-400">
            {rating > 0 ? `${rating}/5` : ""}
          </span>
        </div>
      </Card>

      {/* Yesterday's tasks carryover */}
      {yTasks.length > 0 && (
        <>
          <Card title="Yesterday's orders" subtitle="Did you execute?">
            <ul className="space-y-1 text-sm">
              {yTasks.map((t, i) => (
                <li key={i} className={`rounded-md px-2 py-1 ${t.done ? "text-emerald-300" : "text-slate-400"}`}>
                  {t.done ? "✅" : "⬜"} {t.text}
                  {!t.done && (
                    <button
                      onClick={() => toggleYesterdayTask(i)}
                      className="ml-2 text-xs text-sky-300 underline decoration-dotted"
                    >
                      mark done
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <p className="-mt-2 text-center text-xs text-slate-600">shutdown streak: {shutdownStreak} 🔥</p>
        </>
      )}

      {/* Tomorrow's tasks */}
      <Card title="Tomorrow's 3 tasks" subtitle={`Wake target: ${target}`}>
        <div className="space-y-2">
          {tasks.map((t, i) => (
            <input
              key={i}
              value={t}
              onChange={(e) => setTasks((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={["1st priority (side hustle)", "2nd priority", "3rd priority"][i] ?? `Task ${i + 1}`}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/60"
            />
          ))}
        </div>
      </Card>

      {/* Gym bag */}
      <label className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm">
        <input
          type="checkbox"
          checked={packed}
          onChange={(e) => setPacked(e.target.checked)}
          className="h-5 w-5 accent-emerald-500"
        />
        <span>🎒 Gym bag packed by the door</span>
      </label>

      <button
        onClick={doSave}
        disabled={!canSave}
        className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white hover:bg-sky-400 disabled:opacity-30"
      >
        Lock in tomorrow 🌙
      </button>
      {savedFlash && (
        <p className="text-center text-sm text-emerald-300">Locked in. Now sleep — 4am waits for no one.</p>
      )}
    </div>
  );
}
