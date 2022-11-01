#!/bin/bash
./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tests/cloudflare-workers/testHarness.js \
  tests/cloudflare-workers/testHarness.ts

npx workerd serve --verbose tests/cloudflare-workers/workers.capnp &
sleep 1
failed=$(curl -sv http://localhost:8080 | jq '.failed')
kill $(ps aux | grep 'workerd' | grep -v 'grep' | awk '{print $2}')
echo "WHATEVER"
echo $failed
# test $failed -eq 0
