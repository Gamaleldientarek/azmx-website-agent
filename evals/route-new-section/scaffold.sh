#!/usr/bin/env bash
# Runs the shared scaffold (copies the fixture website repository into the working directory).
exec bash "$(dirname "${BASH_SOURCE[0]}")/../scaffold.sh" "$@"
