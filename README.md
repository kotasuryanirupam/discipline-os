# 🏛️ Discipline OS

A personal consistency operating system — built for **one user**, designed around
a real college timetable, a 4am routine, and the rule that wins everything:
**never miss twice.**

> Next.js 16 · React 19 · Tailwind v4 · Supabase (cloud sync) · PWA

## Screens

| Route | What it does |
|-------|--------------|
| `/today` | Wake target + log · today's schedule blocks (auto by weekday) · habit checklist with Done / **MVD** / Missed · streaks 🔥 |
| `/gym` | Rotating split (Back+Tri → Chest+Bi → Legs+Sh+Abs) · fast set logging · rest timer · PR detection (weight & est. 1RM) |
| `/shutdown` | 9:30pm ritual: rate the day · write tomorrow's 3 tasks · gym-bag check |
| `/stats` | 13-week consistency heatmap · adherence by weekday · gym volume & progression charts |
| `/settings` | Ramp mode (5:30→4:30→4:00) · edit habits/MVDs · edit schedule blocks · export backup |

## Core concepts

- **MVD (Minimum Viable Day)** — a tiny fallback action that *keeps the streak alive* on terrible days.
- **Never miss twice** — 1 missed day = amber warning banner; 2 = streak resets.
- **Day-type schedules** — every weekday loads its own block template (matches your real timetable).
- **Ramp mode** — progressive wake targets so the 4am habit doesn't kill you in week 1.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Cloud sync setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste `supabase/schema.sql` → RUN.
3. Authentication → Providers → enable **Anonymous sign-in**.
4. Copy Project URL + anon key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

No env vars? App still works — fully local (localStorage), syncs when configured.

## Deploy (Vercel)

```bash
npx vercel
# add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in project env vars
```

Install it on your phone: open the deployed URL → "Add to Home Screen".

## Project layout

```
src/
  app/            page.tsx (Today) · gym/ · shutdown/ · stats/ · settings/
  components/     NavBar · CloudDot · ServiceWorkerRegister · ui
  lib/
    types.ts      data model
    seed.ts       your habits, timetable, exercises
    engine.ts     streaks, never-miss-twice, ramp, PR math
    store.tsx     state + localStorage + Supabase JSONB sync
supabase/schema.sql
public/           manifest.json · sw.js (PWA) · icon.svg
```
