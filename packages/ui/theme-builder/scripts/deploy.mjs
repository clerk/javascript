#!/usr/bin/env zx
/* eslint-disable */
import 'zx/globals';

process.env.FORCE_COLOR = '1';

if ((await which('vercel', { nothrow: true })) === null) {
  echo('Vercel CLI not found. Please install it by running `npm i -g vercel`');
  process.exit(1);
}

// build top-level
await within(async () => {
  // repo root
  cd('../../../');

  // turbo build
  await spinner('Building dependencies...', () => $`pnpm turbo build --filter=@clerk/ui...`);
});

await $`vercel pull`;

// Build
const prod = argv.prod;

await spinner('Building application...', () => $`vercel build ${prod ? '--prod' : ''}`);

// Deploy
await $`vercel deploy --prebuilt ${prod ? '--prod' : ''}`;
