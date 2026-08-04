#!/usr/bin/env node

/**
 * The `build:mosaic` entry is published as `@clerk/ui/experimental/mosaic` and mounted directly in
 * host apps, so it must stay Emotion-free: pulling `@emotion/react` in ships a second styling
 * runtime to every consumer. Nothing about the barrel enforces that — one legacy component reached
 * from the graph (an `sx` prop, a `Box`, a `keyframes`) drags it back in silently. This fails the
 * build instead.
 */

import { readFileSync } from 'node:fs';

const BUNDLE = new URL('../dist-mosaic/index.js', import.meta.url);

const source = readFileSync(BUNDLE, 'utf8');
const offenders = source.split('\n').filter(line => line.includes('@emotion'));

if (offenders.length > 0) {
  console.error(`Found Emotion in the Mosaic build output (dist-mosaic/index.js):\n${offenders.join('\n')}`);
  process.exit(1);
}

console.log('✅ No Emotion found in the Mosaic build output');
