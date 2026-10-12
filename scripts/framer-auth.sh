#!/usr/bin/env bash
# Signs the Framer agent in to the site's project with the API key from the environment, then installs the Framer skill.
# The key is never printed, never written to a file and never passed through a chat.
# Usage: bash scripts/framer-auth.sh            (reads FRAMER_API_KEY; falls back to browser sign-in on a Mac)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ID="$(node "$HERE/site-config.mjs" --get framer.projectId)"
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "REPLACE_WITH_THE_FRAMER_PROJECT_ID" ]; then
  echo "site-agent.json has no Framer project id yet." >&2; exit 2
fi
if [ -n "${FRAMER_API_KEY:-}" ]; then
  # -y answers npx's install prompt; </dev/null keeps it from waiting on a terminal. Output is hidden so the key can't leak through an echo.
  if npx -y @framer/agent@latest project auth "$PROJECT_ID" "$FRAMER_API_KEY" </dev/null >/dev/null 2>&1; then
    echo "Signed in to Framer project $PROJECT_ID with the API key from the environment."
  else
    echo "Framer rejected the sign-in for project $PROJECT_ID. Check that the key is valid for this project and that framer.com is reachable." >&2; exit 1
  fi
else
  echo "FRAMER_API_KEY is not set. On a Mac the first 'session new' opens the browser sign-in; in a cloud environment set FRAMER_API_KEY in the environment settings (see docs/handbook/cloud.md)."
fi
npx -y @framer/agent@latest setup </dev/null >/dev/null 2>&1 || true
echo "Framer skill installed or already present."
