-- ============================================================
-- Dubicars Finance Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Drop existing table if re-running
drop table if exists prospects;

-- Create the prospects table
create table prospects (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  stage            text not null default 'Prospecting',
  contacts         jsonb not null default '[]'::jsonb,
  notes            text not null default '',
  rejection_reason text not null default '',
  list_status      text not null default '',   -- 'new' | 'visited' | ''
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update the updated_at timestamp on any change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prospects_updated_at
  before update on prospects
  for each row execute procedure update_updated_at();

-- Enable Row Level Security
alter table prospects enable row level security;

-- Allow anyone with the anon key to read and write
-- (suitable for internal-team shared access; tighten this if you add auth later)
create policy "Public read"  on prospects for select using (true);
create policy "Public insert" on prospects for insert with check (true);
create policy "Public update" on prospects for update using (true);
create policy "Public delete" on prospects for delete using (true);

-- Confirm
select 'Schema created successfully ✓' as status;
