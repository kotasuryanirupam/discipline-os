# Security Policy — Discipline OS

## Supported versions

| Version | Supported |
|---------|-----------|
| `master` (latest commit) | ✅ |
| Older commits / tags | ❌ |

Discipline OS is a fast-moving single-maintainer project; only the latest `master` is supported.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Email **kotasuryanirupam@gmail.com** with:

1. A clear description of the issue and its impact
2. Step-by-step reproduction (or a PoC)
3. Affected area: client app, service worker, Supabase schema/policies, or build pipeline

You'll get an acknowledgment within **72 hours**. If the report is accepted, a fix will be
shipped to `master` and credited (unless you prefer anonymity).

## Scope notes (what's in / out)

**In scope**
- The PWA served from the deployed Vercel URL (`discipline-os-blond.vercel.app`)
- [`supabase/schema.sql`](supabase/schema.sql) — especially Row Level Security policies
- The sync path in `src/lib/store.tsx` (data-integrity issues like cross-user writes,
  history-wipe vectors)
- Service worker cache poisoning / offline-shell injection

**Out of scope**
- Client-side "hacks" against one's own device (XSS via devtools on your own data,
  tampered localStorage) — localStorage is untrusted by design; the cloud-sync guards
  treat device state as fallible
- Rate limiting / spam of magic-link emails (Supabase platform responsibility)
- Vulnerabilities in dependencies should additionally be reported upstream; this repo
  tracks Dependabot alerts

## Design context for reviewers

- All app data lives in **one JSONB row per user**, protected by RLS
  (`auth.uid() = user_id`) — see schema.sql
- The anon key is public by design; security rests entirely on RLS + auth
- Sync uses **last-write-wins with empty-write protection**: an empty payload (fresh
  device or wiped table) can never overwrite non-empty counterpart state

Thanks for helping keep Discipline OS safe. 🔒
