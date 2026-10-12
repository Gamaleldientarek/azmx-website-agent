#!/usr/bin/env bash
# Runs the shared scaffold (copies the synthetic website repository into the working directory).
exec bash "$(dirname "${BASH_SOURCE[0]}")/../scaffold.sh" "$@"
