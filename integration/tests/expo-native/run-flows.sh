#!/usr/bin/env bash
# Usage: PLATFORM=<ios|android> [CLERK_TEST_DEVICES=a,b] ./run-flows.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

: "${PLATFORM:?PLATFORM (ios|android) is required}"
: "${CLERK_TEST_EMAIL:?CLERK_TEST_EMAIL is required}"
: "${CLERK_TEST_PASSWORD:?CLERK_TEST_PASSWORD is required}"

status=0
pnpm exec e2e run --target "$PLATFORM" --retries 1 --video=on-first-retry --reporter list,junit,markdown || status=$?

if [ -n "${GITHUB_STEP_SUMMARY:-}" ] && [ -f .e2e/summary.md ]; then
  cat .e2e/summary.md >> "$GITHUB_STEP_SUMMARY"
fi

flaky=$(jq -r '.run.results[] | select(.status == "flaky") | .file' .e2e/report.json 2>/dev/null || true)
if [ -n "$flaky" ]; then
  echo "::error::Flaky flow(s), failed then passed on the retry: ${flaky//$'\n'/, }"
  [ "$status" -ne 0 ] || status=1
fi
exit "$status"
