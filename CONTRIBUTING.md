# 🤝 Contributing

First off — thanks for even reading this. Discipline OS started as a tool for exactly
one person (me), so contributing here is a bit unusual. Here's how I think about it:

## The honest disclaimer

This app is **opinionated on purpose**. It hardcodes my college timetable, my
Wednesday-anchored gym split, my 4 AM ramp. If you open a PR that turns those into
config options for everyone, I'll probably decline — not because it's bad engineering,
but because the opinions *are* the product. Fork it and make it yours instead; I mean
that genuinely.

That said: bug fixes, engine improvements, docs, and anything that deepens the core loop
(today → log → shutdown → receipts) are very welcome.

## House rules

These are the rules I hold myself to, and PRs to:

1. **The engine stays pure.** [`src/lib/engine.ts`](src/lib/engine.ts) contains all the
   streak / never-miss-twice / ramp / PR math as pure functions. No DOM, no storage, no
   network in there — ever.
2. **Engine changes ship with tests.** [`tests/engine.test.ts`](tests/engine.test.ts)
   exists because the streak math must never silently break. If your PR changes when a
   streak counts or breaks, there should be a test proving the new behavior.
3. **No new runtime dependencies without a conversation.** Charts are hand-rolled SVG
   and state is a custom store for a reason. Open an issue first if a library seems
   truly necessary.
4. **Offline-first always.** Everything must work with zero env vars and no network.
   Supabase sync is a bonus layer, not a requirement.
5. **Never let empty data destroy real data.** The sync guards exist because "opened the
   app on a new phone" must never equal "deleted my history". Any change to the sync
   path has to preserve this.

## Getting set up

```bash
git clone https://github.com/kotasuryanirupam/discipline-os.git
cd discipline-os
npm install
npm run dev          # → http://localhost:3000
```

No `.env.local` needed for local development — the app runs fully local.

## How I like PRs

1. **Open an issue first** unless it's a typo-level fix. Screenshots help a lot for UI.
2. Branch from `master` with a short name: `fix/streak-gap-day`, `docs/ramp-weeks`.
3. Commits follow [Conventional Commits](https://www.conventionalcommits.org/) — e.g.
   `fix(engine): count MVD-only days toward best streak`.
4. Make these pass before pushing (CI runs exactly this):
   ```bash
   npm run lint     # eslint, zero warnings please
   npm test         # vitest
   npm run build    # includes the full typecheck
   ```
5. Fill out the PR template honestly — including the checkboxes you *didn't* tick.

I'm one person with a college schedule, so reviews may take a couple of days. It's not
you, it's my timetable. 🙂

## Reporting bugs well

The best bug reports I've gotten included three things:
- **The exact date and weekday** — schedules and the gym split differ per weekday, so
  "it broke Tuesday" is often the whole clue.
- What the app showed vs. what actually happened.
- A screenshot (installed-as-PWA vs. browser tab matters too).

## Feature ideas

Same deal: tell me the **problem** first, then why existing features don't cover it, then
the smallest version that would solve it. "Add settings" pitches will get a friendly
no; "the warning banner saved me but X" pitches are gold.

## License

By contributing you agree that your contributions ship under the [MIT License](LICENSE).
