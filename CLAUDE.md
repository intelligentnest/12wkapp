# CLAUDE.md — My 12-Week Transformation

## 1. Project purpose

Build a private, polished, responsive personal transformation web application called **My 12-Week Transformation**.

This project began as a standalone HTML tracker. The next version should become a robust full-stack application that the owner can use on laptop and phone, with secure authentication, a cloud database, cross-device synchronization, reliable backups, and a maintainable codebase.

The initial use is personal. Architect it cleanly enough that it could later become a multi-user product, but do not add productization complexity, billing, public profiles, social features, or multi-tenant admin functionality unless explicitly requested.

The app supports five connected life pillars:
1. Spiritual connection
2. Physical health
3. Mental & emotional wellbeing
4. Personal care & confidence
5. Intellectual growth

The philosophy is **progress without perfection**. Avoid guilt-based streaks, punitive scoring, rigid quotas, or language that implies failure when a day is missed. Make it calm, encouraging, practical, and respectful of family life, faith, recovery, and changing energy.

## 2. Existing project files

The handoff package contains:
- `index.html` — the existing working single-file app. Inspect it before implementing anything.
- `README-current-app.txt` — notes about the current app and its limitations.
- `CLAUDE.md` — this complete product and implementation brief.

Treat the existing HTML as the functional reference for current fields, calculations, labels, habits, weekly measurement behavior, charts, reviews, and data migration. Do not discard existing functionality casually. Improve the design and architecture while preserving user intent and data.

## 3. Important project dates and 84-day structure

Current planned transformation window:
- Start: **November 21, 2026**
- End: **February 12, 2027**
- Duration: **84 days**
- Structure: **12 weeks**, organized into **four 21-day chapters**.

Four chapters:
1. Days 1–21: Foundation
2. Days 22–42: Consistency
3. Days 43–63: Momentum
4. Days 64–84: Strengthen & sustain

The app should support the original 84-day cycle as a configurable program instance. Do not hard-code all future cycles to these dates. Preserve this first cycle exactly for the migration and initial launch. Allow future cycles to have configurable start/end dates and goals.

## 4. User-specific requirements that materially shape the product

- The owner is based in Oakville, Ontario, Canada. Use `America/Toronto` as the default timezone, but make timezone handling robust and configurable.
- Preferred units: kilograms, centimetres, litres, minutes, grams.
- Use Canadian context where relevant, but do not over-localize the app.
- The owner wants access from both laptop and mobile.
- The owner wants an elegant, minimal, calming, premium interface with warm, natural, wellness-oriented visual language. It should feel mature and clear, not childish or overly feminine.
- The app should be private by default.
- The user wants the data to persist for the full 84 days and beyond, with no dependence on one browser's local storage.
- The user has a separate external cloud workflow for research, knowledge management, and content development. **Do not rebuild that Daily Knowledge & Content Engine inside this app.** The app may retain a short reminder in the daily schedule that the user's external workflow exists, but do not create duplicate content/research automation, source ingestion, cloud-drive orchestration, or podcast generation features.
- The user is writing a book and wants a protected 60-minute daily writing block with optional word count, minutes, and notes.
- The user values spiritual practice and family presence. Prayer times shift, so prayer references must be presented as routine intentions, not fixed universal clock times.
- Optional activities and recovery days must be represented honestly. Do not require two walks or a workout every day.
- This app is a personal reflection and habit-tracking tool, not a medical device or clinical decision-support system.

## 5. Daily rhythm — preserve the latest schedule

Display this schedule in the app as an editable, informational daily rhythm. Do not force the user to check off every schedule block or treat it as a rigid timetable.

| Time | Block | Details |
|---|---|---|
| 4:00–5:00 AM | Spiritual foundation + workday startup | Fajr, Quran, personal connection with Allah. Existing external Claude Co-work workflow prepares a daily research brief using the user's professional domain and sources such as Gartner and PwC; review/download from Google Drive and use NotebookLM to create a debate-style podcast. Black coffee near the end of this hour. Do not implement this external workflow inside this app. |
| 5:00–6:00 AM | Physical routine + morning glow-up | Workout begins at 5:00 sharp when appropriate. Listen to the NotebookLM podcast during exercise. At the end: glow-up, skincare, shower, get ready. Adapt for recovery and energy. |
| 6:00–7:00 AM | Book writing | Protected 60-minute writing block. Record minutes, optional word count, and notes/section. |
| 7:00–8:45 AM | Intentional mothering + school drop-offs | Be present with children and complete morning family routine. |
| 8:45–9:30 AM | Morning debrief + learning walk | Walk and discuss the daily research brief with Claude, challenge understanding, ask questions, develop three content ideas, review learnings, and decide the day's priorities. This is part of the external workflow; do not create a duplicate content engine in the app. |
| 9:30 AM–12:30 PM | Focused work | Focused execution. |
| 12:30–1:00 PM | Dhuhr/Zohar + spiritual/mental reset | Prayer, intentional pause, step away from work, reconnect. |
| 1:00–2:15 PM | Focused work | Continue priority work and close key tasks. |
| 2:30–3:00 PM | Workday shutdown | Review completed work, close/capture open loops, record follow-ups, prepare tomorrow's priorities, deliberately close workday. |
| Before 6:00 PM | Nourishment + family | Dinner and finish caloric intake by the planned fasting start, if following the optional fasting plan. |
| Maghrib | Family connection | Family Maghrib prayer. Use actual local prayer times, not a fixed time. |
| Before bed | Evening reset | Evening skincare, gratitude/reflection, prepare for tomorrow, protect sleep. |

Add a note: prayer times change through the year; use actual local prayer times. The schedule is a guide, not a rigid timetable.

## 6. Five pillars and daily habits

### Pillar 1 — Spiritual connection
Habits:
- Fajr prayer
- Dhuhr prayer + intentional pause
- Family Maghrib prayer
- Daily Quran reading

### Pillar 2 — Physical health
Habits:
- Black coffee and morning routine
- Protein-rich first meal
- Balanced, satisfying lunch
- Balanced, nourishing dinner
- Protein goal supported by food choices
- Fibre-rich foods included
- Morning workout or planned recovery
- First walk or planned alternative
- Second walk or planned recovery
- Hydration and sleep routine
- Planned fasting window completed (if appropriate)

### Pillar 3 — Mental & emotional wellbeing
Habits:
- Mindfulness / quiet pause
- Gratitude practice
- Journaling / emotional check-in

### Pillar 4 — Personal care & confidence
Habits:
- Morning glow-up / get ready
- Evening skincare

### Pillar 5 — Intellectual growth
Habits:
- Book-writing session (aim: 60 minutes)
- Workday shutdown routine completed

There are currently **21 habits**. Store habits by stable IDs, not array position or label text, so future label/order changes do not corrupt historical completion data. Support optional habits and planned recovery alternatives without treating rest as failure. Allow a habit to be marked not applicable for a day if appropriate.

## 7. Daily check-in fields in the current app

Preserve these current fields unless a better data model is proposed and documented:
- Date
- Energy: Excellent / Good / Okay / Low
- Mood: Great / Good / Neutral / Challenging
- Fasting start time (default 18:00)
- First-calorie time (default 10:00)
- Coffee type: Black / no calories; With milk or cream; With sugar or other calories; Other / not sure
- Calories (optional)
- Protein grams (optional)
- Fibre grams (optional)
- Water litres (optional)
- Morning workout minutes (optional)
- Morning workout type: Strength; Cardio; Strength + cardio; Mobility / recovery; Rest day
- First walk minutes (optional)
- Second walk minutes (optional)
- Book-writing minutes (optional; intention 60)
- Words written (optional)
- Book-writing notes / chapter / section
- Mindfulness / quiet-pause minutes (optional)
- Gratitude entry
- Journal / emotional check-in
- General daily notes
- 21 habit completion states

Important: **Do not put weight or waist measurements in the daily check-in.** They belong exclusively in the Weekly Measurements section.

## 8. Fasting and nutrition context

The user's current optional fasting plan:
- Finish calories by 6:00 PM.
- First calories around 10:00 AM.
- This creates a planned 16-hour fasting window and an 8-hour eating window.
- Black coffee without milk, cream, sugar, or other calories around 4:55–5:00 AM generally does not break a fast; caloric additions do.
- The app calculates fasting duration from the previous evening's last-calorie time to today's first-calorie time. Handle crossing midnight correctly.
- Fasting is optional. Include supportive safety language: if dizzy, weak, or unwell, stop the fast; fasting is not suitable for everyone and the user should follow clinician guidance.
- Do not reward longer fasting or encourage extending fasting windows.
- Calories, protein, and fibre are planning logs, not prescriptions. The old app has configurable guide values of 105 g protein and 32 g fibre; these should be editable and clearly described as personal planning guides, not medical prescriptions.
- The old app contains a note that 1,500 kcal may be too low with frequent intensive exercise; avoid prescribing calorie deficits or weight-loss rates.
- The user has mentioned high cholesterol and clinician monitoring. App content can encourage discussing lipid results with the user's clinician and generally support fibre-rich foods and unsaturated fats, but do not give individualized medical advice or make medical claims.
- Keep the app non-judgmental and avoid medical diagnosis.

## 9. Weight and waist goals / measurements

Defaults:
- Starting weight: **71 kg**
- Aspirational weight marker: **59 kg**
- The difference is 12 kg. Losing 12 kg in 12 weeks is aggressive; **59 kg is an aspirational marker, not a required 12-week deadline**.
- Emphasize sustainable health, energy, strength, wellbeing, and clinician guidance over reaching a number by a deadline.
- The app must never frame missing the target as failure.
- Goal and starting weight must be editable.

Weekly Measurements tab:
- Separate from daily log.
- Measurement date
- Weight in kg
- Waist circumference in cm
- Optional notes
- Save/edit historical measurement
- Weight trend chart
- Waist trend chart
- Weight chart must display:
  - recorded weights
  - starting-weight baseline (default 71 kg)
  - aspirational goal line (default 59 kg)
- Show latest weight, change from starting weight, and distance above/below goal marker.
- Do not interpolate fake measurements or imply daily measurements.
- Encourage consistent measurement conditions (e.g. same morning, before breakfast) without making it compulsory.
- Ideally one measurement record per week, but allow editing and do not hard-block additional records if user needs corrections.
- Support partial measurement records: weight without waist, or waist without weight.
- Measurements are private sensitive personal data and must never be publicly exposed.

## 10. Main product areas / navigation

Build these primary areas:

1. **Dashboard / Today**
   - Date picker and daily check-in.
   - Five-pillar summary.
   - Habit completion, with percentage and count.
   - Today's daily rhythm.
   - Daily writing, nutrition, movement, mental wellbeing and notes.
   - Energy and mood.
   - Show progress without guilt.

2. **Weekly Progress**
   - Choose week 1–12.
   - Days logged / days in week.
   - Habit completion, with denominator based on actual applicable habits.
   - Average nutrition and movement metrics where data exists.
   - Average writing minutes and word count.
   - Do not treat blank days as zero.
   - Avoid including weight/waist as daily fields. If measurement summary is shown, source it from weekly measurements.

3. **Weekly Measurements**
   - Weekly weight/waist entry, editing, history, charts, start baseline, goal marker.

4. **Monthly Overview**
   - Monthly summary for November 2026, December 2026, January 2027, February 2027 (for the initial cycle).
   - Generalize for future cycles.

5. **Track Record / History**
   - Daily history by date.
   - Open a prior day for editing.
   - Show completion, nutrition, workout/walk minutes, fasting window, writing minutes.
   - Do not display weight/waist as daily values.

6. **21-Day Reviews**
   - Four reviews, one per 21-day chapter.
   - Summaries for each chapter.
   - Reflection prompts: what worked, what was difficult, what will you adjust?
   - Existing review fields: waist at review (legacy field) and reflection. In the new version, measurements should remain in Weekly Measurements; if keeping a waist-at-review field, avoid duplicate/conflicting records and preferably reference the weekly measurement instead.
   - Preserve review notes during migration.

7. **Goals & Settings**
   - Editable starting weight, aspirational weight marker, protein guide, fibre guide.
   - Program dates and timezone.
   - Personal settings.
   - Export/import and account controls.

8. **Backup / Data Management**
   - JSON export and import.
   - Clear confirmation before destructive actions.
   - Provide a downloadable export of all user-owned data.
   - Explain last backup time and backup status.
   - Do not claim automated backups unless implemented and tested.

## 11. Technical architecture recommendation

Use a modern, maintainable full-stack architecture. Suggested default:
- Next.js (App Router) + TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security (RLS)
- Tailwind CSS and a consistent component system
- Recharts or another accessible charting library
- Netlify or Vercel for hosting; choose one based on current compatibility and simplicity, document the choice.
- GitHub for version control.

Claude Code should verify current framework and provider documentation before installing or configuring packages. Do not rely on outdated setup commands or invent environment variable names.

Supabase is a suggested option, not a hard requirement. If choosing another backend, explain why and preserve all requirements below.

### Security requirements
- Private app. Authentication required for all app data.
- Enforce user-level data isolation at database level using RLS, not merely frontend filtering.
- Every user-owned row must have an owner/user ID.
- Never put service-role keys or secrets in browser/client code.
- Keep secrets in environment variables and hosting secret settings.
- Use HTTPS.
- Validate and sanitize user input.
- Protect against cross-user access and insecure direct object references.
- Do not log private journal, gratitude, weight, waist, or health-related entries to analytics or server logs.
- No public sharing or public profile by default.
- Add account deletion and data export pathways.
- Use least-privilege database access.
- Add clear privacy information explaining what is stored in the browser, database, hosting provider, and backups.
- Configure database backups or point-in-time recovery where available on the selected plan; explain plan limitations and test restore.
- Do not assume free-tier backups are sufficient. Clearly document retention and recovery limitations.
- Do not store sensitive data in localStorage as the primary data store. Local cache/offline support may be considered, but the server database is canonical.
- If offline entry is supported, sync safely and resolve conflicts transparently.

## 12. Suggested database model

Design and document a normalized schema. Suggested tables:

### `profiles`
- `id` (UUID, references auth user)
- `display_name` (optional)
- `timezone` (default `America/Toronto`)
- `preferred_weight_unit` (default `kg`)
- `preferred_length_unit` (default `cm`)
- `created_at`, `updated_at`

### `programs`
- `id` UUID
- `user_id` UUID
- `name`
- `start_date` (initially 2026-11-21)
- `end_date` (initially 2027-02-12)
- `timezone`
- `starting_weight_kg` default 71
- `goal_weight_kg` default 59
- `protein_guide_g` default 105
- `fibre_guide_g` default 32
- `status`
- `created_at`, `updated_at`

### `daily_entries`
One record per user/program/date:
- `id`
- `user_id`
- `program_id`
- `entry_date`
- `energy`
- `mood`
- `fast_start_time`
- `first_calorie_time`
- `coffee_type`
- `calories_kcal`
- `protein_g`
- `fibre_g`
- `water_l`
- `workout_minutes`
- `workout_type`
- `first_walk_minutes`
- `second_walk_minutes`
- `writing_minutes`
- `words_written`
- `writing_notes`
- `mindfulness_minutes`
- `gratitude`
- `journal`
- `general_notes`
- `created_at`, `updated_at`

Unique constraint on `(user_id, program_id, entry_date)`.

### `habit_definitions`
- Stable habit ID
- Pillar/category
- Label
- Description
- Sort order
- Active status
- Optional flag
- Effective dates/versioning if needed

### `habit_completions`
- `id`
- `user_id`
- `program_id`
- `entry_date`
- `habit_id`
- `status` (completed / not_completed / not_applicable)
- optional note
- Unique `(user_id, program_id, entry_date, habit_id)`

Use stable IDs, not positional array indices.

### `weekly_measurements`
- `id`
- `user_id`
- `program_id`
- `measurement_date`
- `weight_kg` nullable
- `waist_cm` nullable
- `notes`
- `created_at`, `updated_at`

### `cycle_reviews`
- `id`
- `user_id`
- `program_id`
- `cycle_number` 1–4 for the original program
- `reflection`
- `created_at`, `updated_at`
- Store any other agreed reflection fields, but do not duplicate weight/waist measurements.

### `backup_events` (optional)
- `id`
- `user_id`
- `created_at`
- `backup_type`
- `metadata` (do not store the full private backup in logs)

Ensure foreign keys, indexes, RLS policies, uniqueness, date validation, and safe migrations.

## 13. Migration from existing HTML app

This is critical. Preserve existing records.

Current app localStorage key:
`healthJourney_20261121_v2`

Current state shape is approximately:
```json
{
  "entries": {
    "2026-11-21": {
      "habits": [false],
      "fastStart": "18:00",
      "fastEnd": "10:00",
      "coffeeType": "Black / no calories",
      "energy": "",
      "mood": "",
      "calories": "",
      "protein": "",
      "fibre": "",
      "water": "",
      "workoutMin": "",
      "workoutType": "",
      "walk1": "",
      "walk2": "",
      "writingMinutes": "",
      "wordsWritten": "",
      "writingNotes": "",
      "mindfulnessMinutes": "",
      "gratitude": "",
      "journal": "",
      "notes": ""
    }
  },
  "reviews": {},
  "measurements": {},
  "targets": {
    "startWeight": 71,
    "goalWeight": 59,
    "targetProtein": 105,
    "targetFibre": 32
  }
}
```

The actual JSON export is the authoritative data source. The above is a shape guide only.

Current app details:
- Date range 2026-11-21 through 2027-02-12.
- Existing daily entries are keyed by `YYYY-MM-DD`.
- Habits are currently stored as a 21-element boolean array in current version.
- Legacy entries may contain an 11-element habit array. Current app migration maps those old 11 values into positions starting at offset 4 in the 21-item array. Reproduce/verify the exact mapping against the current HTML and test carefully.
- Current app migrates any legacy `weight` and `waist` values found in daily entries into `measurements[date]`, with note `Migrated from earlier daily entry`, then removes the old daily fields.
- `measurements` is keyed by date and contains `{ weight, waist, notes }`.
- `reviews` is keyed by cycle number string (`"1"`–`"4"`) and contains `{ waist, reflection }` in the existing version. Preserve reflections. Migrate review waist data thoughtfully without duplicating measurements.
- `targets` defaults are start 71, goal 59, protein 105, fibre 32.
- Current app JSON export is named `my-12-week-transformation-backup.json`.
- Current app has JSON import validation and restore.

Migration requirements:
1. Before any migration, ask user to export a JSON backup from the old app.
2. Provide a dedicated import wizard in the new app.
3. Parse and validate JSON locally before upload.
4. Show a preview: number of daily entries, measurements, reviews, date range, and target settings.
5. Require explicit user confirmation before importing.
6. Make migration idempotent (do not duplicate rows if re-run).
7. Preserve every field, notes, and habit completion.
8. Convert habit array indexes into stable habit IDs using the exact current habit order.
9. Preserve date values as local calendar dates; avoid UTC timezone shifting.
10. Keep measurements weekly and separate from daily entries.
11. Provide a post-import reconciliation report and allow export of migrated data.
12. Never overwrite existing server records silently. Offer merge/skip/replace choices with a clear preview and confirmation.
13. Test import with empty state, partial data, duplicate dates, old 11-habit arrays, current 21-habit arrays, missing measurements, and legacy daily weight/waist.

## 14. Backup, sync, and data portability

The user's top concern is not losing any of the 84 days of personal records.

Must have:
- Server-side persistence, not only browser localStorage.
- Cross-device synchronization after login.
- Manual full JSON export.
- Full JSON import/restore with preview.
- Automated database backup configuration where supported.
- Clearly visible backup/export date and status.
- A documented recovery procedure.
- A test restore performed before launch.
- No false promises about automatic backup.
- A way to export all records in a portable format if the user leaves the service.

The app should clearly distinguish:
- app source/code backup (GitHub)
- production database backup
- user's personal data export
- browser cache/local state

## 15. Design and UX direction

Visual style:
- Elegant, minimal, calm, premium.
- Natural, warm neutral base; muted green as a restrained accent.
- Clear typography and generous spacing.
- Excellent mobile responsiveness.
- Avoid over-decorated gradients, gamification overload, loud colors, excessive badges, and dense dashboard clutter.
- Make the primary daily check-in easy to complete.
- Keep the most useful daily actions visible without requiring lots of scrolling.
- Accessible contrast, keyboard support, semantic labels, screen-reader friendly chart descriptions, and touch-friendly controls.
- Provide loading, empty, error, success, offline, and sync states.
- Save changes reliably and show clear save/sync confirmation.
- Avoid autosave ambiguity: clearly show when changes are saved, or use robust autosave with an explicit synced indicator.
- Use a calm visual representation of consistency rather than streak pressure.

## 16. Health and wellbeing guardrails

- This is not a medical app.
- No diagnoses, treatment recommendations, or promises about cholesterol outcomes.
- No encouragement of rapid weight loss.
- 59 kg is an aspirational marker, not a deadline or a measure of success.
- Avoid turning 12 kg / 12 weeks into a target rate.
- Don't reward extended fasting, low calories, or excessive exercise.
- Recovery and rest are legitimate.
- Keep optionality visible.
- If the user records feeling dizzy, weak, or unwell, show a gentle reminder to prioritize wellbeing and seek appropriate clinician advice if needed.
- Do not infer health status from missing data.
- Avoid clinical scoring or medical risk scores.

## 17. Build and delivery workflow for Claude Code

Work in stages. Do not attempt a giant one-shot rewrite.

### Stage 0 — Inspect and plan
- Read the existing `index.html` completely.
- Summarize its behavior and data model.
- Identify any bugs or inconsistencies.
- Propose architecture, database schema, migration strategy, and implementation plan.
- Ask only essential questions; use the defaults in this brief otherwise.

### Stage 1 — Foundation
- Scaffold app.
- Configure TypeScript, styling, environment variables.
- Set up authentication.
- Set up database schema and RLS.
- Add basic authenticated shell and profile settings.
- Create seed definitions for the five pillars and 21 habits.
- Add tests for RLS and data isolation.

### Stage 2 — Core experience
- Implement dashboard / Today.
- Daily check-in and habit completion.
- Daily rhythm.
- Weekly progress.
- History.
- Monthly overview.
- 21-day reviews.
- Goals and settings.

### Stage 3 — Weekly measurements
- Separate weekly weight and waist measurement experience.
- Charts with start and goal lines.
- Edit and history.
- Validate chart behavior with sparse/partial values.

### Stage 4 — Migration and backup
- Build JSON import wizard.
- Build full JSON export.
- Migrate existing localStorage JSON.
- Add backup status and recovery documentation.
- Test round-trip export/import.
- Test a database restore.

### Stage 5 — Quality and deployment
- Responsive QA on phone and desktop.
- Accessibility checks.
- Security review, especially RLS and secrets.
- Error handling and empty states.
- Configure hosting.
- Configure database backup/recovery.
- Provide a simple user guide.
- Confirm that the user can log in on two devices and see the same records.

At each stage:
- Make small coherent changes.
- Run lint, type checks, tests, and production build.
- Explain what changed and what remains.
- Do not say a feature is complete until it has been tested.
- Do not silently change the user's schedule, goals, habits, or dates.

## 18. Acceptance criteria

The app is not ready until all of these are true:
- User can securely sign in.
- User can access the same account on laptop and phone.
- A daily entry saved on one device appears on the other.
- All five pillars and the 21 habits are represented.
- Daily schedule matches this brief.
- External Daily Knowledge & Content Engine is not duplicated.
- Daily check-in supports the current fields.
- Weight and waist are only recorded in Weekly Measurements, not daily.
- Weight chart shows recorded points, 71 kg start baseline, and 59 kg aspirational marker.
- Waist chart works independently.
- Weekly and monthly summaries ignore blanks rather than treating them as zero.
- Four 21-day reviews work.
- Existing JSON data imports without loss.
- Re-running import does not duplicate records.
- User can export all data and restore it.
- RLS prevents one user from accessing another user's data.
- No secrets are exposed in client bundles or repository.
- Backup and recovery process is documented and tested.
- Mobile and desktop layouts are usable.
- The app does not imply medical advice or promise weight outcomes.

## 19. First task for Claude Code

Start by inspecting the files in this folder, especially `index.html`.

Then:
1. Explain the existing app's structure, data model, habits, and current limitations.
2. Propose the target architecture and database schema.
3. Explain the safest way to migrate the existing JSON export.
4. Create a phased implementation plan.
5. Do not overwrite or delete the original HTML file.
6. Do not begin destructive migrations until the user has exported a backup.

Prioritize preserving the user's existing data and intent over visual polish.

---

## 20. Approved decisions (2026-11-21) — these override earlier defaults above

- First program: **2026-11-22 → 2027-02-13** (84 days), chapters Nov 22–Dec 12, Dec 13–Jan 2, Jan 3–23, Jan 24–Feb 13.
- **22 habits** (the original app's code has 22; "21" above is a documentation error). Stable IDs in `supabase/migrations/*_seed_catalogs.sql`.
- Hosting: Vercel. Database: Supabase Free + independent automatic nightly backup.
- Sign-in: email magic link; public sign-ups disabled.
- Save model: autosave with visible sync status.
- Import: unticked habits on logged days → `not_completed`; viewed-only empty days excluded; review "waist at review" → weekly measurement dated the chapter's last day (unless a waist measurement exists in that chapter's final week).
- Add optional "felt dizzy / weak / unwell" field that shows a gentle wellbeing note.
- See `docs/stage-0-architecture-and-migration-plan.md` for the full plan.
