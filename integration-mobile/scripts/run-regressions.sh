#!/usr/bin/env bash
# Runs only the named regression flows for fast feedback.
# Each flow listed here corresponds to a bug we shipped a fix for.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLOWS_DIR="$SCRIPT_DIR/../flows"
PLATFORM="${1:-both}"

REGRESSION_FLOWS=(
  "$FLOWS_DIR/sign-in/google-sso-from-forgot-password.yaml"
  "$FLOWS_DIR/sign-in/get-help-loop-regression.yaml"
  "$FLOWS_DIR/cycles/sign-in-sign-out-sign-in.yaml"
  "$FLOWS_DIR/theming/custom-theme-applied.yaml"
  "$FLOWS_DIR/smoke/cold-launch-no-flash.yaml"
)

if [[ -f "$SCRIPT_DIR/../config/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/../config/.env"
  set +a
fi

run_on() {
  local platform_name="$1"
  shift
  echo "==> Running regression flows on $platform_name..."
  for flow in "${REGRESSION_FLOWS[@]}"; do
    if [[ -f "$flow" ]]; then
      maestro test "$@" "$flow"
    else
      echo "Skipping missing flow: $flow"
    fi
  done
}

case "$PLATFORM" in
  ios)
    run_on "iOS" --device "${MAESTRO_DEVICE:-iPhone 16 Pro}" --exclude-tags androidOnly
    ;;
  android)
    run_on "Android" --exclude-tags iosOnly
    ;;
  both)
    run_on "iOS" --device "${MAESTRO_DEVICE:-iPhone 16 Pro}" --exclude-tags androidOnly
    run_on "Android" --exclude-tags iosOnly
    ;;
  *)
    echo "Usage: $0 [ios|android|both]" >&2
    exit 1
    ;;
esac
