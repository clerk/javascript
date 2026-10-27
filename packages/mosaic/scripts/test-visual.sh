#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
image="clerk-mosaic-visual:$(printf '%s' "$root" | cksum | cut -d ' ' -f 1)"
mode=${1:-}

case "$mode" in
  build)
    docker build --platform linux/amd64 --file "$root/packages/mosaic/test/visual/Dockerfile" --tag "$image" "$root"
    exit
    ;;
  compare|update)
    ;;
  *)
    printf 'Usage: %s build|compare|update\n' "$0" >&2
    exit 2
    ;;
esac

container=$(docker create --init --ipc=host "$image" sleep infinity)
trap 'docker rm --force "$container" >/dev/null' EXIT
docker start "$container" >/dev/null

update=none
if [[ "$mode" == update ]]; then
  update=all
fi

status=0
docker exec "$container" pnpm exec vitest run --project visual --update "$update" || status=$?

attachments="$root/packages/mosaic/.vitest/attachments"
if docker exec "$container" test -d /repo/packages/mosaic/.vitest/attachments; then
  mkdir -p "$attachments"
  docker cp "$container:/repo/packages/mosaic/.vitest/attachments/." "$attachments"
fi

if [[ "$mode" == update && "$status" -eq 0 ]]; then
  while IFS= read -r snapshot; do
    destination="$root/${snapshot#/repo/}"
    mkdir -p "$(dirname "$destination")"
    docker cp "$container:$snapshot" "$destination"
  done < <(docker exec "$container" find /repo/packages/mosaic/src -path '*/__screenshots__/*-chromium-linux.png' -print)
fi

exit "$status"
