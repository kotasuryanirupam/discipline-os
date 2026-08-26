<div align="center">

<img src="public/icons/icon-512.png" width="88" alt="Discipline OS logo" />

# 🏛️ Discipline OS

**I kept breaking promises to myself — snoozing through 4 AM, skipping the gym, letting
streaks die quietly. So I built the app that makes it impossible to lie to myself.**

It knows my real college timetable. It tracks my actual gym split (Wednesday-anchored,
because that's when my college gym week starts). And it enforces the one rule that
actually works:

### _never miss twice._

[![CI](https://github.com/kotasuryanirupam/discipline-os/actions/workflows/ci.yml/badge.svg)](https://github.com/kotasuryanirupam/discipline-os/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-sync-3fcf8e?logo=supabase)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Tests](https://img.shields.io/badge/tests-19%20passing-brightgreen?logo=vitest&logoColor=6e9a18)](https://github.com/kotasuryanirupam/discipline-os/tree/master/tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[→ Try the live app](https://discipline-os-blond.vercel.app)** ·
[Why I built this](#-why-i-built-this) · [How it works](#-how-it-works) ·
[Screenshots](#-screenshots) · [Run it yourself](#-run-it-yourself) ·
[Architecture](docs/ARCHITECTURE.md)

</div>

---

## 🤔 Why I built this

Every habit tracker I tried had the same two flaws:

1. **They treat a bad day as a broken streak.** Miss one full workout and the counter
   hits zero — which is exactly the moment you need momentum most, not punishment.
   My fix is the **MVD**: every habit has a *Minimum Viable Day* fallback ("20 pushups").
   Log the MVD on a terrible day and the streak survives. Done beats perfect.
2. **Nothing stops the second miss.** One missed day is an accident. Two is the start of
   a new (worse) habit. So the app shows an amber banner after one miss that basically
   says: *today decides everything.* That single screen has saved my streak more times
   than I can count.

Also: generic apps don't know that my college gym closes Tuesdays, or that my Wednesday
starts with a lab at 8 AM. This one does — the schedule blocks and the gym split are
modeled on my **actual** week, not an idealized one.

## 📸 Screenshots

| Today | Gym | Stats |
| :---: | :---: | :---: |
| ![Today](docs/screenshots/today.png) | ![Gym](docs/screenshots/gym.png) | ![Stats](docs/screenshots/stats.png) |
| Day score, wake target, schedule blocks, habit streaks | Wed-anchored split, fast set logging, PR detection | 13-week heatmap, adherence, volume & 1RM progression |

## ⚙️ How it works

The whole day runs through four screens:

- **🎯 Today** — wakes up with me. Day score out of 5, today's wake target (with ramp
  mode easing me from 5:30 → 4:30 → 4:00 across weeks), my class blocks for today's
  weekday with a live NOW marker, habit checkmarks.
- **🏋️ Gym** — follows my real split: Wed Back+Tri → Thu Chest+Bi → Fri Legs+Sh+Abs,
  repeat through Monday, **Tuesday off** (college gym holiday — there's a "train anyway"
  override for the stubborn days). Set logging takes seconds, rest timer vibrates, PRs
  get detected automatically (heavier weight, or same weight × more reps via Epley 1RM).
- **🌙 Shutdown** — 9:30 PM ritual: rate the day honestly, write tomorrow's top 3, pack
  the gym bag. Future me is grateful.
- **📊 Receipts** — the stats page. A 13-week consistency heatmap, adherence per weekday,
  weekly lifting volume, estimated-1RM trendline. Numbers don't flatter you; that's why
  they work.

Underneath all of it:

- **Works fully offline.** localStorage-first; the phone install is a real PWA.
- **Syncs across devices** via Supabase when you want it — with a guard I'm weirdly
  proud of: an empty device can never wipe your cloud history. Ask me how I know.
- **Anonymous by default.** Claim your data with an email later, sign in anywhere with a
  magic link. One account → one streak everywhere.

## 🚀 Run it yourself

```bash
git clone https://github.com/kotasuryanirupam/discipline-os.git
cd discipline-os
npm install
npm run dev        # → http://localhost:3000
```

That's it — no env vars needed, it runs fully local.

### Want cloud sync? (optional)

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → paste [`supabase/schema.sql`](supabase/schema.sql) → RUN
3. **Authentication → Providers** → enable **Anonymous sign-in** + **Email magic link**
4. Add your deploy URL under **URL Configuration** redirects
5. Drop these into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Deploy to Vercel

```bash
npx vercel
# add the two env vars above in project settings
```

Then open it on your phone → **Add to Home Screen**. It installs like a native app.

## 🧪 Tests

The streak math is the soul of this app, so it's pure TypeScript and unit-tested
(Vitest):

```bash
npm test           # 19 tests: never-miss-twice semantics, ramp boundaries,
                   # Epley PR math, MVD-as-win behavior, date edge cases
```

Rule I hold myself to: no engine change ships without tests.

## 🗺️ Roadmap

- [ ] Body-weight log + trend line
- [ ] Weekly review screen (auto-generated from shutdown entries)
- [ ] Widget-style quick actions from the home screen
- [ ] Export a month of receipts as Markdown

## 🧱 Under the hood

Curious how the layers fit together (and why `engine.ts` is forbidden from touching the
DOM)? Read **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

Stack in one line: **Next.js 16 · React 19 · TypeScript strict · Tailwind v4 ·
hand-rolled SVG charts (zero chart deps) · Supabase sync · PWA**.

## 🤝 Contributing

Honestly? This is a tool built for exactly one person's life — mine. But if you fork it
and bend it to yours, I'd love to see what you change. House rules are in
**[CONTRIBUTING.md](CONTRIBUTING.md)**; security stuff goes privately via
**[SECURITY.md](SECURITY.md)**. Releases live in **[CHANGELOG.md](CHANGELOG.md)**.

## 📄 License

[MIT](LICENSE) © Kota Surya Nirupam

---

<div align="center">
<sub>Built for one user · show up daily · <b>never miss twice</b> 🔥</sub>
</div>
