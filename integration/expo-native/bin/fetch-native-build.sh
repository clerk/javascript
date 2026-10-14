#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?}" "${GITHUB_OUTPUT:?}" "${RUNNER_TEMP:?}" "${BRANCH:?}" "${PLATFORM:?}"
: "${NATIVE_ID:?}" "${NATIVE_DIR:?}" "${NATIVE_APP:?}"

fetch() {
  local name="verify-expo-native-$NATIVE_ID" artifact unpacked
  artifact="$(gh api "repos/$GITHUB_REPOSITORY/actions/artifacts?name=$name&per_page=100" --jq "[.artifacts[] | select(.expired == false and .workflow_run.head_repository_id == .workflow_run.repository_id and .workflow_run.head_branch == \$ENV.BRANCH)] | sort_by(.created_at) | last | .id // empty")" || return 1
  if [ -z "$artifact" ]; then
    return 1
  fi
  unpacked="$(mktemp -d "$RUNNER_TEMP/native-build.XXXXXX")" || return 1
  gh api "repos/$GITHUB_REPOSITORY/actions/artifacts/$artifact/zip" > "$unpacked.zip" || return 1
  unzip -q "$unpacked.zip" -d "$unpacked" || return 1
  mkdir -p "$NATIVE_DIR" || return 1
  if [ "$PLATFORM" = "ios" ]; then
    mv "$unpacked" "$NATIVE_DIR/$NATIVE_APP" || return 1
  else
    mv "$unpacked/$NATIVE_APP" "$NATIVE_DIR/$NATIVE_APP" || return 1
  fi
  echo "Took the native build from artifact $artifact ($name)."
}

if fetch; then
  echo "found=kept" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "No native build of this branch is kept for $NATIVE_ID, so this job builds it."
echo "found=none" >> "$GITHUB_OUTPUT"
