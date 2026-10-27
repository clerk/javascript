#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
mosaic="$root/packages/mosaic"
image="clerk-mosaic-visual:$(printf '%s' "$root" | cksum | cut -d ' ' -f 1)"

case "${1:-}" in
  compare) update=none ;;
  update) update=all ;;
  *)
    printf 'Usage: %s compare|update\n' "$0" >&2
    exit 2
    ;;
esac

docker build --platform linux/amd64 --file "$mosaic/test/visual/Dockerfile" --tag "$image" "$root"

container=$(docker create --platform linux/amd64 --init --ipc=host "$image" pnpm exec vitest run --project visual --update "$update")
trap 'docker rm --force "$container" >/dev/null' EXIT

status=0
docker start --attach "$container" || status=$?

rm -rf "$mosaic/.vitest/attachments"
mkdir -p "$mosaic/.vitest"
docker cp "$container:/repo/packages/mosaic/.vitest/attachments" "$mosaic/.vitest/attachments" 2>/dev/null || true

if [[ "$update" == all && "$status" -eq 0 ]]; then
  output=$(mktemp -d)
  docker cp "$container:/repo/packages/mosaic/src" "$output"
  find "$mosaic/src" -path '*/__screenshots__/*-chromium-linux.png' -delete
  (cd "$output" && find src -path '*/__screenshots__/*-chromium-linux.png') | while IFS= read -r snapshot; do
    mkdir -p "$(dirname "$mosaic/$snapshot")"
    cp "$output/$snapshot" "$mosaic/$snapshot"
  done
  rm -rf "$output"
fi

exit "$status"
