#!/bin/bash
./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=tests/cf-miniflare/worker.js \
  tests/cf-miniflare/worker.ts

# ./node_modules/.bin/miniflare tests/cf-miniflare/worker.js -c tests/cf-miniflare/wrangler.toml --debug

node --experimental-vm-modules tests/cf-miniflare/tester.mjs > tests/cf-miniflare/runner.log

node tests/cf-miniflare/reporter.mjs
