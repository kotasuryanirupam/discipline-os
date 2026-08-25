// ── Discipline OS · Logic Engine ─────────────────────────────────────────────
// Streaks, never-miss-twice, MVD semantics, PRs, ramp mode.

import type {
  Habit,
  HabitStatus,
  WakeLog,
  SetLog,
  WorkoutSession,
  Exercise,
} from "./types";

// ── Dates ────────────────────────────────────────────────────────────────────

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(dateStr: string, delta: number): string {
  const [y, m, dd] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, dd + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Days since epoch-ish (used to rotate the gym split deterministically) */
export function dayIndex(dateStr: string): number {
  const [y, m, dd] = dateStr.split("-").map(Number);
  return Math.floor(new Date(y, m - 1, dd).getTime() / 86400000);
}

// ── Streaks & Never-Miss-Twice ───────────────────────────────────────────────
// MVD ('mvd') keeps a streak alive. 'missed' breaks it.
// Two consecutive misses = streak resets. One miss = warning state.

export interface StreakInfo {
  current: number;
  best: number;
  /** number of trailing consecutive 'missed' days */
  missStreak: number;
  /** true when exactly 1 trailing miss → show "Never miss twice" banner */
  warn: boolean;
}

export function computeStreak(
  statusesByDate: Record<string, HabitStatus>, // only days that have a log for this habit
  today: string,
): StreakInfo {
  // Walk backwards from yesterday; today counts once logged done/mvd.
  const t = new Date(today);
  let cursor = new Date(t);
  cursor.setDate(cursor.getDate() - 1); // start at yesterday

  const has = (d: Date): HabitStatus | undefined => {
    const k = localKey(d);
    return statusesByDate[k];
  };
  const isWin = (s?: HabitStatus) => s === "done" || s === "mvd";
  const isMiss = (s?: HabitStatus) => s === "missed";

  // Count trailing misses first
  let missStreak = 0;
  let probe = new Date(cursor);
  while (true) {
    const s = has(probe);
    if (isMiss(s)) {
      missStreak++;
      probe.setDate(probe.getDate() - 1);
    } else break;
  }

  // Current streak: walk back over wins; stop at a miss or gap-before-start.
  let current = 0;
  let cur = new Date(cursor);
  // If today already logged as win, include it in the displayed streak
  const todayStatus = statusesByDate[localKey(t)];
  if (isWin(todayStatus)) current++;

  while (true) {
    const s = has(cur);
    if (isWin(s)) {
      current++;
      cur.setDate(cur.getDate() - 1);
    } else if (s === undefined && current === 0 && beforeStart(statusesByDate, cur)) {
      cur.setDate(cur.getDate() - 1); // skip pre-app days
    } else break;
  }

  // Best streak: scan all history
  const dates = Object.keys(statusesByDate).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const ds of dates) {
    const s = statusesByDate[ds];
    const contiguous = prev !== null && addDays(prev, 1) === ds;
    run = isWin(s) ? (contiguous ? run + 1 : 1) : 0;
    best = Math.max(best, run);
    prev = ds;
  }
  best = Math.max(best, current);

  return { current, best, missStreak, warn: missStreak === 1 };
}

function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function beforeStart(
  statusesByDate: Record<string, HabitStatus>,
  d: Date,
): boolean {
  const dates = Object.keys(statusesByDate);
  if (dates.length === 0) return false;
  const earliest = dates.sort()[0];
  return localKey(d) > earliest;
}

// ── Wake target · Ramp mode ──────────────────────────────────────────────────

const RAMP_STEPS = ["05:30", "04:30", "04:00"]; // wk1 → wk2 → wk3+

export function wakeTarget(settings: SettingsLike, dateStr: string): string {
  if (!settings?.rampEnabled) return RAMP_STEPS[RAMP_STEPS.length - 1];
  const start = settings.startDate || todayStr();
  const week = Math.floor(daysBetween(start, dateStr) / 7);
  return RAMP_STEPS[Math.min(week, RAMP_STEPS.length - 1)];
}

export interface SettingsLike {
  startDate?: string;
  rampEnabled?: boolean;
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round(
    (new Date(ty, tm - 1, td).getTime() - new Date(fy, fm - 1, fd).getTime()) / 86400000,
  );
}

// ── Gym · PR detection ───────────────────────────────────────────────────────

/** Epley estimated 1RM */
export function est1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export interface PRResult {
  isPR: boolean;
  kind: "weight" | "1rm" | null;
  prevBest: { weightKg: number; reps: number } | null;
}

export function checkPR(
  exerciseId: string,
  weightKg: number,
  reps: number,
  allSetLogs: SetLog[],
  excludeSetId?: string,
): PRResult {
  const prior = allSetLogs.filter(
    (s) =>
      s.exerciseId === exerciseId &&
      s.id !== excludeSetId &&
      s.weightKg > 0 &&
      s.reps > 0,
  );
  if (prior.length === 0) {
    return { isPR: false, kind: null, prevBest: null }; // first time logging → no confetti spam
  }
  const prevWeight = Math.max(...prior.map((s) => s.weightKg));
  const prev1rm = Math.max(...prior.map((s) => est1RM(s.weightKg, s.reps)));
  const my1rm = est1RM(weightKg, reps);
  if (weightKg > prevWeight) return { isPR: true, kind: "weight", prevBest: null };
  if (my1rm > prev1rm) return { isPR: true, kind: "1rm", prevBest: null };
  return { isPR: false, kind: null, prevBest: null };
}

// ── Misc helpers used by screens ─────────────────────────────────────────────

export function focusForDate(
  dateStr: string,
  sessions: WorkoutSession[],
): WorkoutSession | undefined {
  return sessions.find((s) => s.date === dateStr);
}

export function lastSetsForExercise(
  exerciseId: string,
  setLogs: SetLog[],
  sessions: WorkoutSession[],
  beforeDate: string,
): { sets: SetLog[]; date: string } | null {
  const sessionIds = new Set(
    sessions.filter((s) => s.date < beforeDate).map((s) => s.id),
  );
  const mine = setLogs.filter((s) => sessionIds.has(s.sessionId));
  if (mine.length === 0) return null;
  const latestDate = sessions
    .filter((s) => s.date < beforeDate)
    .map((s) => s.date)
    .sort()
    .pop()!;
  const latestSessionIds = new Set(
    sessions.filter((s) => s.date === latestDate).map((s) => s.id),
  );
  return {
    sets: mine.filter((s) => latestSessionIds.has(s.sessionId) && s.exerciseId === exerciseId),
    date: latestDate,
  };
}

export function habitById(habits: Habit[], id: string): Habit | undefined {
  return habits.find((h) => h.id === id);
}
