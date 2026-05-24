#!/usr/bin/env bash
# Pre-filters Maestro flow files by tag exclusion.
#
# Background: `maestro test --exclude-tags X,Y` only filters when invoked
# against a directory. When you pass explicit file paths (which run-ios.sh /
# run-android.sh / run-regressions.sh all do, because flows live in nested
# directories that Maestro does not auto-recurse into), the --exclude-tags
# flag is silently ignored and every file is executed regardless of tag.
#
# This helper closes that hole by scanning each file for an exact tag match
# in its YAML frontmatter and dropping any file whose tag list intersects
# the excluded set, before the file list ever reaches Maestro.
#
# Usage:
#   source ./lib/filter-flows.sh
#   filtered=$(filter_flows "manual,skip,androidOnly" "${FLOW_FILES[@]}")
#   readarray -t KEEP <<< "$filtered"   # or pipe to xargs -n 1
#
# Stdout: kept file paths (one per line, in input order).
# Stderr: a one-line "Skip <path> (...)" notice for each dropped file.

filter_flows() {
  local excluded_csv="$1"; shift
  if [[ -z "$excluded_csv" ]]; then
    printf '%s\n' "$@"
    return 0
  fi
  local pattern
  pattern=$(printf '%s' "$excluded_csv" | sed 's/,/|/g')
  local f
  for f in "$@"; do
    if [[ ! -f "$f" ]]; then
      echo "Skip $f (file not found)" >&2
      continue
    fi
    # Match a list-item tag entry in the YAML frontmatter, e.g.
    #   tags:
    #     - manual
    # We deliberately anchor on `^\s*-\s*<tag>\s*$` so a flow body that
    # happens to contain the word "manual" doesn't get filtered out.
    if grep -qE "^[[:space:]]*-[[:space:]]*(${pattern})[[:space:]]*\$" "$f"; then
      echo "Skip $f (matches excluded tag in ${excluded_csv})" >&2
    else
      printf '%s\n' "$f"
    fi
  done
}
