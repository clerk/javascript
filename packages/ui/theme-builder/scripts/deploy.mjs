#!/usr/bin/env zx
/* eslint-disable */
import 'zx/globals';

process.env.FORCE_COLOR = '1';

if ((await which('vercel', { nothrow: true })) === null) {
  echo('Vercel CLI not found. Please install it by running `npm i -g vercel`');
  process.exit(1);
}

// build top-level
within(async () => {
  // repo root
  cd('../../../');

  // turbo build
  await $`npx turbo build --filter=ui...`;
});

// Check for vercel setup
if ((await $`ls .vercel`.exitCode) !== 0) {
  echo('Vercel not setup, running vercel link. Follow the prompts and link with the theme-builder project.');

  await $`vercel link`;
}

const prod = argv.prod;

await $`vercel pull ${prod ? '--prod' : ''}`;

// Build
await $`vercel build ${prod ? '--prod' : ''}`;

// Deploy
await $`vercel deploy --prebuilt ${prod ? '--prod' : ''}`;
