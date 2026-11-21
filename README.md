# My 12-Week Transformation

A private, calm, full-stack tracker for five pillars of daily practice — spiritual connection, physical health, mental & emotional wellbeing, personal care & confidence, and intellectual growth. Progress without perfection.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Auth + Postgres + Row Level Security) · Vercel
- **Brief:** `CLAUDE.md` (product requirements) · `docs/` (plan, decisions, runbooks)
- **Original app:** kept untouched outside this repo. Its JSON export is the source of truth for migration.

## Status

| Stage | Scope | Status |
|---|---|---|
| 0 | Inspect & plan | Done — decisions approved 2026-11-21 |
| 1 | Foundation: scaffold, schema, RLS, seeds, magic-link auth, shell | **Code done & tested locally**; needs real Supabase/Vercel/GitHub setup (below) |
| 2 | Import / export engine + wizard | Next |
| 3 | Today: daily check-in, habits, autosave | — |
| 4 | Weekly measurements & charts | — |
| 5 | Weekly, monthly, history, reviews, settings editing | — |
| 6 | Real migration, nightly backup, restore test, QA, launch | — |

## First program

84 days, **Sun 2026-11-22 → Sat 2027-02-13**, America/Toronto, four 21-day chapters (Foundation · Consistency · Momentum · Strengthen & sustain), 22 habits.

## Commands

```bash
npm run dev          # local dev server (needs .env.local)
npm run lint
npm run typecheck    # generates route types, then tsc
npm test             # unit tests (dates, program structure)
npm run test:db      # RLS + integrity tests on a throwaway PostgreSQL 16 database
npm run build
scripts/check-client-secrets.sh   # after build: no secrets in the browser bundle
```

## Security model

- Every user-owned row has `user_id`; RLS policies (`supabase/migrations/…_rls_and_functions.sql`) allow only the owner to read or write it. `anon` has no access to anything.
- Composite foreign keys `(program_id, user_id)` stop a row from being attached to someone else's program.
- Ownership and row IDs can't be changed after insert (trigger).
- The app uses only the **publishable** key. The service-role/secret key is never used or stored anywhere in this app; `src/lib/env.ts` refuses to start if one is supplied as the public key.
- Every server page/action re-verifies the session with `getClaims()`; the proxy is only an optimistic gate.
- Private pages send `Cache-Control: private, no-store`; Cache Components are disabled so nothing private is cached server-side.
- No analytics. Fonts are self-hosted.

## One-time setup (owner)

### 1. GitHub
Create a **private** repository (e.g. `my-12-week-transformation`). I'll push this code to it once you share access.

### 2. Supabase (Free plan)
1. Create a project in the **Canada (Central)** region if offered, otherwise the nearest US-East region.
2. **SQL Editor:** run the three files in `supabase/migrations/` in order (or link the Supabase CLI and run `supabase db push`).
3. **Authentication → Sign In / Providers → Email:** keep Email enabled; **turn off "Allow new users to sign up"**.
4. **Authentication → Users → Add user → Send invitation** (or create user) with your email — this is the only account.
5. **Authentication → URL Configuration:** Site URL = your Vercel URL; add `http://localhost:3000/**` and your Vercel URL `/**` to Redirect URLs.
6. **Authentication → Emails → Magic Link** template — make the link go through our server route:
   ```html
   <h2>Your sign-in link</h2>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Sign in to My 12-Week Transformation</a></p>
   <p>This link expires in one hour. If you didn't request it, ignore this email.</p>
   ```
   Do the same for the **Invite user** template with `type=invite`.
7. **Project Settings → API Keys:** copy the project URL and the **publishable** key (never the secret key).

**Free-plan limits (verified against Supabase docs, Nov 2026):** no automatic backups on Free (Pro gets daily backups kept 7 days; point-in-time recovery is a paid add-on); Free projects pause after ~7 days of low activity — data is kept and can be resumed for up to a year. Daily use plus the nightly backup job keeps it active. Our independent nightly backup is set up in Stage 6.

### 3. Vercel
Import the GitHub repo, add the three variables from `.env.example` (Production + Preview), deploy, then put the deployed URL into Supabase step 5 and `NEXT_PUBLIC_SITE_URL`.

## Health guardrails

This is a personal reflection and habit tool, not a medical device. 59 kg is an aspirational marker, not a deadline. Rest and recovery count. Fasting is optional; stop if dizzy, weak or unwell, and follow clinician guidance.
