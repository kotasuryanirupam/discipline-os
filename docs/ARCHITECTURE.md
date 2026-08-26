# Architecture — Discipline OS

How the app is put together, why each decision was made, and where the important
invariants live. I wrote this for two audiences: future me at 2 AM wondering *why* the
streak logic looks like that, and anyone (human or AI agent) about to touch `src/lib/`.

## 1. Big picture

```
┌────────────────────────────────────────────────────────────────────┐
│                        PWA SHELL (public/)                         │
│   manifest.json · sw.js (offline cache v2) · icons/                │
└───────────────▲────────────────────────────────────────────────────┘
                │ registers
┌───────────────┴────────────────────────────────────────────────────┐
│                     NEXT.JS APP ROUTER (src/app)                   │
│  /  Today    /gym    /shutdown    /stats    /settings              │
│         React 19 client components, Tailwind v4                    │
└───────────────▲────────────────────────────────────────────────────┘
                │ useStore()
┌───────────────┴────────────────────────────────────────────────────┐
│                      STORE (src/lib/store.tsx)                     │
│   single React context · loads localStorage → hydrates UI          │
│   every mutation: update local state → persist → queue sync        │
└───────▲──────────────────────────────────────────────┬─────────────┘
        │ pure calls                                   │ JSONB upsert
┌───────┴───────────────────────────────┐   ┌──────────▼──────────────┐
│      ENGINE (src/lib/engine.ts)       │   │   SUPABASE (cloud)      │
│  streaks · never-miss-twice · ramp ·  │   │  app_state: ONE row per │
│  PR math · date helpers               │   │  user: { data: jsonb }  │
│  (pure, testable, no I/O)             │   │  RLS: auth.uid()=user_id│
└───────────────────────────────────────┘   └─────────────────────────┘

TYPES (src/lib/types.ts) ── the shared vocabulary everything speaks
SEED  (src/lib/seed.ts)  ── default habits, weekday timetable templates, exercises
```

## 2. Layer rules (the important invariants)

| Layer | May import | Must never |
|---|---|---|
| `lib/types.ts` | nothing | — (leaf) |
| `lib/engine.ts` | `types` only | touch `window`, storage, network, or React — **pure functions only** |
| `lib/store.tsx` | `types`, `engine`, supabase-js | contain business logic (delegates to engine) |
| `app/*`, `components/*` | store, engine, types | read/write localStorage directly |

**Why:** the streak math is the heart of the product. Keeping it pure means the whole
engine can be tested without a browser (see `tests/engine.test.ts`) and can never break
silently because of some UI side effect. This split has already paid for itself — every
streak bug I've ever had was caught by a test, not by losing a 100-day streak.

## 3. Core domain concepts

### Habit statuses & MVD
```
done    → full completion          (win)
mvd     → Minimum Viable Day done  (WIN — keeps the streak alive)
missed  → logged miss              (breaks current streak)
(no log)→ day didn't happen yet    (neither win nor miss; pre-start days are skipped)
```

### Never-miss-twice (`computeStreak`)
Walks backward from yesterday over the habit's log:
1. Count trailing consecutive **misses** → `missStreak`.
2. `warn = missStreak === 1` → amber banner ("today decides everything").
3. Current streak = trailing wins (today counts only if already logged as a win).
4. Best streak = longest contiguous run across **all** history.

### Ramp mode (`wakeTarget`)
`startDate + floor(daysBetween/7)` indexes into fixed steps `05:30 → 04:30 → 04:00`
(clamped at the last). Disabled ⇒ straight to `04:00`. Week boundaries are computed in
whole days from the anchor date — no DST/timezone arithmetic beyond local-date parsing.

### Wed-anchored gym week (`gymFocusForWeekday`)
The real week starts Wednesday (first college gym day): position =
`(weekday − 3 + 7) % 7` into `[Back+Tri, Chest+Bi, Legs+Sh+Abs, Back+Tri, Chest+Bi,
Legs+Sh+Abs, null]`. `null` = Tuesday rest day (college gym holiday).

### PR detection (`checkPR`)
- First-ever log for an exercise ⇒ **not** a PR (no confetti spam on day one).
- `weight > prevMax(weight)` ⇒ weight PR.
- else `est1RM(w,r) > prevMax(est1RM)` ⇒ 1RM PR. Epley: `w × (1 + r/30)`.

## 4. State & sync model

**localStorage-first.** The full app state is one object; cloud sync mirrors it as a
single Supabase row:

```sql
app_state ( user_id uuid PK → auth.users, data jsonb, updated_at timestamptz )
-- RLS: select/insert/update WHERE auth.uid() = user_id
```

Sync semantics:
- **Last-write-wins** between device and cloud timestamps.
- **Empty-write protection:** a payload that is empty (fresh device, wiped table) never
  overwrites non-empty counterpart data. This guard exists because "opened the app on a
  new phone" must never equal "deleted my 200-day history".
- **Anonymous-first auth:** device gets an anonymous Supabase user immediately; later an
  email claim upgrades it; magic-link login from another device lands in the same row.
  One account → one streak everywhere.

## 5. PWA layer

- `public/sw.js`: network-first for navigations, cache-first for static assets,
  cache version bumped manually (`v2`) when the shell changes.
- Icons: generated by `scripts/gen-icons.mjs` (sharp): SVG → PNG 192/512 + maskable
  variants + apple-touch-icon. Regenerate with `npm run icons`.

## 6. Testing strategy

`tests/engine.test.ts` (Vitest) covers the engine's contract:
date helpers, streak semantics (MVD-as-win, warn-at-one-miss, reset-at-two),
ramp boundaries, Epley math, PR classification, last-session lookup.
**Rule: any change to engine behavior ships with tests.** UI is intentionally untested;
the logic/UI split keeps the risky part covered cheaply.

## 7. Deliberate non-decisions

- **No Redux/Zustand/Jotai** — one context is enough for this state size.
- **No chart library** — hand-rolled SVG renders instantly and never fights hydration.
- **No ORM / migrations framework** — one idempotent SQL file is the whole schema.
- **No server code** — the Vercel deployment serves static prerender; all dynamic
  behavior is client-side + Supabase.
