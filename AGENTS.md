# ── Discipline OS · AGENTS.md ────────────────────────────────────────────────
# Guidance for AI coding agents (Claude Code, Codex, Cursor, ...) working in this repo.

## What this project is

A single-user, opinionated PWA: habit streaks with MVD semantics, never-miss-twice
engine, Wed-anchored gym split tracker, shutdown ritual. Next.js 16 + React 19 +
TypeScript strict + Tailwind v4 + Supabase sync. Read `docs/ARCHITECTURE.md` first.

## Non-negotiables

1. **`src/lib/engine.ts` stays pure** — no DOM, no storage, no network, no React.
   All streak/ramp/PR logic lives there as testable functions.
2. **Engine changes require tests** in `tests/engine.test.ts` (vitest). Run `npm test`.
3. **No new runtime dependencies.** Charts are hand-rolled SVG; state is a custom store.
   If a dependency seems necessary, stop and ask the human.
4. **Offline-first**: every feature must work with no env vars and no network.
   localStorage is the source of truth; Supabase is a bonus layer.
5. **Data-safety guards**: an empty device payload or empty cloud row must never
   overwrite non-empty counterpart data (see store.tsx sync guards).
6. **Opinionated product**: don't "generalize" the Wed anchor, MVD texts, or ramp steps
   into configurable settings unless explicitly asked — they are intentional.

## Commands

```bash
npm run dev         # dev server (localhost:3000)
npm run build       # production build; includes full TypeScript check
npm run lint        # eslint
npm test            # vitest once        (test:watch for watch mode)
npm run icons       # regenerate PWA icons from SVG (sharp)
```

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`), branch names
  `feat/<slug>` / `fix/<slug>`.
- Domain types live in `src/lib/types.ts`; extend them rather than inventing shapes.
- Tailwind utilities only; dark, mobile-first UI. No CSS-in-JS, no component libraries.
- Dates are local-time `YYYY-MM-DD` strings everywhere; never introduce timezone
  conversion helpers without a very good reason.

## Gotchas

- `dayIndex()` uses epoch math — it is timezone-sensitive by ±1 day and only used mod-3
  for split rotation. Don't use it for display dates.
- `next build` generates route types; standalone `tsc --noEmit` fails on a clean clone.
  Always typecheck through the build.
- The Supabase anon key is public by design; security rests on RLS in schema.sql.
- Service worker cache version lives in `public/sw.js`; bump it when the shell changes.
