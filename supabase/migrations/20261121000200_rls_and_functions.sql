-- Row Level Security: every user-owned table is visible and writable only by its owner.
-- The anon role gets nothing. The app never uses the service-role key.

-- ---------------------------------------------------------------------------
-- Lock down defaults, then grant only what authenticated users need
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Owner-scoped tables: full CRUD for the owner, enforced by RLS below
do $$
declare t text;
begin
  foreach t in array array[
    'programs','program_habits','daily_entries','habit_completions',
    'weekly_measurements','cycle_reviews','daily_rhythm_blocks'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format($p$create policy %I on public.%I for select to authenticated
                     using ((select auth.uid()) = user_id)$p$, t || '_select_own', t);
    execute format($p$create policy %I on public.%I for insert to authenticated
                     with check ((select auth.uid()) = user_id)$p$, t || '_insert_own', t);
    execute format($p$create policy %I on public.%I for update to authenticated
                     using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)$p$,
                   t || '_update_own', t);
    execute format($p$create policy %I on public.%I for delete to authenticated
                     using ((select auth.uid()) = user_id)$p$, t || '_delete_own', t);
  end loop;
end $$;

-- Profiles: keyed by id; created by trigger, so no insert/delete for users
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
grant select, update (display_name, timezone, last_export_at) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Append-only logs: users can read and add their own, never edit
do $$
declare t text;
begin
  foreach t in array array['import_batches','backup_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('grant select, insert on public.%I to authenticated', t);
    execute format($p$create policy %I on public.%I for select to authenticated
                     using ((select auth.uid()) = user_id)$p$, t || '_select_own', t);
    execute format($p$create policy %I on public.%I for insert to authenticated
                     with check ((select auth.uid()) = user_id)$p$, t || '_insert_own', t);
  end loop;
end $$;

-- Global read-only catalogs
do $$
declare t text;
begin
  foreach t in array array['habit_definitions','default_rhythm_blocks'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format($p$create policy %I on public.%I for select to authenticated using (true)$p$,
                   t || '_read', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RPC functions (security invoker: they run with the caller's rights, so RLS applies)
-- ---------------------------------------------------------------------------

-- Creates a program and attaches the full habit catalog in its default order.
create or replace function public.create_program(
  p_name text,
  p_start_date date,
  p_end_date date,
  p_timezone text default 'America/Toronto',
  p_starting_weight_kg numeric default 71,
  p_goal_weight_kg numeric default 59,
  p_protein_guide_g numeric default 105,
  p_fibre_guide_g numeric default 32,
  p_status text default 'active'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = 'insufficient_privilege';
  end if;

  insert into public.programs (name, start_date, end_date, timezone, starting_weight_kg,
                               goal_weight_kg, protein_guide_g, fibre_guide_g, status)
  values (p_name, p_start_date, p_end_date, p_timezone, p_starting_weight_kg,
          p_goal_weight_kg, p_protein_guide_g, p_fibre_guide_g, p_status)
  returning id into new_id;

  insert into public.program_habits (program_id, habit_id, sort_order, is_optional)
  select new_id, h.id, h.default_sort, h.is_optional_default
    from public.habit_definitions h;

  return new_id;
end;
$$;

-- Copies the default daily rhythm into the caller's editable rhythm (only if empty).
create or replace function public.seed_my_rhythm()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n integer;
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from public.daily_rhythm_blocks where user_id = auth.uid()) then
    return 0;
  end if;
  insert into public.daily_rhythm_blocks (sort_order, time_label, title, details, is_prayer_relative)
  select sort_order, time_label, title, details, is_prayer_relative
    from public.default_rhythm_blocks;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Permanently deletes the caller's account and, via ON DELETE CASCADE, all their data.
-- SECURITY DEFINER is required to touch auth.users; it can only ever delete auth.uid().
create or replace function public.delete_my_account(p_confirm text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = 'insufficient_privilege';
  end if;
  if p_confirm is distinct from 'DELETE MY ACCOUNT' then
    raise exception 'Confirmation phrase did not match' using errcode = 'check_violation';
  end if;
  delete from auth.users where id = uid;
end;
$$;

-- Functions get EXECUTE for PUBLIC by default (a global default that per-schema
-- default privileges cannot remove), so revoke explicitly, then grant precisely.
revoke all on all functions in schema public from public, anon, authenticated;

grant execute on function public.create_program(text, date, date, text, numeric, numeric, numeric, numeric, text) to authenticated;
grant execute on function public.seed_my_rhythm() to authenticated;
grant execute on function public.delete_my_account(text) to authenticated;
-- is_valid_timezone runs inside CHECK constraints with the caller's rights, so it needs EXECUTE.
grant execute on function public.is_valid_timezone(text) to authenticated;
