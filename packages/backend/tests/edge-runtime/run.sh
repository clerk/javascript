#!/bin/bash
current_folder=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

in_file="$current_folder/bundle.ts"
out_file="$current_folder/bundle.js"

npx esbuild \
  --bundle \
  --format=esm \
  --log-level=warning \
  --minify-syntax \
  --outfile=$out_file \
  --target=esnext \
  $in_file

node "$current_folder/run.mjs"

