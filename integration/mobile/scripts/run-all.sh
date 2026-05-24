#!/usr/bin/env bash
# Runs every Maestro flow on both iOS and Android sequentially.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/run-ios.sh"
"$SCRIPT_DIR/run-android.sh"
