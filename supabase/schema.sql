-- ── Discipline OS · Supabase schema ─────────────────────────────────────────
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → RUN
-- Safe to run multiple times (idempotent).

-- Single-table JSONB sync (matches src/lib/store.tsx)
create table if not exists public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "own state read" on public.app_state;
drop policy if exists "own state write" on public.app_state;
create policy "own state read" on public.app_state
  for select using (auth.uid() = user_id);
create policy "own state write" on public.app_state
  for insert with check (auth.uid() = user_id);
create policy "own state update" on public.app_state
  for update using (auth.uid() = user_id);

-- Anonymous sign-in must be ON:
-- Dashboard → Authentication → Providers → Anonymous: ENABLE
