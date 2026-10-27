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
  *)
    printf 'Usage: %s compare\n' "$0" >&2
    exit 2
    ;;
esac
