#!/usr/bin/env bash
# Runs only the named regression flows for fast feedback.
# Each flow listed here corresponds to a bug we shipped a fix for.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLOWS_DIR="$SCRIPT_DIR/../flows"
PLATFORM="${1:-both}"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/filter-flows.sh"

# Note: google-sso-from-forgot-password and sign-in-sign-out-sign-in were moved
# to flows/native-side/ (they primarily exercise native auth UI, which the
# clerk-ios/clerk-android suites own). The theming flows were removed entirely:
# theme *delivery* is now verified deterministically by the config-plugin unit
# test (src/__tests__/appPlugin.theme.test.js), and the color *render* is the
# native SDKs' responsibility — no fragile screenshot pixel-check.
REGRESSION_FLOWS=(
  "$FLOWS_DIR/sign-in/get-help-loop-regression.yaml"
  "$FLOWS_DIR/smoke/cold-launch-no-flash.yaml"
)

if [[ -f "$SCRIPT_DIR/../config/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/../config/.env"
  set +a
fi

# Maestro's --exclude-tags is a no-op when explicit file paths are passed.
# Pre-filter the regression list for each platform before invoking Maestro
# so a flow tagged `manual` or `skip` (or for the other platform) cannot
# sneak in just because it's listed above.
run_on() {
  local platform_name="$1"
  local exclude_tags="$2"
  shift 2

  echo "==> Running regression flows on $platform_name..."
  KEEP=()
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    KEEP+=("$f")
  done < <(filter_flows "$exclude_tags" "${REGRESSION_FLOWS[@]}")

  if [[ ${#KEEP[@]} -eq 0 ]]; then
    echo "No regression flows to run on $platform_name after filtering." >&2
    return 0
  fi

  for flow in "${KEEP[@]}"; do
    maestro test "$@" "$flow"
  done
}

case "$PLATFORM" in
  ios)
    run_on "iOS" "androidOnly,manual,skip" --device "${MAESTRO_DEVICE:-iPhone 16 Pro}"
    ;;
  android)
    run_on "Android" "iosOnly,manual,skip"
    ;;
  both)
    run_on "iOS" "androidOnly,manual,skip" --device "${MAESTRO_DEVICE:-iPhone 16 Pro}"
    run_on "Android" "iosOnly,manual,skip"
    ;;
  *)
    echo "Usage: $0 [ios|android|both]" >&2
    exit 1
    ;;
esac
