"use client";

// ── Discipline OS · State Store ──────────────────────────────────────────────
// localStorage-first, Supabase cloud sync (JSONB blob, last-write-wins).
// Works fully offline; syncs when online.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_HABITS,
  DEFAULT_SCHEDULE,
  DEFAULT_EXERCISES,
} from "./seed";
import type {
  Habit,
  ScheduleBlock,
  HabitStatus,
  ShutdownEntry,
  WorkoutSession,
  SetLog,
  Exercise,
  MuscleGroup,
} from "./types";
import { todayStr } from "./engine";

// ── Shape ────────────────────────────────────────────────────────────────────

export interface AppState {
  habits: Habit[];
  schedule: ScheduleBlock[];
  exercises: Exercise[];
  /** date → habitId → status */
  dailyLogs: Record<string, Record<string, HabitStatus>>;
  /** date → { target, actual } */
  wakeLogs: Record<string, { target: string; actual: string | null }>;
  /** date → entry */
  shutdown: Record<string, ShutdownEntry>;
  sessions: WorkoutSession[];
  setLogs: SetLog[];
  settings: {
    startDate: string;
    rampEnabled: boolean;
    caffeineCutoff: string;
  };
}

const LS_KEY = "dos-state-v1";
const SYNC_KEY = "dos-sync-meta-v1";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function freshState(): AppState {
  return {
    habits: structuredClone(DEFAULT_HABITS),
    schedule: structuredClone(DEFAULT_SCHEDULE),
    exercises: structuredClone(DEFAULT_EXERCISES),
    dailyLogs: {},
    wakeLogs: {},
    shutdown: {},
    sessions: [],
    setLogs: [],
    settings: {
      startDate: todayStr(),
      rampEnabled: true,
      caffeineCutoff: "16:00",
    },
  };
}

function loadLocal(): AppState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = freshState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return freshState();
  }
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── Context ──────────────────────────────────────────────────────────────────

export type CloudStatus = "local" | "connecting" | "synced" | "offline" | "error";

interface StoreCtx {
  state: AppState;
  ready: boolean;
  cloud: CloudStatus;
  setStatus: (date: string, habitId: string, status: HabitStatus | null) => void;
  setWakeActual: (date: string, actual: string | null) => void;
  ensureWakeTarget: (date: string, target: string) => void;
  saveShutdown: (entry: ShutdownEntry) => void;
  startSession: (focus: MuscleGroup[]) => string;
  logSet: (
    sessionId: string,
    exerciseId: string,
    weightKg: number,
    reps: number,
  ) => SetLog;
  deleteSet: (setId: string) => void;
  addExercise: (name: string, muscleGroup: MuscleGroup) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  addHabit: (name: string, icon: string, mvdText: string) => void;
  removeHabit: (id: string) => void;
  addBlock: (block: Omit<ScheduleBlock, "id">) => void;
  removeBlock: (id: string) => void;
  updateSettings: (patch: Partial<AppState["settings"]>) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useApp(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppStateProvider>");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(freshState);
  const [ready, setReady] = useState(false);
  const [cloud, setCloud] = useState<CloudStatus>("local");
  const sbRef = useRef<SupabaseClient | null>(null);
  const userIdRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load local + connect cloud
  useEffect(() => {
    setState(loadLocal());
    setReady(true);

    async function connect() {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
      try {
        setCloud("connecting");
        const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: true, autoRefreshToken: true },
        });
        sbRef.current = sb;

        // Single-user app: anonymous session bound to this browser.
        let uid_ = (await sb.auth.getUser()).data.user?.id ?? null;
        if (!uid_) {
          const { data, error } = await sb.auth.signInAnonymously();
          if (error || !data.user) throw error ?? new Error("anon signin failed");
          uid_ = data.user.id;
        }
        userIdRef.current = uid_;

        await pull(sb, uid_);
        setCloud("synced");
      } catch {
        setCloud("offline"); // works local-only until Supabase reachable
      }
    }

    async function pull(sb: SupabaseClient, userId: string) {
      const { data, error } = await sb
        .from("app_state")
        .select("data, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data?.data) return;
      const metaRaw = window.localStorage.getItem(SYNC_KEY);
      const lastPush = metaRaw ? (JSON.parse(metaRaw).lastPush as number) : 0;
      const cloudUpdated = new Date(data.updated_at as string).getTime();
      // Cloud wins only if it's newer than our last successful push
      if (cloudUpdated > lastPush) {
        const base = freshState();
        setState((prev) => ({
          ...base,
          ...(data.data as Partial<AppState>),
          settings: { ...base.settings, ...((data.data as AppState)?.settings ?? prev.settings) },
        }));
      }
    }

    void connect();

    // Re-pull when tab regains focus (multi-device freshness)
    async function onFocus() {
      const sb = sbRef.current;
      const uidv = userIdRef.current;
      if (!sb || !uidv) return;
      try {
        await pull(sb, uidv);
      } catch {
        /* stay local */
      }
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist locally immediately; debounce-push to cloud
  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void push(), 1500);

    async function push() {
      const sb = sbRef.current;
      const userId = userIdRef.current;
      if (!sb || !userId) return;
      try {
        const { error } = await sb.from("app_state").upsert({
          user_id: userId,
          data: stateRef.current,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        window.localStorage.setItem(
          SYNC_KEY,
          JSON.stringify({ lastPush: Date.now() }),
        );
        setCloud("synced");
      } catch {
        setCloud("offline");
      }
    }
  }, [state, ready]);

  // ── Actions ────────────────────────────────────────────────────────────────

  function setStatus(date: string, habitId: string, status: HabitStatus | null) {
    setState((prev) => {
      const day = { ...(prev.dailyLogs[date] ?? {}) };
      if (status === null) delete day[habitId];
      else day[habitId] = status;
      return { ...prev, dailyLogs: { ...prev.dailyLogs, [date]: day } };
    });
  }

  function ensureWakeTarget(date: string, target: string) {
    setState((prev) =>
      prev.wakeLogs[date]
        ? prev
        : { ...prev, wakeLogs: { ...prev.wakeLogs, [date]: { target, actual: null } } },
    );
  }

  function setWakeActual(date: string, actual: string | null) {
    setState((prev) => {
      const cur = prev.wakeLogs[date] ?? { target: "04:00", actual: null };
      return { ...prev, wakeLogs: { ...prev.wakeLogs, [date]: { ...cur, actual } } };
    });
  }

  function saveShutdown(entry: ShutdownEntry) {
    setState((prev) => ({ ...prev, shutdown: { ...prev.shutdown, [entry.date]: entry } }));
  }

  function startSession(focus: MuscleGroup[]): string {
    const id = uid();
    const s: WorkoutSession = { id, date: todayStr(), focus };
    setState((prev) => ({ ...prev, sessions: [...prev.sessions, s] }));
    return id;
  }

  function logSet(
    sessionId: string,
    exerciseId: string,
    weightKg: number,
    reps: number,
  ): SetLog {
    const existing = stateRef.current.setLogs.filter((s) => s.sessionId === sessionId && s.exerciseId === exerciseId);
    const set: SetLog = {
      id: uid(),
      sessionId,
      exerciseId,
      weightKg,
      reps,
      setNumber: existing.length + 1,
    };
    setState((prev) => ({ ...prev, setLogs: [...prev.setLogs, set] }));
    return set;
  }

  function deleteSet(setId: string) {
    setState((prev) => ({ ...prev, setLogs: prev.setLogs.filter((s) => s.id !== setId) }));
  }

  function addExercise(name: string, muscleGroup: MuscleGroup) {
    setState((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { id: uid(), name, muscleGroup }],
    }));
  }

  function updateHabit(id: string, patch: Partial<Habit>) {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
  }

  function addHabit(name: string, icon: string, mvdText: string) {
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, { id: uid(), name, icon, mvdText, active: true }],
    }));
  }

  function removeHabit(id: string) {
    setState((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));
  }

  function addBlock(block: Omit<ScheduleBlock, "id">) {
    setState((prev) => ({ ...prev, schedule: [...prev.schedule, { ...block, id: uid() }] }));
  }

  function removeBlock(id: string) {
    setState((prev) => ({ ...prev, schedule: prev.schedule.filter((b) => b.id !== id) }));
  }

  function updateSettings(patch: Partial<AppState["settings"]>) {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }

  const value: StoreCtx = {
    state,
    ready,
    cloud,
    setStatus,
    setWakeActual,
    ensureWakeTarget,
    saveShutdown,
    startSession,
    logSet,
    deleteSet,
    addExercise,
    updateHabit,
    addHabit,
    removeHabit,
    addBlock,
    removeBlock,
    updateSettings,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
