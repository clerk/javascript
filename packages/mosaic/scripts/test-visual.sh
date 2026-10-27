#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
image=mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e

case "${1:-}" in
  compare)
    if [[ "$(uname -s)-$(uname -m)" != Linux-x86_64 ]]; then
      printf 'compare needs a Linux x64 install of the workspace; it runs in CI.\n' >&2
      exit 2
    fi
    rm -rf "$root/packages/mosaic/.vitest/attachments"
    docker run --rm --init --ipc=host --user "$(id -u):$(id -g)" --env HOME=/tmp \
      --volume "$root:/repo" --workdir /repo/packages/mosaic \
      "$image" node /repo/node_modules/vitest/vitest.mjs run --project visual --update none
    ;;
  pull)
    run="${2:?Usage: $0 pull <run-id>}"
    download=$(mktemp -d)
    trap 'rm -rf "$download"' EXIT
    gh run download "$run" --pattern 'mosaic-visual-failure-artifacts-*' --dir "$download"
    count=0
    while IFS= read -r actual; do
      relative=${actual#*/.vitest/attachments/}
      test_file=$(dirname "$relative")
      name=$(basename "$relative")
      baseline="$root/packages/mosaic/$(dirname "$test_file")/__screenshots__/$(basename "$test_file")/${name/-actual-/-}"
      mkdir -p "$(dirname "$baseline")"
      cp "$actual" "$baseline"
      printf 'updated %s\n' "${baseline#"$root"/}"
      count=$((count + 1))
    done < <(find "$download" -path '*/.vitest/attachments/*' -name '*-actual-*.png')
    if [[ "$count" -eq 0 ]]; then
      printf 'Run %s has no changed screenshots.\n' "$run" >&2
      exit 1
    fi
    ;;
  *)
    printf 'Usage: %s compare | pull <run-id>\n' "$0" >&2
    exit 2
    ;;
esac
