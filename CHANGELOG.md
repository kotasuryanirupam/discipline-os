# Changelog

I keep this by hand, the way I'd want to read it. Newest first.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Planned
- Body-weight log + trend line
- Weekly review screen (auto-generated from shutdown entries)
- Home-screen quick-action widgets
- Data export → Markdown monthly report

## [1.0.0] — 2026-08-26

First stable release. The full loop I wanted on day one finally works end to end:
**Today → log habits → gym → shutdown ritual → receipts.**

### Added
- **Today dashboard** — day score (X/5), wake target with ramp mode, weekday-aware
  schedule blocks, live NOW highlight
- **Habit streaks with MVD semantics** — `done | mvd | missed` statuses; Minimum Viable
  Day keeps streaks alive on terrible days
- **Never-miss-twice engine** — one trailing miss = amber warning banner; two consecutive
  misses = reset (`computeStreak` in `src/lib/engine.ts`)
- **Gym tracker** — Wednesday-anchored split (Wed Back+Tri → Thu Chest+Bi → Fri
  Legs+Sh+Abs → Sat/Sun/Mon repeat; Tuesday = college gym holiday with train-anyway
  override), fast set logging, rest timer with vibration, PR detection (raw weight +
  Epley est. 1RM), last-session reference sets
- **Shutdown ritual** — 9:30 PM wind-down: day rating, tomorrow's top 3, gym-bag check
- **Stats ("receipts")** — 13-week consistency heatmap, adherence by weekday, weekly
  lifting volume, 1RM progression sparkline, per-habit streak records
- **Cross-device sync** — Supabase single-table JSONB sync, per-user metadata,
  anonymous-first auth with email claim + magic-link login on other devices
- **Data-safety guards** — an empty device or an empty cloud payload can never overwrite
  real history
- **PWA** — real PNG + maskable icon set, apple-touch-icon, installable standalone
  display, offline-capable service worker (cache v2)
- **CI** — GitHub Actions: lint + build-with-typecheck on every push/PR to `master`
- **Tests** — Vitest suite covering the engine: date math, streak/never-miss-twice
  semantics, ramp mode, Epley 1RM + PR detection, last-session lookup

### Changed
- Charts rebuilt as dependency-free SVG/CSS (goodbye Recharts) — instant render, tiny bundle
- TypeScript check folded into `next build` (route types are generated during build)

## [0.1.0] — 2026-08-25

Where it all started. Built in one very caffeinated stretch:

### Added
- Initial app: habits, day-type schedule, gym tracker, shutdown ritual, stats,
  Supabase sync, PWA shell (Create Next App base)
- Unified cross-device auth: email claim + magic link login, per-user sync metadata
- Turbopack root pinned to the repo

[unreleased]: https://github.com/kotasuryanirupam/discipline-os/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kotasuryanirupam/discipline-os/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/kotasuryanirupam/discipline-os/releases/tag/v0.1.0
