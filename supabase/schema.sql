-- Mars Reserves Schema v1.1
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE: Commander identity
-- ============================================
create table if not exists profiles (
  privy_user_id text primary key,
  wallet text unique,
  commander_name text not null default 'Unknown Commander',
  missions_count integer default 0,
  best_score bigint default 0,
  last_ending_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for wallet lookups
create index if not exists profiles_wallet_idx on profiles(wallet);

-- Enable RLS
alter table profiles enable row level security;

-- Public read for Archive display
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

-- Server can insert/update profiles
create policy "Server can manage profiles"
  on profiles for all
  using (true)
  with check (true);

-- ============================================
-- RUNS TABLE: Verified game runs
-- ============================================
create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  privy_user_id text references profiles(privy_user_id),
  score bigint not null,
  seed integer not null,
  ending_id text not null,
  action_count integer,
  run_hash text not null unique,
  on_chain_tx text,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists runs_score_idx on runs(score desc);
create index if not exists runs_wallet_idx on runs(wallet);
create index if not exists runs_created_at_idx on runs(created_at desc);
create index if not exists runs_privy_user_idx on runs(privy_user_id);

-- Enable Row Level Security
alter table runs enable row level security;

-- Policy: Anyone can read runs (public archive)
create policy "Runs are publicly readable"
  on runs for select
  using (true);

-- Policy: Server can insert runs
create policy "Server can insert runs"
  on runs for insert
  with check (true);

-- ============================================
-- VIEWS: Archive and Leaderboard
-- ============================================

-- Archive view: Recent missions with commander names
create or replace view archive as
select 
  r.id,
  r.wallet,
  coalesce(p.commander_name, 'Unknown Commander') as commander_name,
  r.score,
  r.ending_id,
  r.action_count,
  r.run_hash,
  r.on_chain_tx,
  r.created_at
from runs r
left join profiles p on r.privy_user_id = p.privy_user_id
order by r.created_at desc
limit 50;

-- Leaderboard view: Top scores
create or replace view leaderboard as
select 
  r.wallet,
  coalesce(p.commander_name, 'Unknown Commander') as commander_name,
  r.score,
  r.ending_id,
  r.action_count,
  r.run_hash,
  r.on_chain_tx,
  r.created_at,
  row_number() over (order by r.score desc) as rank
from runs r
left join profiles p on r.privy_user_id = p.privy_user_id
order by r.score desc
limit 100;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get personal best for a wallet
create or replace function get_personal_best(wallet_address text)
returns table (
  score bigint,
  ending_id text,
  created_at timestamptz,
  rank bigint
)
language sql
as $$
  with ranked as (
    select 
      r.score,
      r.ending_id,
      r.created_at,
      row_number() over (order by r.score desc) as rank
    from runs r
  )
  select score, ending_id, created_at, rank
  from ranked r
  inner join runs rr on r.score = rr.score and r.created_at = rr.created_at
  where rr.wallet = wallet_address
  order by score desc
  limit 1;
$$;

-- Get archive stats
create or replace function get_archive_stats()
returns table (
  total_missions bigint,
  total_commanders bigint,
  avg_score numeric
)
language sql
as $$
  select 
    count(*) as total_missions,
    count(distinct wallet) as total_commanders,
    round(avg(score), 0) as avg_score
  from runs;
$$;

