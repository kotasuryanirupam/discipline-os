export type HabitStatus = "done" | "mvd" | "missed";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  mvdText: string; // Minimum Viable Day fallback
  active: boolean;
}

export type BlockKind =
  | "college"
  | "lab"
  | "deep"
  | "skill"
  | "project"
  | "gym"
  | "rest"
  | "review";

export interface ScheduleBlock {
  id: string;
  day: number; // 0 = Sun … 6 = Sat
  start: string; // "HH:MM" 24h
  end: string;
  label: string;
  kind: BlockKind;
}

export interface WakeLog {
  date: string; // YYYY-MM-DD
  target: string; // "HH:MM"
  actual: string | null;
}

export interface ShutdownEntry {
  date: string; // the evening this belongs to
  rating: number | null; // 1–5
  tasks: { text: string; done: boolean }[]; // tomorrow's tasks
  packedGymBag: boolean;
}

// Gym

export type MuscleGroup =
  | "back"
  | "triceps"
  | "chest"
  | "biceps"
  | "legs"
  | "shoulders"
  | "abs";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

/** User's split: Back+Triceps → Chest+Biceps → Legs+Shoulders+Abs (rotating) */
export const SPLIT_ROTATION: MuscleGroup[][] = [
  ["back", "triceps"],
  ["chest", "biceps"],
  ["legs", "shoulders", "abs"],
];

/**
 * Real-world gym week, anchored to WEDNESDAY (JS getDay() === 3).
 * Wed Back+Tri · Thu Chest+Bi · Fri Legs+Sh+Abs · Sat Back+Tri ·
 * Sun Chest+Bi · Mon Legs+Sh+Abs · **Tue = rest (college gym holiday)**
 */
export const GYM_WEEK: (MuscleGroup[] | null)[] = [
  SPLIT_ROTATION[0], // Wed
  SPLIT_ROTATION[1], // Thu
  SPLIT_ROTATION[2], // Fri
  SPLIT_ROTATION[0], // Sat
  SPLIT_ROTATION[1], // Sun
  SPLIT_ROTATION[2], // Mon
  null, // Tue — gym holiday
];

/** Planned focus for a JS weekday (0=Sun..6=Sat); null on the rest day. */
export function gymFocusForWeekday(weekday: number): MuscleGroup[] | null {
  const pos = (weekday - 3 + 7) % 7; // position in the Wed-starting week
  return GYM_WEEK[pos];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  focus: MuscleGroup[];
  notes?: string;
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  setNumber: number;
}

// Settings

export interface Settings {
  startDate: string; // ramp-mode anchor, YYYY-MM-DD
  rampEnabled: boolean;
  caffeineCutoff: string; // "HH:MM"
}

// Cloud sync payload shapes (mirrors tables)

export interface CloudTableMap {
  habits: Habit & { user_id: string };
  schedule_blocks: ScheduleBlock & { user_id: string };
  daily_logs: { user_id: string; date: string; habit_id: string; status: HabitStatus };
  wake_logs: WakeLog & { user_id: string };
  shutdown_entries: ShutdownEntry & { user_id: string };
  workout_sessions: WorkoutSession & { user_id: string };
  set_logs: SetLog & { user_id: string };
}
