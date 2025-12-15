-- Mars Reserves Leaderboard Schema
-- Run this in your Supabase SQL Editor

-- Runs table: stores verified game runs
create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  score integer not null,
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

-- Enable Row Level Security
alter table runs enable row level security;

-- Policy: Anyone can read runs (public leaderboard)
create policy "Runs are publicly readable"
  on runs for select
  using (true);

-- Policy: Only authenticated users can insert their own runs
-- (In practice, inserts come from server-side verification)
create policy "Server can insert runs"
  on runs for insert
  with check (true);

-- Optional: Create a view for the leaderboard
create or replace view leaderboard as
select 
  wallet,
  score,
  ending_id,
  action_count,
  run_hash,
  on_chain_tx,
  created_at,
  row_number() over (order by score desc) as rank
from runs
order by score desc
limit 100;

-- Function to get personal best for a wallet
create or replace function get_personal_best(wallet_address text)
returns table (
  score integer,
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
  from ranked
  where wallet = wallet_address
  order by score desc
  limit 1;
$$;
