-- Caravan — daily challenge (run once, after schema.sql). Keeps existing scores.
-- Supabase: Dashboard → SQL Editor → New query → paste → Run.

alter table public.scores add column if not exists daily date;

-- One daily score per player and per day.
create unique index if not exists scores_one_daily_per_player
  on public.scores (client_id, daily) where daily is not null;

-- Faction leaderboards ignore daily games.
create or replace view public.leaderboard with (security_invoker = true) as
  select distinct on (faction, mode, client_id)
         client_id, player, faction, mode, score, created_at
  from public.scores
  where daily is null
  order by faction, mode, client_id, score desc, created_at;

-- Daily leaderboard (one row per player per day thanks to the unique index).
create or replace view public.daily_leaderboard with (security_invoker = true) as
  select client_id, player, faction, mode, score, created_at, daily
  from public.scores
  where daily is not null;

-- Only today's challenge can be submitted (± 1 day for time zones).
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
  if new.daily is not null and abs(new.daily - (now() at time zone 'utc')::date) > 1 then
    raise exception 'This daily challenge is over' using errcode = 'P0001';
  end if;
  new.created_at := now();
  return new;
end $$;

grant select on public.daily_leaderboard to anon, authenticated;
