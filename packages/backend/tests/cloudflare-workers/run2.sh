#!/bin/bash
./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tests/cloudflare-workers/testHarness.js \
  tests/cloudflare-workers/testHarness.ts

# DOESNT WORK
# npx --yes wrangler@2.1.13 dev --config tests/cloudflare-workers/wrangler.toml --experimental-local

# WORKS
npx --yes wrangler@2.1.13 dev --local --config tests/cloudflare-workers/wrangler.toml



# npx workerd serve --verbose tests/cloudflare-workers/workers.capnp &
# sleep 1
# failed=$(curl -sv http://localhost:8080 | jq '.failed')
# kill $(ps aux | grep 'workerd' | grep -v 'grep' | awk '{print $2}')
# echo "WHATEVER"
# echo $failed
# # test $failed -eq 0
