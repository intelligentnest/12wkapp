# My 12-Week Transformation — Stage 0: Architecture & Migration Plan

Status: **approved 2026-11-21** (see §9) · Written 2026-11-20 · No code written, no original files modified.
Sources reviewed in full: `CLAUDE.md`, `index.html` (reference app), `README-HANDOFF.txt`, `README-current-app.txt`.

---

## 1. What the current app does

A single-file, offline HTML/JS app (no framework, no server). All data lives in **one browser's `localStorage`** under key `healthJourney_20261121_v2`.

| Tab | Behaviour |
|---|---|
| Today | Date picker (limited to 2026-11-21 → 2027-02-12), energy/mood, chapter label, five-pillar cards, daily rhythm (static text), fasting-window calculator, book writing, nutrition, movement, wellbeing, 22 habit checkboxes grouped by pillar, notes, Save / "Clear form" |
| Weekly progress | Week 1–12 → days logged, habit %, averages (kcal, protein, fibre, workout, walks, writing min, words) |
| Weekly measurements | Date + weight kg + waist cm + notes; SVG weight chart (start line 71, dashed goal 59), waist chart, history with Edit |
| Monthly view | Nov 2026 – Feb 2027 (hard-coded), same summary block |
| Track record | All 84 dates; click to open in Today |
| 21-day reviews | Four chapters (Foundation, Consistency, Momentum, Strengthen & sustain): summary + "waist at review" + reflection |
| Goals & backup | Start weight, goal marker, protein guide, fibre guide; JSON export (`my-12-week-transformation-backup.json`) and import |

## 2. Existing data structure

```text
state = {
  entries:      { "YYYY-MM-DD": { habits: bool[22], fastStart, fastEnd, coffeeType, energy, mood,
                                  calories, protein, fibre, water, workoutMin, workoutType,
                                  walk1, walk2, writingMinutes, wordsWritten, writingNotes,
                                  mindfulnessMinutes, gratitude, journal, notes } },
  measurements: { "YYYY-MM-DD": { weight: number|"", waist: number|"", notes } },
  reviews:      { "1".."4": { waist: string, reflection: string } },
  targets:      { startWeight: 71, goalWeight: 59, targetProtein: 105, targetFibre: 32 }
}
```

- Blanks are stored as `""`; numeric fields become `Number` on save; text/select fields stay strings.
- Dates are local calendar strings (good — no UTC shift in storage).
- Habits are a **positional boolean array** (index = meaning).
- Startup migrations in the old app: (a) 11-element habit arrays → copied into indexes 4–14 (exactly the 11 Physical-health habits); other lengths padded/truncated at the end. (b) daily `weight`/`waist` → `measurements[date]` with note "Migrated from earlier daily entry". (c) goalWeight 60 → 59.

### Habit index → stable ID (frozen mapping for migration)

| # | Pillar | Label | Stable ID |
|---|---|---|---|
| 0 | Spiritual | Fajr prayer | `spiritual.fajr` |
| 1 | Spiritual | Dhuhr prayer + intentional pause | `spiritual.dhuhr_pause` |
| 2 | Spiritual | Family Maghrib prayer | `spiritual.family_maghrib` |
| 3 | Spiritual | Daily Quran reading | `spiritual.quran` |
| 4 | Physical | Black coffee and morning routine | `physical.black_coffee_routine` |
| 5 | Physical | Protein-rich first meal | `physical.protein_first_meal` |
| 6 | Physical | Balanced, satisfying lunch | `physical.balanced_lunch` |
| 7 | Physical | Balanced, nourishing dinner | `physical.balanced_dinner` |
| 8 | Physical | Protein goal supported by food choices | `physical.protein_goal` |
| 9 | Physical | Fibre-rich foods included | `physical.fibre_foods` |
| 10 | Physical | Morning workout or planned recovery | `physical.workout_or_recovery` |
| 11 | Physical | First walk or planned alternative | `physical.walk_1` |
| 12 | Physical | Second walk or planned recovery | `physical.walk_2` |
| 13 | Physical | Hydration and sleep routine | `physical.hydration_sleep` |
| 14 | Physical | Planned fasting window completed (if appropriate) | `physical.fasting_window` |
| 15 | Mental | Mindfulness / quiet pause | `mental.mindfulness` |
| 16 | Mental | Gratitude practice | `mental.gratitude` |
| 17 | Mental | Journaling / emotional check-in | `mental.journal` |
| 18 | Personal care | Morning glow-up / get ready | `care.morning_glowup` |
| 19 | Personal care | Evening skincare | `care.evening_skincare` |
| 20 | Intellectual | Book-writing session (aim: 60 minutes) | `growth.book_writing` |
| 21 | Intellectual | Workday shutdown routine completed | `growth.workday_shutdown` |

### 2a. Habit count: the app actually has 22, not 21
Verified by counting `habitGroups` in `index.html`: 4 + 11 + 3 + 2 + 2 = **22**. The app derives the array length from these groups, so live entries store **22 booleans**. The CLAUDE.md habit list also totals 22; only the "21" headline is off. For migration: a 21-element array (if one exists from an earlier version) would be padded at the end by the old app — correct only if Workday shutdown was the item added last. The importer will report every array length found in the real export before anything is written.

## 3. Bugs and inconsistencies found in the current app

Data-integrity relevant (the importer must handle these):
1. **Viewing a date creates an empty entry.** `get()` writes `{habits:[…false]}` for every date opened (including day 1 on every page load); the next save of anything persists them. "Days logged" is inflated and completion % is diluted by days that were only looked at.
2. **Legacy daily weight/waist can be silently discarded** if a measurement already exists for that date.
3. **Habit length assumption:** any non-11 array is padded/truncated at the end; an intermediate version with a different order would be mis-mapped silently.
4. **Import replaces everything** — no merge, no preview, minimal validation; targets from the file overwrite defaults wholesale.
5. **Saving goals with an empty field stores 0** (e.g. goal weight 0).
6. **Measurements can't be deleted**; editing and changing the date leaves the old record behind.

Calculation / display:
7. `avg()` drops genuine zeros (a 0-minute rest-day workout counts as blank).
8. Completion denominator is always `days × habits` — no "not applicable".
9. Weekly/monthly summaries still show **"Avg weight"** and **"Latest waist"** from daily entries — always "—" (stale code, contrary to the brief).
10. Track record shows blanks as `0m` and a default `18:00–10:00` fast window when none was recorded.
11. Fasting duration shows 16h 0m even when no times are entered.
12. `fastStart` on day D means "last calories the **previous** evening" (per the hint text) but is stored on day D — the new schema documents this explicitly.
13. Mixed save behaviour: habit ticks autosave; other fields need "Save this day" and are lost if you switch dates first. "Clear form" actually reverts to the saved version.
14. Weight chart spaces points by index, not date.
15. Track record's empty row has 11 cells vs 9 headers; "habits" vs "commitments" wording; dates/months hard-coded.

## 4. Proposed architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) | Brief default; server-side data access |
| Auth | Supabase Auth — email + password **plus** authenticator-app MFA; public sign-ups disabled once the owner account exists | Private single-owner app |
| Database | Supabase Postgres, RLS on every user table | Isolation enforced by the database |
| Data access | `@supabase/ssr` with the publishable/anon key only; writes via typed server actions + Zod validation; `security invoker` SQL functions for atomic operations (import) | No service-role key in the app, except one server-only path for account deletion |
| UI | Tailwind CSS + small in-house component set on Radix primitives | Calm, consistent, accessible |
| Charts | Recharts with a time-scaled x-axis, plus a hidden data table per chart for screen readers | Honest spacing, accessible |
| Dates | `DATE` / `TIME` columns; "today" computed in the program timezone (`America/Toronto`); never parse `"YYYY-MM-DD"` with `new Date()` | No UTC shifting |
| Hosting | **Vercel** (recommended) — first-party Next.js support | Netlify also viable |
| Code | Private GitHub repo; CI: lint, typecheck, unit tests, RLS tests, build | |
| Tests | Vitest (logic + importer), local Supabase + two-user RLS tests, Playwright on phone + desktop viewports | |
| Observability | No third-party analytics; logs never include request bodies | Privacy |

Setup commands, package versions and env-var names get checked against current Next.js / Supabase / Vercel docs at the start of Stage 1.

### Save & sync model
- Server database is canonical. Today autosaves per section (debounced) with a visible status: *Saving… → Saved ✓ (synced 6:42 AM)* or *Not saved — retry*.
- Rows carry `updated_at` + `version`. Writes are conditional on the loaded version; if another device changed the row meanwhile, both values are shown and you choose — no silent overwrite.
- v1 is online-first: offline edits are held in memory with a clear "offline — not saved yet" banner and automatic retry. A persistent offline queue is a possible later addition.

## 5. Database schema (summary)

All user tables: `user_id uuid not null references auth.users on delete cascade`, `created_at`, `updated_at` (trigger), RLS enabled, `anon` revoked.

- **profiles** — `id` (= auth uid), `display_name`, `timezone` (`America/Toronto`), `weight_unit` (`kg`), `length_unit` (`cm`), `last_export_at`.
- **programs** — `name`, `start_date` 2026-11-21, `end_date` 2027-02-12, `timezone`, `starting_weight_kg` 71, `goal_weight_kg` 59, `protein_guide_g` 105, `fibre_guide_g` 32, `writing_intention_min` 60, `status`. Checks on dates and ranges; `unique (id, user_id)` for composite FKs.
- **Chapters** — derived from program dates (4 × 21 days), not stored by hand.
- **habit_definitions** — global, read-only catalog keyed by the stable IDs above (pillar, label, description, default order, optional flag).
- **program_habits** — habits used by a program with `sort_order`, `is_optional`, `active_from/active_to`, so labels/order can change without touching history.
- **daily_entries** — the brief's fields; `fast_start_time` documented as *previous evening's last calories*; enums as checked text; numeric range checks; `unique (user_id, program_id, entry_date)`; date must fall within the program; composite FK `(program_id, user_id) → programs(id, user_id)` blocks pointing at someone else's program.
- **habit_completions** — `status` ∈ `completed | not_completed | not_applicable`, optional note; `unique (user_id, program_id, entry_date, habit_id)`. No row = not recorded.
- **weekly_measurements** — `measurement_date`, nullable `weight_kg` / `waist_cm` (at least one required), `notes`, `source` (`manual | import_legacy_daily | import_review`). No unique date constraint (corrections allowed); UI warns on same-week duplicates.
- **cycle_reviews** — `cycle_number` 1–4, `reflection` (legacy text preserved), `what_worked`, `what_was_difficult`, `adjustments`; unique per program + cycle.
- **daily_rhythm_blocks** — editable schedule, seeded verbatim from the brief.
- **import_batches** — file SHA-256, counts, conflict strategy, report (counts/IDs only, never private content).
- **backup_events** — export/restore timestamps; metadata only.

### RLS pattern (every user table)
```sql
alter table daily_entries enable row level security;
revoke all on daily_entries from anon;
create policy de_select on daily_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy de_insert on daily_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy de_update on daily_entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy de_delete on daily_entries for delete to authenticated using ((select auth.uid()) = user_id);
```
Automated tests sign in as User A and User B and assert B cannot read, insert, update or delete A's rows in any table, including by guessing IDs.

## 6. Migration plan (no data loss)

**Principle:** the original `index.html`, its `localStorage`, and your JSON export are never modified. The import is additive, previewed, atomic and repeatable.

1. **Back up first.** Export from the old app; keep that file untouched, with a second copy elsewhere.
2. **Import wizard (Settings → Data → Import):**
   - Parsed and validated **in the browser** first; nothing uploaded yet.
   - Normalisation mirrors the old app exactly: 11-item arrays → indexes 4–14; other lengths reported; daily `weight`/`waist` → measurements **even when one already exists on that date** (flagged for review); `""` → `NULL`; times validated.
   - "Viewed-only" entries (no values, no ticks) listed separately.
   - Preview: entry/measurement/review counts, date range, targets, habit-array lengths, out-of-range dates, anything unparseable (shown, never silently dropped).
3. **Conflict choice** if the server already has data: *Skip existing* / *Merge (fill blanks only)* / *Replace*, with a per-date diff. Default: Skip.
4. **Automatic safety export** of current server data before any write.
5. **Atomic write** in one database transaction under your own permissions (RLS applies). Idempotent by natural keys; re-importing the same file changes nothing, and the app recognises a previously imported file by its hash.
6. **Reconciliation report:** reads back what was stored, converts it to the legacy shape, and diffs it against the source field by field. Target: **0 differences** (except intentionally excluded viewed-only days). Downloadable.
7. **Exports:** new versioned export (all tables) **plus** a legacy-format export the original `index.html` can still import — a permanent fallback.

Fixtures tested before your real file: empty state, partial entries, duplicate dates, 11/21/22-item arrays, missing measurements, legacy daily weight/waist (with/without an existing measurement), reviews with waist, malformed JSON, out-of-range dates.

## 7. Backup & recovery

Shown separately in-app:
- **Code** — GitHub.
- **Production database** — Supabase-managed backups; retention, point-in-time recovery and free-project pausing will be confirmed against current Supabase docs before anything is claimed. Optional independent nightly `pg_dump` to private encrypted storage.
- **Your personal export** — JSON/CSV any time; "Last export" shown, with a gentle nudge after 7 days.
- **Browser** — nothing sensitive persisted beyond the sign-in session.

A written recovery runbook and a **tested restore into a scratch project** happen before launch.

## 8. Phased plan (data safety first)

| Stage | Contents | Exit criteria |
|---|---|---|
| 0 | This plan | Decisions approved |
| 1 Foundation | Scaffold, CI, Supabase schema + migrations, RLS, seeds (habits, rhythm, program), auth + MFA, authenticated shell | Lint/types/build green; two-user RLS tests pass |
| 2 Data engine | Import/normalise/export library + fixture tests; export; import wizard | All fixtures pass; round-trip diff = 0 |
| 3 Today | Check-in, habits with N/A, rhythm, fasting (with safety copy), autosave + sync status, conflict handling | Two-device save test passes |
| 4 Measurements | Weekly entry, time-scaled charts with start + goal lines, edit/delete with confirmation | Sparse/partial cases verified |
| 5 Summaries | Weekly, monthly, history, 21-day reviews, goals & settings | Blank ≠ zero verified by tests |
| 6 Launch | Real migration, backup config + restore test, accessibility & security review, responsive QA, privacy page, user guide, deploy | Every CLAUDE.md §18 criterion demonstrated |

Import/export moves to Stage 2 (the brief had it at Stage 4) so the real data path is proven before UI polish.

## 9. Decisions (approved 2026-11-21)

| # | Decision | Outcome |
|---|---|---|
| 1 | Program dates | **Moved: Sun 2026-11-22 → Sat 2027-02-13** (84 days). Chapters: Nov 22–Dec 12, Dec 13–Jan 2, Jan 3–23, Jan 24–Feb 13. Until launch, log in the old app (one device) from Nov 22 and export every few days. Entries are keyed by date, so no remapping is needed; the old app's own week/chapter summaries will be one day off, which doesn't affect stored data. Note the old app can't record Feb 13 — irrelevant once the new app is live. |
| 2 | Habit count | **22 habits** confirmed |
| 3 | Hosting | **Vercel** |
| 4 | Database plan | **Supabase Free** + **independent automatic nightly backup** (GitHub Action → encrypted file). Free plan limits to be documented. |
| 5 | Sign-in | **Email magic link** (sign-ups disabled after owner account exists) |
| 6 | Save model | **Autosave** with visible sync status |
| 7 | Unticked habits on logged days | Import as `not_completed` |
| 8 | Viewed-only empty days | **Excluded** from import (listed in report) |
| 9 | Waist at review | **Option A**: becomes a weekly measurement dated the chapter's last day (`source = import_review`), unless a waist measurement already exists in that chapter's final week |
| 10 | Unwell flag | **Add** optional "felt dizzy / weak / unwell" field → gentle wellbeing note |
| 11 | Code hosting | Mahsa will create a GitHub account/repo |
