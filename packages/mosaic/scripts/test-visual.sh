#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
image=mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e
vitest='node /repo/node_modules/vitest/vitest.mjs run --project visual'

case "${1:-}" in
  compare) update=none ;;
  update) update=all ;;
  *)
    printf 'Usage: %s compare|update\n' "$0" >&2
    exit 2
    ;;
esac

run=(docker run --rm --init --ipc=host --platform linux/amd64 --volume "$root:/repo" --workdir /repo/packages/mosaic)

if [[ "${CI:-}" == true ]]; then
  run+=(--user "$(id -u):$(id -g)" --env HOME=/tmp "$image" sh -c "$vitest --update $update")
else
  run+=(--volume clerk-mosaic-visual-store:/pnpm-store --volume clerk-mosaic-visual-modules:/repo/node_modules)
  for package in "$root"/packages/*/ "$root"/packages/electron-passkeys/npm/*/; do
    relative=${package#"$root"/}
    run+=(--volume "clerk-mosaic-visual-${relative//\//-}modules:/repo/${relative}node_modules")
  done
  run+=("$image" sh -c "corepack enable && pnpm install --frozen-lockfile --store-dir /pnpm-store && pnpm turbo build --filter=@clerk/mosaic... && $vitest --update $update")
fi

baselines=$(find "$root/packages/mosaic/src" -path '*/__screenshots__/*-chromium-linux.png')
rm -rf "$root/packages/mosaic/.vitest/attachments"
if [[ "$update" == all && -n "$baselines" ]]; then
  printf '%s\n' "$baselines" | xargs rm
fi

status=0
"${run[@]}" || status=$?

if [[ "$update" == all && "$status" -ne 0 ]]; then
  git -C "$root" checkout -- ':(glob)packages/mosaic/src/**/__screenshots__/**' 2>/dev/null || true
fi
exit "$status"
