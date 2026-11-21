#!/usr/bin/env bash
# Runs the RLS/integrity tests against a fresh database.
# Locally: spins up a throwaway PostgreSQL 16 cluster (scripts/test-db.sh).
# CI: set CI_DATABASE_URL to an empty Postgres database (e.g. a GitHub Actions service).
set -uo pipefail
cd "$(dirname "$0")/.."
if [[ -n "${CI_DATABASE_URL:-}" ]]; then
  PSQL=(psql "$CI_DATABASE_URL" -v ON_ERROR_STOP=1 -q)
  "${PSQL[@]}" -f tests/db/supabase-shim.sql || exit 1
  for f in supabase/migrations/*.sql; do "${PSQL[@]}" -f "$f" || exit 1; done
  export DATABASE_URL="$CI_DATABASE_URL"
  npx vitest run --config vitest.db.config.mts
  exit $?
fi
DATABASE_URL="$(scripts/test-db.sh start)" || exit 1
export DATABASE_URL
npx vitest run --config vitest.db.config.mts
status=$?
scripts/test-db.sh stop
exit $status
