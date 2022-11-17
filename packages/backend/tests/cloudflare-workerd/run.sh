#!/bin/bash

current_folder=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

in_file="$current_folder/worker.ts"
out_file="$current_folder/worker.js"

npx esbuild \
  --bundle \
  --format=esm \
  --log-level=warning \
  --minify-syntax \
  --outfile=$out_file \
  --target=esnext \
  $in_file

# Thanks to https://github.com/panva/jose
npx workerd serve --verbose "$current_folder/workers.capnp" &
sleep 1
failed=$(curl -sv http://localhost:8080 | jq '.failed')
kill $(ps aux | grep 'workerd' | grep -v 'grep' | awk '{print $2}')
echo "WHATEVER"
echo $failed
test $failed -eq 0
