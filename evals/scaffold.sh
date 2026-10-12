#!/usr/bin/env bash
# Copies the synthetic website repository into the eval's working directory. Each case's scaffold.sh runs this one.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
case "$PWD" in
  "$HERE"*) echo "scaffold: refusing to copy fixtures into the plugin's own evals folder ($PWD)" >&2; exit 1 ;;
esac
cp -R "$HERE/fixtures/site/." "$PWD/"
echo "scaffold: fixture site copied into $PWD"
