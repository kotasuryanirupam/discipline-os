// ── Discipline OS · Engine tests ─────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import {
  addDays,
  todayStr,
  dayIndex,
  computeStreak,
  wakeTarget,
  daysBetween,
  est1RM,
  checkPR,
  lastSetsForExercise,
} from "../src/lib/engine";
import type { HabitStatus, SetLog, WorkoutSession } from "../src/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

const D = (s: string) => s; // date keys are plain strings

function wins(...dates: string[]): Record<string, HabitStatus> {
  return Object.fromEntries(dates.map((d) => [D(d), "done" as const]));
}

// ── date helpers ─────────────────────────────────────────────────────────────

describe("date helpers", () => {
  it("formats today as YYYY-MM-DD", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("addDays crosses month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-15", -15)).toBe("2026-02-28");
  });

  it("dayIndex is deterministic and monotonic", () => {
    expect(dayIndex("2026-08-26") - dayIndex("2026-08-25")).toBe(1);
    expect(dayIndex("2030-01-01") - dayIndex("2026-08-26")).toBeGreaterThan(0);
    // stable across calls
    expect(dayIndex("2026-08-26")).toBe(dayIndex("2026-08-26"));
  });

  it("daysBetween is symmetric with sign", () => {
    expect(daysBetween("2026-01-01", "2026-01-08")).toBe(7);
    expect(daysBetween("2026-01-08", "2026-01-01")).toBe(-7);
  });
});

// ── streaks · never-miss-twice ───────────────────────────────────────────────

describe("computeStreak", () => {
  const T = "2026-08-26"; // Wednesday, in the middle of a real week

  it("zero state → zero everything, no warning", () => {
    const s = computeStreak({}, T);
    expect(s).toEqual({ current: 0, best: 0, missStreak: 0, warn: false });
  });

  it("counts consecutive wins up to yesterday; today counts only when logged", () => {
    const s = computeStreak(wins("2026-08-24", "2026-08-25"), T);
    expect(s.current).toBe(2);
    // log a win for today too
    const s2 = computeStreak(wins("2026-08-24", "2026-08-25", "2026-08-26"), T);
    expect(s2.current).toBe(3);
  });

  it("MVD keeps the streak alive (the whole point of MVD)", () => {
    const statuses: Record<string, HabitStatus> = {
      "2026-08-22": "done",
      "2026-08-23": "mvd",
      "2026-08-24": "done",
      "2026-08-25": "mvd",
    };
    const s = computeStreak(statuses, T);
    expect(s.current).toBe(4);
    expect(s.warn).toBe(false);
  });

  it("one trailing miss = amber warning, but current streak survives", () => {
    const statuses: Record<string, HabitStatus> = {
      ...wins("2026-08-21", "2026-08-22", "2026-08-23"),
      "2026-08-25": "missed", // yesterday missed
    };
    const s = computeStreak(statuses, T);
    expect(s.warn).toBe(true); // never-miss-twice banner
    expect(s.missStreak).toBe(1);
  });

  it("two consecutive misses = streak reset (never miss twice)", () => {
    const statuses: Record<string, HabitStatus> = {
      ...wins("2026-08-20", "2026-08-21", "2026-08-22"),
      "2026-08-24": "missed",
      "2026-08-25": "missed",
    };
    const s = computeStreak(statuses, T);
    expect(s.current).toBe(0);
    expect(s.missStreak).toBe(2);
    expect(s.warn).toBe(false);
  });

  it("best streak scans all history, not just the tail", () => {
    const statuses = wins(
      "2026-07-01", "2026-07-02", "2026-07-03", // 3-day run
      "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25", // 6-day run
    );
    const s = computeStreak(statuses, T);
    expect(s.best).toBe(6);
    expect(s.current).toBe(6);
  });

  it("a non-contiguous win does not extend a run", () => {
    const statuses = wins("2026-08-10", "2026-08-12"); // gap on the 11th
    const s = computeStreak(statuses, "2026-08-13");
    expect(s.best).toBe(1);
  });
});

// ── wake target · ramp mode ──────────────────────────────────────────────────

describe("wakeTarget / ramp mode", () => {
  it("ramp disabled → straight to the final target (04:00)", () => {
    expect(wakeTarget({ rampEnabled: false }, "2026-08-26")).toBe("04:00");
  });

  it("week 0 → 05:30, week 1 → 04:30, week 2+ → 04:00", () => {
    const settings = { startDate: "2026-08-24", rampEnabled: true };
    expect(wakeTarget(settings, "2026-08-25")).toBe("05:30"); // week 0
    expect(wakeTarget(settings, "2026-08-31")).toBe("04:30"); // day 7 → week 1
    expect(wakeTarget(settings, "2026-09-07")).toBe("04:00"); // day 14 → week 2
    expect(wakeTarget(settings, "2026-12-25")).toBe("04:00"); // far future clamps
  });

  it("missing startDate falls back safely", () => {
    expect(wakeTarget({ rampEnabled: true }, "2026-08-26")).toBe("05:30");
  });
});

// ── gym math ────────────────────────────────────────────────────────────────

describe("gym math", () => {
  it("Epley 1RM: reps=1 → raw weight, heavier reps scale linearly", () => {
    expect(est1RM(100, 1)).toBe(100);
    expect(est1RM(100, 5)).toBeCloseTo(116.67, 1);
    expect(est1RM(60, 10)).toBeCloseTo(80, 1);
  });

  it("first-ever log is NOT a PR (no confetti spam)", () => {
    // The new set arrives inside allSetLogs and is excluded via excludeSetId
    const incoming: SetLog = { id: "new-set", sessionId: "w1", exerciseId: "bench", weightKg: 65, reps: 5, setNumber: 1 };
    expect(checkPR("bench", 65, 5, [incoming], "new-set").isPR).toBe(false);
    expect(checkPR("bench", 65, 5, [], undefined).isPR).toBe(false);
  });

  it("heavier weight = weight PR; same weight more reps = 1RM PR", () => {
    const history: SetLog[] = [
      { id: "a", sessionId: "w1", exerciseId: "bench", weightKg: 60, reps: 8, setNumber: 1 },
      { id: "b", sessionId: "w1", exerciseId: "bench", weightKg: 60, reps: 5, setNumber: 2 },
    ];
    // exclude the set under evaluation ("b") when re-checking it
    expect(checkPR("bench", 62.5, 5, [history[0], { ...history[1], id: "new" }], "new").isPR).toBe(true);

    const r2 = checkPR("bench", 60, 9, history.filter((s) => s.id !== "b"), "b");
    expect(r2.isPR).toBe(true);
    expect(r2.kind === "weight" || r2.kind === "1rm").toBe(true);
  });

  it("PR checks ignore other exercises", () => {
    const logs: SetLog[] = [
      { id: "x", sessionId: "w1", exerciseId: "squat", weightKg: 140, reps: 3, setNumber: 1 },
    ];
    const r = checkPR("bench", 40, 10, logs, "new");
    expect(r.isPR).toBe(false);
  });

  it("lastSetsForExercise returns latest session sets before a date", () => {
    const sessions: WorkoutSession[] = [
      { id: "w1", date: "2026-08-19", focus: ["chest"] },
      { id: "w2", date: "2026-08-24", focus: ["chest"] },
    ];
    const logs: SetLog[] = [
      { id: "l1", sessionId: "w1", exerciseId: "bench", weightKg: 50, reps: 8, setNumber: 1 },
      { id: "l2", sessionId: "w2", exerciseId: "bench", weightKg: 55, reps: 8, setNumber: 1 },
      { id: "l3", sessionId: "w2", exerciseId: "incline", weightKg: 40, reps: 10, setNumber: 1 },
    ];
    const res = lastSetsForExercise("bench", logs, sessions, "2026-08-26");
    expect(res?.date).toBe("2026-08-24");
    expect(res?.sets).toHaveLength(1);
    expect(res?.sets[0].weightKg).toBe(55);
    expect(lastSetsForExercise("bench", [], [], "2026-08-26")).toBeNull();
  });
});
