<div align="center">

<img src="public/icons/icon-512.png" width="72" alt="Discipline OS logo" />

# Discipline OS

A personal consistency tracker built around one real routine: a college timetable, a 4 AM wake target, and one rule — never miss twice.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-sync-3fcf8e?logo=supabase)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![CI](https://github.com/kotasuryanirupam/discipline-os/actions/workflows/ci.yml/badge.svg)](https://github.com/kotasuryanirupam/discipline-os/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live app](https://discipline-os-blond.vercel.app)

</div>

---

## Why this exists

Most habit trackers assume every day looks the same. Mine doesn't — class schedule changes by weekday, gym days rotate around a college gym that's closed on Tuesdays, and a 4 AM wake-up isn't realistic to start cold. So instead of adapting my routine to an app, I built the app around the routine.

The core idea is simple: missing a day once is normal. Missing it twice in a row is how a habit actually dies. Everything in the app is built to make that second miss hard to ignore.

## Screenshots

| Today | Gym | Stats |
| :---: | :---: | :---: |
| ![Today](docs/screenshots/today.png) | ![Gym](docs/screenshots/gym.png) | ![Stats](docs/screenshots/stats.png) |
| Day score, wake target, schedule blocks, streaks | Wed-anchored split, set logging, PR detection | 13-week heatmap, adherence, volume & 1RM |

## Features

- **Today dashboard** — a day score out of 5, a wake target with ramp mode, and a weekday-aware schedule with a live "now" indicator
- **Streaks with an MVD fallback** — every habit has a *Minimum Viable Day* version, so a rough day doesn't have to break the streak
- **Never-miss-twice logic** — one missed day shows a warning, two resets the streak. The app is explicit about which day matters
- **Gym tracker** — a Wednesday-anchored split (Back+Tri → Chest+Bi → Legs+Shoulders+Abs, twice a week, Tuesday off for the college gym schedule), fast set logging, a rest timer, and PR detection on both weight and estimated 1RM (Epley)
- **Shutdown ritual** — a 9:30 PM wind-down: rate the day, write tomorrow's top 3, check the gym bag
- **Stats** — a 13-week consistency heatmap, adherence by weekday, weekly volume, and a 1RM progression sparkline
- **Cross-device sync** — works fully offline via localStorage, syncs to Supabase when online, with a guard so an empty new device can't wipe existing history
- **One account across devices** — claim anonymous local data with an email, then sign in elsewhere with a magic link
- **Installable PWA** — real app icons, offline shell, works like a native app on a phone

## How it's built

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Fast local builds, file-based routing |
| UI | React 19 + Tailwind CSS v4 | Utility-first styling, no design system overhead |
| Language | TypeScript (strict) | The streak math is the one thing that can't silently break |
| State | Custom store, localStorage + Supabase | Offline-first, last-write-wins, no extra state library |
| Charts | Hand-rolled SVG/CSS | No animation flakiness, keeps the bundle small |
| Cloud | Supabase, one JSONB row per user | Simple sync model, RLS-scoped, anonymous-to-email upgrade path |
| PWA | Manifest + service worker | Installable, works offline, network-first navigation |

## Running it locally

```bash
git clone https://github.com/kotasuryanirupam/discipline-os.git
cd discipline-os
npm install
npm run dev        # http://localhost:3000
```

No environment variables needed to try it — without them the app just runs fully local, storing everything in localStorage.

### Setting up cloud sync (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL Editor, paste in [`supabase/schema.sql`](supabase/schema.sql), and run it
3. Under Authentication → Providers, enable **Anonymous sign-in** and **Email (magic link)**
4. Under Authentication → URL Configuration, add your deployed URL as a redirect (`https://your-app.vercel.app/**`)
5. Add your project URL and anon key to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Deploying (Vercel)

```bash
npx vercel
# then set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the project's env vars
```

To install it on a phone, open the deployed URL and use "Add to Home Screen."

## Project structure

```
src/
  app/            page.tsx (Today) · gym/ · shutdown/ · stats/ · settings/
  components/     NavBar · CloudDot · ServiceWorkerRegister · ui
  lib/
    types.ts      data model, GYM_WEEK (Wed-anchored split)
    seed.ts       default habits, timetable, exercises
    engine.ts     streaks, never-miss-twice, ramp, PR math
    store.tsx     state, localStorage, Supabase sync, auth
scripts/
  gen-icons.mjs   generates PNG/maskable icons from the SVG source
supabase/
  schema.sql      app_state table + RLS policies
public/
  icons/          192/512 PNG, maskable, apple-touch icons
  manifest.json, sw.js (PWA), icon.svg
docs/screenshots/ images used in this README
```

## Roadmap

- Body-weight log with a trend line
- Weekly review screen, auto-generated from shutdown entries
- Home-screen quick-action widgets
- Monthly data export to Markdown

## License

[MIT](LICENSE) © Kota Surya Nirupam
