-- Caravan — online leaderboard (simple version)
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again: it drops and recreates the objects below (and DELETES all scores).
-- Then run migrations/002_daily.sql. For an existing database, run only the migrations.

drop view if exists public.leaderboard;
drop table if exists public.scores;

create table public.scores (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  client_id  uuid        not null,                -- random id stored in the player's browser
  player     text        not null check (char_length(player) between 2 and 20
                                         and player ~ '^[[:alnum:] _.-]+$'),
  faction    text        not null check (faction in ('normalia', 'fang-mo', 'lexquise', 'mahaji', 'tocaccialli', 'bajaar', 'doba-lao', 'huangoz', 'port-willam', 'moonin', 'cornecopea', 'eduming', 'octoyashi', 'kifuai', 'skjollird', 'petrinov', 'jilliqo', 'gayawaku', 'vilparino', 'sanctifan', 'mehaz', 'ipartus')),
  mode       text        not null check (mode in ('classical', 'traveler')),
  score      integer     not null check (score between 0 and 1000000),
  days       smallint    not null check (days between 10 and 30),
  seed       integer     not null,
  unique (client_id, seed)                          -- one submission per game
);

create index scores_board_idx on public.scores (faction, mode, score desc);

-- Best score of each player, per faction and mode.
create view public.leaderboard with (security_invoker = true) as
  select distinct on (faction, mode, client_id)
         client_id, player, faction, mode, score, created_at
  from public.scores
  order by faction, mode, client_id, score desc, created_at;

-- Anti-spam: 30 s between two submissions, 50 per day and per player.
create or replace function public.scores_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.scores
             where client_id = new.client_id and created_at > now() - interval '30 seconds') then
    raise exception 'Please wait a little before submitting again' using errcode = 'P0001';
  end if;
  if (select count(*) from public.scores
      where client_id = new.client_id and created_at > now() - interval '1 day') >= 50 then
    raise exception 'Daily submission limit reached' using errcode = 'P0001';
  end if;
  new.created_at := now();
  return new;
end $$;

create trigger scores_guard before insert on public.scores
  for each row execute function public.scores_guard();

-- Row Level Security: anyone can read and add scores; nobody can edit or delete.
alter table public.scores enable row level security;
create policy "scores are public" on public.scores for select to anon, authenticated using (true);
create policy "anyone can submit" on public.scores for insert to anon, authenticated with check (true);

grant select, insert on public.scores to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
