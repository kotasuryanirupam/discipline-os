# 🤝 Contributing to Discipline OS

Thanks for your interest in contributing! 🎉 Discipline OS is a **personal, opinionated
product** — it is deliberately built for *one user's real life* (a specific college
timetable, a Wed-anchored gym split, a 4 AM ramp). That philosophy shapes every rule below.

## 🧭 Project philosophy (read first)

1. **Opinionated by design.** The app encodes one person's system: MVD semantics,
   never-miss-twice, the Wednesday gym anchor. Don't propose features that generalize
   these into "configurable everything" — the opinions *are* the product.
2. **Zero-dependency bias.** Charts are hand-rolled SVG/CSS. State is a custom store.
   Before adding any npm package, ask: *"can 40 lines of TypeScript do this?"*
3. **Offline-first.** localStorage is the source of truth; Supabase sync is a bonus.
   Every feature must work with zero network and zero env vars.
4. **The streak math must never silently break.** Logic changes require tests.

## 🛠️ Setup

```bash
git clone https://github.com/kotasuryanirupam/discipline-os.git
cd discipline-os
npm install
npm run dev          # → http://localhost:3000
```

No `.env.local` needed — the app runs fully local without Supabase keys.

## 🔁 Workflow

1. **Open an issue first** for anything bigger than a typo fix — include the behavior
   you saw vs. expected, and screenshots for UI changes.
2. Fork → branch from `master`:
   ```bash
   git checkout -b feat/weekly-review-screen
   ```
3. Branch naming: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`.
4. Commit style — [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(stats): add weekly adherence trend to receipts screen
   fix(engine): treat today-as-mvd as a win when computing warn state
   docs(readme): clarify ramp-mode week boundaries
   ```
5. Before pushing, make all gates pass locally:
   ```bash
   npm run lint        # eslint (next/core-web-vitals)
   npm test            # vitest — engine logic must stay green
   npm run build       # next build (includes full typecheck)
   ```
6. Push and open a PR against `master`. Fill out the PR template, tick the checklist.
7. CI must be green before review.

## ✅ Code guidelines

**TypeScript**
- Strict mode; no `any` unless there's a written justification in a comment.
- Domain types live in [`src/lib/types.ts`](src/lib/types.ts) — extend them, don't
  invent parallel shapes.

**Logic (`src/lib/engine.ts`)**
- Pure functions only — no `window`, no React, no storage access.
- Any change to streak / never-miss-twice / ramp / PR math **requires tests** in
  [`tests/engine.test.ts`](tests/engine.test.ts), including edge cases
  (empty history, gaps, timezone-sensitive dates).

**UI (`src/app`, `src/components`)**
- Tailwind utility classes; dark, high-contrast, mobile-first (the app lives on a phone).
- No new client-state libraries; use the existing store ([`src/lib/store.tsx`](src/lib/store.tsx)).

**Data & privacy**
- Never log or persist user content outside the user's own device/row.
- Sync changes must preserve the **data-safety guards**: an empty device or an empty
  cloud payload can never overwrite real history.

## 🐛 Bug reports

Great bug reports include:
- Device + browser + installed-as-PWA or not
- Exact date & weekday (the schedule/gym split is weekday-aware!)
- What the streak/score showed vs. what the logs say
- A screenshot

## 💡 Feature requests

Frame it as: **problem** → **why existing features don't cover it** → **smallest possible
version**. Features that add config surface will likely be declined; features that deepen
the core loop (today → log → shutdown → receipts) are welcome.

## 📄 License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
