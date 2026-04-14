#!/usr/bin/env bash
# Dispatch the Release workflow's legacy-release job for a single package.
#
# Usage:
#   scripts/legacy-release.sh <package> <version> [--publish]
#
# Defaults to dry-run. Pass --publish to actually publish.
# Dist-tag is derived from convention: latest-<short>-v<major>.
#
# Examples:
#   scripts/legacy-release.sh @clerk/nextjs 5.7.6
#   scripts/legacy-release.sh @clerk/nextjs 5.7.6 --publish

set -euo pipefail

PKG="${1:-}"
VERSION="${2:-}"
MODE="${3:-}"

if [[ -z "$PKG" || -z "$VERSION" ]]; then
  echo "Usage: $0 <package> <version> [--publish]" >&2
  exit 1
fi

if [[ $# -gt 3 ]]; then
  echo "Unexpected arguments: ${*:4}" >&2
  exit 1
fi

if [[ ! "$PKG" =~ ^@clerk/[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Package must be in the form @clerk/<name>, got: $PKG" >&2
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Version must be semver <major>.<minor>.<patch>, got: $VERSION" >&2
  exit 1
fi

DRY_RUN=true
if [[ "$MODE" == "--publish" ]]; then
  DRY_RUN=false
elif [[ -n "$MODE" ]]; then
  echo "Unknown mode: $MODE (expected --publish or nothing)" >&2
  exit 1
fi

SHORT="${PKG#@clerk/}"
MAJOR="${VERSION%%.*}"
DIST_TAG="latest-${SHORT}-v${MAJOR}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install: https://cli.github.com/" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found. Install: brew install jq" >&2
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "HEAD" ]]; then
  echo "Detached HEAD. Checkout a branch first." >&2
  exit 1
fi

if ! git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "Branch '$BRANCH' not pushed to origin. Push first." >&2
  exit 1
fi

LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse "origin/$BRANCH")
if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  echo "Local '$BRANCH' is out of sync with origin. Push first." >&2
  exit 1
fi

PKG_JSON="./packages/$SHORT/package.json"
if [[ ! -f "$PKG_JSON" ]]; then
  echo "No package.json at $PKG_JSON." >&2
  exit 1
fi

PKG_VERSION=$(jq -r .version "$PKG_JSON")
if [[ "$PKG_VERSION" != "$VERSION" ]]; then
  echo "$PKG_JSON has version $PKG_VERSION, expected $VERSION." >&2
  exit 1
fi

PACKAGES=$(jq -c -n --arg n "$PKG" --arg v "$VERSION" --arg t "$DIST_TAG" \
  '[{name:$n, version:$v, dist_tag:$t}]')

cat <<EOF
Dispatching Release workflow:
  package:    $PKG
  version:    $VERSION
  dist-tag:   $DIST_TAG
  branch:     $BRANCH
  source_ref: $LOCAL_SHA
  dry_run:    $DRY_RUN

EOF

read -r -p "Continue? [y/N] " yn
case "$yn" in
  y|Y) ;;
  *) echo "Aborted."; exit 0 ;;
esac

gh workflow run release.yml \
  --ref main \
  -f source_ref="$LOCAL_SHA" \
  -f packages="$PACKAGES" \
  -f dry_run="$DRY_RUN"

echo ""
echo "Dispatched. Approve at:"
echo "  https://github.com/clerk/javascript/actions/workflows/release.yml"
