-- My 12-Week Transformation — initial schema
-- Every user-owned row carries user_id; RLS (next migration) enforces isolation.
-- Numeric fields use NUMERIC (not INT) so legacy values such as 30.5 minutes are never truncated.

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_valid_timezone(tz text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  perform now() at time zone tz;
  return true;
exception when others then
  return false;
end;
$$;

-- Maintains updated_at and, where present, an optimistic-concurrency version counter.
create or replace function public.touch_row()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  o     jsonb := to_jsonb(old);
  patch jsonb := jsonb_build_object('updated_at', now(), 'created_at', old.created_at);
begin
  -- identity and ownership can never change; version increments on every update
  if (o ? 'id' and to_jsonb(new)->'id' is distinct from o->'id')
     or (o ? 'user_id' and to_jsonb(new)->'user_id' is distinct from o->'user_id') then
    raise exception 'Row identity and ownership cannot be changed' using errcode = 'insufficient_privilege';
  end if;
  if o ? 'version' then patch := patch || jsonb_build_object('version', (o->>'version')::int + 1); end if;
  new := jsonb_populate_record(new, patch);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text check (char_length(display_name) <= 100),
  timezone       text not null default 'America/Toronto' check (public.is_valid_timezone(timezone)),
  weight_unit    text not null default 'kg' check (weight_unit in ('kg')),
  length_unit    text not null default 'cm' check (length_unit in ('cm')),
  last_export_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Profile row is created automatically when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Programs (one 84-day cycle = one program; future cycles are new rows)
-- ---------------------------------------------------------------------------

create table public.programs (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name                   text not null check (char_length(name) between 1 and 100),
  start_date             date not null,
  end_date               date not null,
  timezone               text not null default 'America/Toronto' check (public.is_valid_timezone(timezone)),
  starting_weight_kg     numeric(5,2) check (starting_weight_kg between 20 and 300),
  goal_weight_kg         numeric(5,2) check (goal_weight_kg between 20 and 300),
  protein_guide_g        numeric(6,1) check (protein_guide_g between 0 and 1000),
  fibre_guide_g          numeric(6,1) check (fibre_guide_g between 0 and 300),
  writing_intention_min  numeric(6,1) not null default 60 check (writing_intention_min between 0 and 1440),
  default_fast_start     time not null default '18:00',
  default_first_calorie  time not null default '10:00',
  status                 text not null default 'active' check (status in ('planned','active','completed','archived')),
  version                integer not null default 1,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint programs_dates_valid check (end_date >= start_date and end_date - start_date <= 365),
  constraint programs_id_user_unique unique (id, user_id)
);

create unique index programs_one_active_per_user on public.programs (user_id) where status = 'active';

-- ---------------------------------------------------------------------------
-- Habit catalog (global, read-only to users) and per-program habit sets
-- ---------------------------------------------------------------------------

create table public.habit_definitions (
  id                   text primary key check (id ~ '^[a-z]+\.[a-z0-9_]+$'),
  pillar               text not null check (pillar in ('spiritual','physical','mental','care','growth')),
  label                text not null check (char_length(label) between 1 and 120),
  description          text,
  default_sort         integer not null,
  legacy_index         integer unique check (legacy_index between 0 and 21),  -- position in the old app's habits array
  is_optional_default  boolean not null default false,
  created_at           timestamptz not null default now()
);

create table public.program_habits (
  program_id     uuid not null,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id       text not null references public.habit_definitions (id),
  sort_order     integer not null,
  is_optional    boolean not null default false,
  label_override text check (char_length(label_override) between 1 and 120),
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (program_id, habit_id),
  foreign key (program_id, user_id) references public.programs (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Daily entries (one per user/program/date). No weight or waist here — by design.
-- fast_start_time = time of last calories on the PREVIOUS evening;
-- first_calorie_time = time of first calories on entry_date.
-- ---------------------------------------------------------------------------

create table public.daily_entries (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id          uuid not null,
  entry_date          date not null,
  energy              text check (energy in ('excellent','good','okay','low')),
  mood                text check (mood in ('great','good','neutral','challenging')),
  fast_start_time     time,
  first_calorie_time  time,
  coffee_type         text check (coffee_type in ('black','milk_cream','sugar_calories','other')),
  calories_kcal       numeric(7,1) check (calories_kcal between 0 and 20000),
  protein_g           numeric(6,1) check (protein_g between 0 and 1000),
  fibre_g             numeric(6,1) check (fibre_g between 0 and 300),
  water_l             numeric(5,2) check (water_l between 0 and 20),
  workout_minutes     numeric(6,1) check (workout_minutes between 0 and 1440),
  workout_type        text check (workout_type in ('strength','cardio','strength_cardio','mobility_recovery','rest')),
  first_walk_minutes  numeric(6,1) check (first_walk_minutes between 0 and 1440),
  second_walk_minutes numeric(6,1) check (second_walk_minutes between 0 and 1440),
  writing_minutes     numeric(6,1) check (writing_minutes between 0 and 1440),
  words_written       numeric(8,0) check (words_written between 0 and 1000000),
  writing_notes       text check (char_length(writing_notes) <= 10000),
  mindfulness_minutes numeric(6,1) check (mindfulness_minutes between 0 and 1440),
  gratitude           text check (char_length(gratitude) <= 5000),
  journal             text check (char_length(journal) <= 50000),
  general_notes       text check (char_length(general_notes) <= 20000),
  felt_unwell         boolean,
  version             integer not null default 1,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint daily_entries_one_per_day unique (user_id, program_id, entry_date),
  foreign key (program_id, user_id) references public.programs (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Habit completions — stable habit IDs, never array positions.
-- No row = not recorded. Requires the day's daily_entries row to exist.
-- ---------------------------------------------------------------------------

create table public.habit_completions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id  uuid not null,
  entry_date  date not null,
  habit_id    text not null,
  status      text not null check (status in ('completed','not_completed','not_applicable')),
  note        text check (char_length(note) <= 1000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint habit_completions_unique unique (user_id, program_id, entry_date, habit_id),
  foreign key (program_id, user_id) references public.programs (id, user_id) on delete cascade,
  foreign key (program_id, habit_id) references public.program_habits (program_id, habit_id) on delete cascade,
  foreign key (user_id, program_id, entry_date)
    references public.daily_entries (user_id, program_id, entry_date) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Weekly measurements — the ONLY place weight and waist are stored.
-- ---------------------------------------------------------------------------

create table public.weekly_measurements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id       uuid not null,
  measurement_date date not null,
  weight_kg        numeric(5,2) check (weight_kg between 20 and 300),
  waist_cm         numeric(5,1) check (waist_cm between 30 and 250),
  notes            text check (char_length(notes) <= 2000),
  source           text not null default 'manual' check (source in ('manual','import_legacy_daily','import_legacy','import_review')),
  version          integer not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint weekly_measurements_has_value check (weight_kg is not null or waist_cm is not null),
  foreign key (program_id, user_id) references public.programs (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- 21-day chapter reviews
-- ---------------------------------------------------------------------------

create table public.cycle_reviews (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id          uuid not null,
  cycle_number        integer not null check (cycle_number between 1 and 18),
  reflection          text check (char_length(reflection) <= 50000),
  what_worked         text check (char_length(what_worked) <= 20000),
  what_was_difficult  text check (char_length(what_was_difficult) <= 20000),
  adjustments         text check (char_length(adjustments) <= 20000),
  version             integer not null default 1,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint cycle_reviews_unique unique (user_id, program_id, cycle_number),
  foreign key (program_id, user_id) references public.programs (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Daily rhythm (editable, informational — never a checklist)
-- ---------------------------------------------------------------------------

create table public.default_rhythm_blocks (
  sort_order         integer primary key,
  time_label         text not null,
  title              text not null,
  details            text not null,
  is_prayer_relative boolean not null default false
);

create table public.daily_rhythm_blocks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sort_order         integer not null,
  time_label         text not null check (char_length(time_label) between 1 and 40),
  title              text not null check (char_length(title) between 1 and 120),
  details            text check (char_length(details) <= 3000),
  is_prayer_relative boolean not null default false,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Import and backup bookkeeping (metadata only — never private content)
-- ---------------------------------------------------------------------------

create table public.import_batches (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id        uuid not null,
  file_sha256       text not null check (file_sha256 ~ '^[0-9a-f]{64}$'),
  source_format     text not null check (source_format in ('legacy_v2','m12wt_v1')),
  conflict_strategy text not null check (conflict_strategy in ('skip','merge','replace')),
  counts            jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  foreign key (program_id, user_id) references public.programs (id, user_id) on delete cascade
);

create table public.backup_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_type  text not null check (event_type in ('export_json','export_legacy','export_csv','import','restore_test')),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Date validation: daily data must fall inside its program;
-- measurements may include a 14-day pre-program baseline window.
-- ---------------------------------------------------------------------------

create or replace function public.check_date_in_program()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p_start date;
  p_end   date;
  d       date;
  lead_days integer := 0;
begin
  select start_date, end_date into p_start, p_end
    from public.programs where id = new.program_id;
  if tg_table_name = 'weekly_measurements' then
    d := new.measurement_date;
    lead_days := 14;
  else
    d := new.entry_date;
  end if;
  if d < p_start - lead_days or d > p_end then
    raise exception 'Date % is outside this program (% to %)', d, p_start, p_end
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger daily_entries_date_check before insert or update on public.daily_entries
  for each row execute function public.check_date_in_program();
create trigger habit_completions_date_check before insert or update on public.habit_completions
  for each row execute function public.check_date_in_program();
create trigger weekly_measurements_date_check before insert or update on public.weekly_measurements
  for each row execute function public.check_date_in_program();

-- updated_at / version / immutable ownership
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_row();
create trigger programs_touch before update on public.programs for each row execute function public.touch_row();
create trigger program_habits_touch before update on public.program_habits for each row execute function public.touch_row();
create trigger daily_entries_touch before update on public.daily_entries for each row execute function public.touch_row();
create trigger habit_completions_touch before update on public.habit_completions for each row execute function public.touch_row();
create trigger weekly_measurements_touch before update on public.weekly_measurements for each row execute function public.touch_row();
create trigger cycle_reviews_touch before update on public.cycle_reviews for each row execute function public.touch_row();
create trigger daily_rhythm_blocks_touch before update on public.daily_rhythm_blocks for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index daily_entries_user_program_date on public.daily_entries (user_id, program_id, entry_date);
create index habit_completions_user_program_date on public.habit_completions (user_id, program_id, entry_date);
create index weekly_measurements_user_program_date on public.weekly_measurements (user_id, program_id, measurement_date);
create index program_habits_user on public.program_habits (user_id);
create index cycle_reviews_user on public.cycle_reviews (user_id);
create index daily_rhythm_blocks_user on public.daily_rhythm_blocks (user_id, sort_order);
create index import_batches_user on public.import_batches (user_id, created_at desc);
create index backup_events_user on public.backup_events (user_id, created_at desc);
