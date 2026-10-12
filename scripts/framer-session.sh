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
OUT="$(npx -y @framer/agent@latest session new "$PROJECT_ID" </dev/null 2>&1 || true)"
if echo "$OUT" | grep -qi "waiting for authorization"; then
  echo "Framer is waiting for a browser sign-in, which a cloud session cannot complete. Run scripts/framer-auth.sh with FRAMER_API_KEY set, then retry." >&2; exit 1
fi
SID="$(echo "$OUT" | grep -oE '[0-9]+' | tail -1 || true)"
if [ -z "$SID" ]; then echo "Could not open a session. Framer said:" >&2; echo "$OUT" >&2; exit 1; fi
echo "$SID" > "$CACHE"; echo "$SID"
