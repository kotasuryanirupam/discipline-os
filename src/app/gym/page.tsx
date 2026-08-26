"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { Card, SectionTitle } from "@/components/ui";
import {
  todayStr,
  checkPR,
  est1RM,
} from "@/lib/engine";
import { SPLIT_ROTATION, GYM_WEEK, gymFocusForWeekday } from "@/lib/types";
import type { MuscleGroup, SetLog } from "@/lib/types";

const GROUP_LABEL: Record<MuscleGroup, string> = {
  back: "Back",
  triceps: "Triceps",
  chest: "Chest",
  biceps: "Biceps",
  legs: "Legs",
  shoulders: "Shoulders",
  abs: "Abs",
};

export default function GymPage() {
  const { state, startSession, deleteSet, addExercise } = useApp();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedEx, setSelectedEx] = useState<string[]>([]);
  const [restLeft, setRestLeft] = useState<number | null>(null);

  // Restore today's session if it exists (e.g., page refresh mid-workout)
  useEffect(() => {
    // deferred one tick — setState-in-effect guard
    const t = setTimeout(() => {
      const today = todayStr();
      const existing = state.sessions.filter((s) => s.date === today).at(-1);
      if (existing && sessionId === null && selectedEx.length === 0) {
        const logged = state.setLogs.filter((s) => s.sessionId === existing.id);
        if (logged.length > 0 || existing.focus.length > 0) {
          setSessionId(existing.id);
          setSelectedEx([...new Set(logged.map((s) => s.exerciseId))]);
        }
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sessions.length]);

  // Rest timer
  useEffect(() => {
    if (restLeft === null) return;
    if (restLeft <= 0) {
      try {
        navigator.vibrate?.([200, 100, 200]);
      } catch {}
      const t = setTimeout(() => setRestLeft(null), 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRestLeft((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [restLeft]);

  const today = todayStr();
  const weekday = new Date(`${today}T00:00:00`).getDay();
  const plannedFocus = gymFocusForWeekday(weekday); // null on Tuesday (rest day)
  const [override, setOverride] = useState(false);
  const effectiveFocus = plannedFocus ?? (override ? SPLIT_ROTATION[0] : null);

  const focusExercises = useMemo(
    () => state.exercises.filter((e) => effectiveFocus?.includes(e.muscleGroup) ?? false),
    [state.exercises, effectiveFocus],
  );

  function begin() {
    setSelectedEx([]);
    setSessionId(startSession(effectiveFocus ?? SPLIT_ROTATION[0]));
  }

  if (!sessionId && !effectiveFocus) {
    // Tuesday — college gym holiday
    return (
      <div className="space-y-4">
        <Header />
        <Card
          title="😴 Rest day"
          subtitle="Tuesday — college gym is closed. Recovery is part of the program."
        >
          <p className="text-sm text-slate-400">
            Rotation resumes tomorrow (<span className="text-slate-200">Wednesday · Back + Triceps</span>).
          </p>
          <button
            onClick={() => setOverride(true)}
            className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 py-3 font-semibold text-slate-200 hover:bg-white/10"
          >
            💪 Train anyway (Back + Triceps)
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Week: Wed Back+Tri · Thu Chest+Bi · Fri Legs+Sh+Abs · Sat Back+Tri · Sun Chest+Bi · Mon Legs+Sh+Abs · Tue rest
          </p>
        </Card>
        <HistorySection />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="space-y-4">
        <Header />
        <Card
          title="Today's split"
          subtitle={
            plannedFocus
              ? `Rotation day ${(GYM_WEEK.findIndex((f) => f === plannedFocus) % 3) + 1} of 3`
              : "Bonus session (rest-day override)"
          }
        >
          <div className="flex flex-wrap gap-2">
            {(effectiveFocus ?? []).map((g) => (
              <span key={g} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-200">
                {GROUP_LABEL[g]}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Exercises available: {focusExercises.map((e) => e.name).join(" · ")}
          </p>
          <button
            onClick={begin}
            className="mt-4 w-full rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-400"
          >
            🏋️ Start workout
          </button>
        </Card>
        <HistorySection />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header />
      {restLeft !== null && (
        <div
          className={`sticky top-16 z-10 rounded-xl px-4 py-2 text-center font-mono text-lg font-bold ${
            restLeft === 0 ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-200"
          }`}
        >
          {restLeft === 0 ? "GO! 💪" : `Rest ${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, "0")}`}
        </div>
      )}

      {/* Exercise picker */}
      <Card title="Add exercise" subtitle="Tap to add to today's session">
        <ExercisePicker
          pool={focusExercises}
          selected={selectedEx}
          onToggle={(id) =>
            setSelectedEx((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }
          allMuscleGroups={Object.keys(GROUP_LABEL) as MuscleGroup[]}
          onAddCustom={(name, mg) => addExercise(name, mg)}
        />
      </Card>

      {/* Log sets */}
      {selectedEx.map((exId) => (
        <SetLogger key={exId} exerciseId={exId} sessionId={sessionId} onLogged={() => setRestLeft(90)} onDelete={deleteSet} />
      ))}

      {selectedEx.length > 0 && (
        <button
          onClick={() => {
            setSessionId(null);
            setSelectedEx([]);
          }}
          className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 font-semibold text-emerald-300 hover:bg-emerald-500/20"
        >
          ✅ Finish workout
        </button>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-red-400">Iron therapy</p>
      <h1 className="text-2xl font-bold text-white">Gym</h1>
    </div>
  );
}

function ExercisePicker({
  pool,
  selected,
  onToggle,
  allMuscleGroups,
  onAddCustom,
}: {
  pool: { id: string; name: string; muscleGroup: MuscleGroup }[];
  selected: string[];
  onToggle: (id: string) => void;
  allMuscleGroups: MuscleGroup[];
  onAddCustom: (name: string, mg: MuscleGroup) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMg, setCustomMg] = useState<MuscleGroup>("chest");

  return (
    <div className="flex flex-wrap gap-2">
      {pool.map((e) => (
        <button
          key={e.id}
          onClick={() => onToggle(e.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            selected.includes(e.id)
              ? "bg-sky-500 text-white"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          {e.name}
        </button>
      ))}
      <button
        onClick={() => setShowAll(true)}
        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10"
      >
        + custom…
      </button>
      {showAll && (
        <div className="mt-2 w-full space-y-2 rounded-lg border border-white/10 p-3">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Exercise name"
            className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm outline-none focus:border-emerald-400/60"
          />
          <select
            value={customMg}
            onChange={(e) => setCustomMg(e.target.value as MuscleGroup)}
            className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm outline-none"
          >
            {allMuscleGroups.map((mg) => (
              <option key={mg} value={mg}>
                {GROUP_LABEL[mg]}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!customName.trim()) return;
              onAddCustom(customName.trim(), customMg);
              setCustomName("");
              setShowAll(false);
            }}
            className="w-full rounded-md bg-emerald-500 py-1.5 text-sm font-semibold text-white"
          >
            Add exercise
          </button>
        </div>
      )}
    </div>
  );
}

function SetLogger({
  exerciseId,
  sessionId,
  onLogged,
  onDelete,
}: {
  exerciseId: string;
  sessionId: string;
  onLogged: () => void;
  onDelete: (setId: string) => void;
}) {
  const { state, logSet } = useApp();
  const ex = state.exercises.find((e) => e.id === exerciseId)!;
  const mySets = state.setLogs.filter((s) => s.sessionId === sessionId && s.exerciseId === exerciseId);

  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(8);
  const [prFlash, setPrFlash] = useState<string | null>(null);
  const prTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ghost of last time
  const ghost = useMemo(() => {
    const before = state.setLogs.filter((s) => s.exerciseId === exerciseId && s.weightKg > 0 && s.reps > 0);
    if (before.length === 0) return null;
    const best = before.reduce((a, b) => (est1RM(b.weightKg, b.reps) > est1RM(a.weightKg, a.reps) ? b : a));
    return best;
  }, [state.setLogs, exerciseId]);

  useEffect(() => {
    // deferred one tick — setState-in-effect guard
    const t = setTimeout(() => {
      if (ghost && weight === 0) {
        setWeight(ghost.weightKg);
        setReps(ghost.reps);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function doLog() {
    if (weight <= 0 || reps <= 0) return;
    const pr = checkPR(exerciseId, weight, reps, state.setLogs);
    const s = logSet(sessionId, exerciseId, weight, reps);
    void s;
    if (pr.isPR) {
      setPrFlash(pr.kind === "weight" ? `🏆 New top weight: ${weight}kg!` : "🏆 New rep PR (best est. 1RM)!");
      if (prTimer.current) clearTimeout(prTimer.current);
      prTimer.current = setTimeout(() => setPrFlash(null), 3500);
    }
    onLogged();
  }

  return (
    <Card title={`${ex.name}`} subtitle={GROUP_LABEL[ex.muscleGroup]}>
      {ghost && (
        <p className="mb-2 rounded-md bg-white/5 px-2 py-1 text-[11px] text-slate-400">
          👻 Last time: best set {ghost.weightKg}kg × {ghost.reps}
        </p>
      )}
      {mySets.length > 0 && (
        <ul className="mb-2 space-y-1">
          {mySets.map((s, i) => (
            <li key={s.id} className="flex items-center justify-between rounded-md bg-black/20 px-2 py-1 text-xs">
              <span>
                <span className="text-slate-500">Set {i + 1}</span> · {s.weightKg}kg × {s.reps}
              </span>
              <button onClick={() => onDelete(s.id)} className="text-slate-600 hover:text-red-400">
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {prFlash && (
        <p className="mb-2 animate-pulse rounded-md bg-yellow-500/15 px-2 py-1.5 text-center text-sm font-bold text-yellow-200">
          {prFlash}
        </p>
      )}
      <Stepper label="kg" value={weight} onChange={(v) => setWeight(Math.max(0, Math.min(999, v)))} step={2.5} />
      <div className="h-2" />
      <Stepper label="reps" value={reps} onChange={(v) => setReps(Math.max(1, Math.min(100, v)))} step={1} />
      <button
        onClick={doLog}
        disabled={weight <= 0 || reps <= 0}
        className="mt-3 w-full rounded-lg bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-30"
      >
        Log set
      </button>
    </Card>
  );
}

function Stepper({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(value - step)}
        className="h-12 w-12 shrink-0 rounded-xl bg-white/5 text-xl font-bold text-slate-300 active:bg-white/15"
      >
        −
      </button>
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="decimal"
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-12 w-full rounded-xl border border-white/10 bg-black/30 text-center text-xl font-bold outline-none focus:border-emerald-400/60"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase text-slate-500">
          {label}
        </span>
      </div>
      <button
        onClick={() => onChange(value + step)}
        className="h-12 w-12 shrink-0 rounded-xl bg-white/5 text-xl font-bold text-slate-300 active:bg-white/15"
      >
        +
      </button>
    </div>
  );
}

function HistorySection() {
  const { state } = useApp();
  const done = state.sessions.filter((s) => state.setLogs.some((l) => l.sessionId === s.id));
  if (done.length === 0) return null;

  const byDate = new Map<string, SetLog[]>();
  for (const s of done) {
    const logs = state.setLogs.filter((l) => l.sessionId === s.id);
    byDate.set(s.date, [...(byDate.get(s.date) ?? []), ...logs]);
  }

  return (
    <div>
      <SectionTitle>Recent workouts</SectionTitle>
      <div className="space-y-2">
        {[...byDate.entries()]
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 7)
          .map(([date, logs]) => {
            const volume = logs.reduce((sum, l) => sum + l.weightKg * l.reps, 0);
            const names = [
              ...new Set(
                logs.map((l) => state.exercises.find((e) => e.id === l.exerciseId)?.muscleGroup),
              ),
            ]
              .filter(Boolean)
              .map((mg) => GROUP_LABEL[mg as MuscleGroup])
              .join(", ");
            return (
              <Card key={date}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-200">{date}</span>
                  <span className="text-xs text-slate-500">{names}</span>
                  <span className="font-mono text-xs text-emerald-300">{volume.toLocaleString()} kg vol</span>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
