#!/usr/bin/env bash
# Fails if anything resembling a server secret appears in the browser bundle.
set -euo pipefail
cd "$(dirname "$0")/.."
if grep -rEl "service_role|sb_secret_|SUPABASE_SERVICE|DB_PASSWORD|postgres://" .next/static 2>/dev/null; then
  echo "Secret-like string found in client bundle" >&2; exit 1
fi
echo "Client bundle secret scan: clean"
