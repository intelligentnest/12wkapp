#!/usr/bin/env bash
# Starts a throwaway PostgreSQL 16 cluster, applies the Supabase shim and all migrations.
# Usage: scripts/test-db.sh start|stop   (prints DATABASE_URL on start)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA=/tmp/m12wt-testdb
PORT=54329
BIN=/usr/lib/postgresql/16/bin
AS="sudo -u postgres"
command -v sudo >/dev/null || AS="runuser -u postgres --"
case "${1:-start}" in
  start)
    $AS $BIN/pg_ctl -D "$DATA" stop -m immediate >/dev/null 2>&1 || true
    rm -rf "$DATA"; mkdir -p "$DATA"; chown postgres "$DATA"
    $AS $BIN/initdb -D "$DATA" -U postgres --auth=trust >/dev/null
    $AS $BIN/pg_ctl -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/log" start -w >/dev/null
    PSQL="psql -h /tmp -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
    $PSQL -c "create database m12wt"
    $PSQL -d m12wt -f "$ROOT/tests/db/supabase-shim.sql"
    for f in "$ROOT"/supabase/migrations/*.sql; do $PSQL -d m12wt -f "$f"; done
    echo "postgres://postgres@localhost:$PORT/m12wt?host=/tmp"
    ;;
  stop)
    $AS $BIN/pg_ctl -D "$DATA" stop -m fast >/dev/null
    ;;
esac
