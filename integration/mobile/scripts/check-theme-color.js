#!/usr/bin/env node
/**
 * Reads a Maestro screenshot file and asserts that a sampled pixel color
 * is within tolerance of an expected hex color.
 *
 * Used by `flows/theming/custom-theme-applied.yaml` to verify that the
 * Clerk native components actually render with the user-provided theme
 * (regression for the bug where `Clerk.initialize()` was resetting the
 * customTheme on Android).
 *
 * Usage:
 *   node check-theme-color.js \
 *     --image=/path/to/screenshot.png \
 *     --x=200 --y=400 \
 *     --expected=#FF4444 \
 *     --tolerance=15
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const [k, v] = raw.replace(/^--/, '').split('=');
    args[k] = v;
  }
  return args;
}

function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) {
    throw new Error(`Expected 6-char hex, got ${hex}`);
  }
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function colorDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

async function main() {
  const args = parseArgs(process.argv);
  const required = ['image', 'x', 'y', 'expected'];
  for (const key of required) {
    if (args[key] == null) {
      console.error(`Missing required arg: --${key}`);
      process.exit(2);
    }
  }

  const tolerance = Number(args.tolerance ?? 15);
  const expected = hexToRgb(args.expected);
  const x = Number(args.x);
  const y = Number(args.y);

  if (!fs.existsSync(args.image)) {
    console.error(`Image not found: ${args.image}`);
    process.exit(2);
  }

  // pngjs is a small zero-dep PNG decoder; install with the test app's deps.
  // We require it lazily so the script fails with a clear message if missing.
  let PNG;
  try {
    ({ PNG } = require('pngjs'));
  } catch (err) {
    console.error('pngjs not found. Install it in the test app: pnpm add -D pngjs');
    process.exit(2);
  }

  const buf = fs.readFileSync(args.image);
  const png = PNG.sync.read(buf);
  const idx = (png.width * y + x) << 2;
  const actual = {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
  };

  const distance = colorDistance(expected, actual);
  const relativeImage = path.relative(process.cwd(), args.image);
  console.log(
    `[${relativeImage}] sampled (${x},${y}) = rgb(${actual.r},${actual.g},${actual.b}); ` +
      `expected ${args.expected}; distance=${distance.toFixed(1)}; tolerance=${tolerance}`,
  );

  if (distance > tolerance) {
    console.error(`THEME ASSERTION FAILED: pixel at (${x},${y}) is more than ${tolerance} away from ${args.expected}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(2);
});
