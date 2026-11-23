#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?}" "${GITHUB_OUTPUT:?}" "${RUNNER_TEMP:?}" "${BRANCH:?}" "${PLATFORM:?}" "${NATIVE_APP:?}"

OURS='.workflow_run.head_repository_id == .workflow_run.repository_id and .workflow_run.head_branch == $ENV.BRANCH'

take() {
  local artifact="$1" dir="$2" unpacked
  unpacked="$(mktemp -d "$RUNNER_TEMP/native-build.XXXXXX")" || return 1
  gh api "repos/$GITHUB_REPOSITORY/actions/artifacts/$artifact/zip" > "$unpacked.zip" || return 1
  unzip -q "$unpacked.zip" -d "$unpacked" || return 1
  mkdir -p "$dir" || return 1
  if [ "$PLATFORM" = "ios" ]; then
    mv "$unpacked" "$dir/$NATIVE_APP" || return 1
  else
    mv "$unpacked/$NATIVE_APP" "$dir/$NATIVE_APP" || return 1
  fi
}

if [ -z "${NATIVE_ID:-}" ]; then
  : "${NATIVE_CACHE:?}"
  prefix="verify-expo-native-$PLATFORM-"
  runs="$(gh api "repos/$GITHUB_REPOSITORY/actions/workflows/verify-e2e.yml/runs?branch=$BRANCH&per_page=20" --jq '.workflow_runs[] | select(.head_repository.id == .repository.id and .head_branch == $ENV.BRANCH) | .id' || true)"
  taken=0
  for run in $runs; do
    while read -r artifact name; do
      [ -n "$name" ] && [ ! -e "$NATIVE_CACHE/${name#verify-expo-native-}" ] || continue
      if take "$artifact" "$NATIVE_CACHE/${name#verify-expo-native-}"; then
        echo "Took the native build from artifact $artifact ($name)."
        taken=$((taken + 1))
      fi
    done < <(gh api "repos/$GITHUB_REPOSITORY/actions/runs/$run/artifacts?per_page=100" --jq ".artifacts[] | select(.expired == false and (.name | startswith(\"$prefix\"))) | \"\(.id) \(.name)\"" || true)
    [ "$taken" -lt 3 ] || break
  done
  echo "taken=$taken" >> "$GITHUB_OUTPUT"
  exit 0
fi

: "${NATIVE_DIR:?}"
name="verify-expo-native-$NATIVE_ID"
artifact="$(gh api "repos/$GITHUB_REPOSITORY/actions/artifacts?name=$name&per_page=100" --jq "[.artifacts[] | select(.expired == false and $OURS)] | sort_by(.created_at) | last | .id // empty" || true)"
if [ -n "$artifact" ] && take "$artifact" "$NATIVE_DIR"; then
  echo "Took the native build from artifact $artifact ($name)."
  echo "found=kept" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "No native build of this branch is kept for $NATIVE_ID, so this job builds it."
echo "found=none" >> "$GITHUB_OUTPUT"
