#!/usr/bin/env bash
# Opens a Framer agent session for the site's project and prints the session id.
# Reuse the id with -s <id> for every exec in the conversation. The id is remembered per project in a cache file.
# Usage: bash scripts/framer-session.sh [--new]
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ID="$(node "$HERE/site-config.mjs" --get framer.projectId)"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/azmx-site"; mkdir -p "$CACHE_DIR"
CACHE="$CACHE_DIR/$PROJECT_ID.session"
if [ "${1:-}" != "--new" ] && [ -f "$CACHE" ]; then
  SID="$(cat "$CACHE")"
  if npx -y @framer/agent@latest session list </dev/null 2>/dev/null | grep -qE "(^|[^0-9])$SID([^0-9]|$)"; then
    echo "$SID"; exit 0
  fi
fi
ERR="$(mktemp)"; trap 'rm -f "$ERR"' EXIT
OUT="$(npx -y @framer/agent@latest session new "$PROJECT_ID" </dev/null 2>"$ERR" || true)"
# The id is a whole line holding only digits.
SID="$(printf '%s\n' "$OUT" | grep -xE '[0-9]+' | tail -1 || true)"
if [ -n "$SID" ]; then echo "$SID" > "$CACHE"; echo "$SID"; exit 0; fi
ALL="$(cat "$ERR"; printf '%s' "$OUT")"
if printf '%s' "$ALL" | grep -qi "authorization"; then
  {
    echo "Framer needs a sign-in for project $PROJECT_ID."
    echo "On a laptop: run  npx -y @framer/agent@latest project auth $PROJECT_ID  (it opens the browser; no key needed), then rerun this script."
    echo "In a cloud session: set FRAMER_API_KEY in the environment and run scripts/framer-auth.sh (see docs/handbook/cloud.md)."
    printf '%s\n' "$ALL" | grep -i "http" | head -3 || true
  } >&2
  exit 1
fi
echo "Could not open a session. Framer said:" >&2; printf '%s\n' "$ALL" >&2; exit 1
