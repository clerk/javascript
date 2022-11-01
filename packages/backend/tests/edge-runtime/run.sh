#!/bin/bash
current_folder=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

in_file="$current_folder/bundle.ts"
out_file="$current_folder/bundle.js"

./node_modules/.bin/esbuild \
  --log-level=warning \
  --format=esm \
  --bundle \
  --minify-syntax \
  --target=esnext \
  --outfile=$out_file \
  $in_file

node -r esbuild-register "$current_folder/tester.mjs"

