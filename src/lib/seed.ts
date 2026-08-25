// ── Discipline OS · Seed Data ────────────────────────────────────────────────
// Preloaded habits, your real college timetable, gym split & exercises.

import type { Habit, ScheduleBlock, Exercise } from "./types";

export const DEFAULT_HABITS: Habit[] = [
  { id: "h-wake", name: "Wake by target time", icon: "⏰", mvdText: "Got up within 30 min late", active: true },
  { id: "h-deep", name: "Deep work 4:15–5:45 (side hustle)", icon: "💰", mvdText: "10 min on side hustle", active: true },
  { id: "h-gym", name: "Gym", icon: "🏋️", mvdText: "20 pushups", active: true },
  { id: "h-shutdown", name: "Shutdown ritual 9:30pm", icon: "🌙", mvdText: "Write tomorrow's tasks", active: true },
  { id: "h-phone", name: "No phone first 30 min", icon: "📵", mvdText: "", active: true },
];

// day: 0=Sun … 6=Sat · College timetable as told
export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  // Monday – holiday / power day
  { id: "m-1", day: 1, start: "09:00", end: "13:00", label: "Client deadline block", kind: "deep" },
  { id: "m-2", day: 1, start: "14:30", end: "16:30", label: "Skills course", kind: "skill" },
  { id: "m-3", day: 1, start: "18:00", end: "19:00", label: "Active recovery walk", kind: "rest" },
  // Tuesday
  { id: "t-0", day: 2, start: "09:00", end: "11:00", label: "Classes", kind: "college" },
  { id: "t-1", day: 2, start: "11:00", end: "13:00", label: "Skills course", kind: "skill" },
  { id: "t-2", day: 2, start: "14:00", end: "15:15", label: "Project work", kind: "project" },
  { id: "t-3", day: 2, start: "15:40", end: "17:30", label: "Lab", kind: "lab" },
  { id: "t-4", day: 2, start: "18:00", end: "19:00", label: "Light work (emails, posting)", kind: "project" },
  // Wednesday
  { id: "w-0", day: 3, start: "10:00", end: "13:00", label: "Classes", kind: "college" },
  { id: "w-1", day: 3, start: "14:00", end: "15:30", label: "Lab", kind: "lab" },
  { id: "w-2", day: 3, start: "16:00", end: "17:00", label: "Class", kind: "college" },
  { id: "w-3", day: 3, start: "17:45", end: "19:30", label: "Skills + Project", kind: "skill" },
  // Thursday – killer day
  { id: "th-0", day: 4, start: "09:00", end: "10:00", label: "Class", kind: "college" },
  { id: "th-1", day: 4, start: "11:00", end: "12:00", label: "Class", kind: "college" },
  { id: "th-2", day: 4, start: "12:00", end: "14:00", label: "Lunch + rest", kind: "rest" },
  { id: "th-3", day: 4, start: "14:00", end: "15:00", label: "Class", kind: "college" },
  { id: "th-4", day: 4, start: "15:00", end: "17:15", label: "Library study block", kind: "skill" },
  { id: "th-5", day: 4, start: "17:40", end: "19:10", label: "Lab", kind: "lab" },
  { id: "th-6", day: 4, start: "19:30", end: "21:30", label: "HARD STOP · zero work", kind: "rest" },
  // Friday – morning mega block (gym moves to evening)
  { id: "f-0", day: 5, start: "08:00", end: "13:00", label: "Classes", kind: "college" },
  { id: "f-1", day: 5, start: "13:00", end: "15:50", label: "Free block (lunch + work)", kind: "deep" },
  { id: "f-2", day: 5, start: "15:50", end: "17:30", label: "Lab", kind: "lab" },
  { id: "f-3", day: 5, start: "18:00", end: "19:15", label: "Gym (evening edition)", kind: "gym" },
  // Saturday
  { id: "s-0", day: 6, start: "09:00", end: "13:00", label: "Classes", kind: "college" },
  { id: "s-1", day: 6, start: "15:00", end: "16:00", label: "Class", kind: "college" },
  { id: "s-2", day: 6, start: "16:15", end: "19:00", label: "Big project / client block", kind: "project" },
  // Sunday – build + reset
  { id: "su-0", day: 0, start: "06:00", end: "09:00", label: "Deep work", kind: "deep" },
  { id: "su-1", day: 0, start: "10:00", end: "13:00", label: "Project marathon", kind: "project" },
  { id: "su-2", day: 0, start: "18:00", end: "19:00", label: "Weekly review + plan week", kind: "review" },
];

export const DEFAULT_EXERCISES: Exercise[] = [
  // Back
  { id: "ex-pullup", name: "Pull-ups", muscleGroup: "back" },
  { id: "ex-latpull", name: "Lat Pulldown", muscleGroup: "back" },
  { id: "ex-row", name: "Barbell Row", muscleGroup: "back" },
  { id: "ex-seatedrow", name: "Seated Cable Row", muscleGroup: "back" },
  // Triceps
  { id: "ex-pushdown", name: "Triceps Pushdown", muscleGroup: "triceps" },
  { id: "ex-skull", name: "Skull Crushers", muscleGroup: "triceps" },
  { id: "ex-dips", name: "Bench Dips", muscleGroup: "triceps" },
  // Chest
  { id: "ex-bench", name: "Barbell Bench Press", muscleGroup: "chest" },
  { id: "ex-dbpress", name: "Dumbbell Press", muscleGroup: "chest" },
  { id: "ex-incline", name: "Incline DB Press", muscleGroup: "chest" },
  { id: "ex-fly", name: "Cable Fly", muscleGroup: "chest" },
  // Biceps
  { id: "ex-curl", name: "Barbell Curl", muscleGroup: "biceps" },
  { id: "ex-dbcurl", name: "Dumbbell Curl", muscleGroup: "biceps" },
  { id: "ex-hammer", name: "Hammer Curl", muscleGroup: "biceps" },
  // Legs
  { id: "ex-squat", name: "Barbell Squat", muscleGroup: "legs" },
  { id: "ex-legpress", name: "Leg Press", muscleGroup: "legs" },
  { id: "ex-rdl", name: "Romanian Deadlift", muscleGroup: "legs" },
  { id: "ex-lunge", name: "Walking Lunges", muscleGroup: "legs" },
  { id: "ex-calf", name: "Calf Raises", muscleGroup: "legs" },
  // Shoulders
  { id: "ex-ohp", name: "Overhead Press", muscleGroup: "shoulders" },
  { id: "ex-lateral", name: "Lateral Raises", muscleGroup: "shoulders" },
  { id: "ex-reardelt", name: "Rear Delt Fly", muscleGroup: "shoulders" },
  // Abs
  { id: "ex-plank", name: "Plank", muscleGroup: "abs" },
  { id: "ex-crunch", name: "Cable Crunch", muscleGroup: "abs" },
  { id: "ex-legraise", name: "Leg Raises", muscleGroup: "abs" },
];
