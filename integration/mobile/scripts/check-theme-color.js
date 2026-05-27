#!/usr/bin/env node
/**
 * Asserts that a Maestro screenshot contains a meaningful REGION of the
 * expected theme color — proving the Expo config plugin actually delivered
 * clerk-theme.json through to the rendered native component.
 *
 * Why region-count instead of sampling a single (x,y) pixel:
 *   - Pixel coordinates are device/resolution-specific; the CI sim and a local
 *     sim render at different sizes, so a hardcoded (x,y) is inherently flaky.
 *   - The themed primary button is a large, solid block of the theme color.
 *     A themed screenshot has tens of thousands of matching pixels; an
 *     UN-themed one (default neutral button) has ~none. Counting matching
 *     pixels is robust to layout shifts and resolution and catches the exact
 *     regression we care about: "the theme never reached the native layer".
 *
 * This runs as a Node POST-STEP in the runner (run-ios.sh / run-android.sh)
 * AFTER Maestro captures the screenshot — NOT as a Maestro `runScript`, whose
 * GraalJS sandbox has no `fs`/`require` and cannot decode a PNG.
 *
 * Usage:
 *   node check-theme-color.js \
 *     --image=/path/to/screenshot.png \
 *     --expected=#FF4444 \
 *     --tolerance=24 \
 *     --min-pixels=8000
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

function main() {
  const args = parseArgs(process.argv);
  for (const key of ['image', 'expected']) {
    if (args[key] == null) {
      console.error(`Missing required arg: --${key}`);
      process.exit(2);
    }
  }

  const expected = hexToRgb(args.expected);
  // Per-channel max delta. The themed button is a flat fill, so a tight-ish
  // tolerance still leaves a huge matching region while excluding unrelated UI.
  const tolerance = Number(args.tolerance ?? 24);
  // Minimum number of matching pixels for the assertion to pass. The themed
  // primary button is a large block; an un-themed screenshot has effectively
  // none. 8000 is comfortably above noise and below the button's true area.
  const minPixels = Number(args['min-pixels'] ?? 8000);

  if (!fs.existsSync(args.image)) {
    console.error(`Image not found: ${args.image}`);
    process.exit(2);
  }

  let PNG;
  try {
    ({ PNG } = require('pngjs'));
  } catch (err) {
    console.error('pngjs not found. Run `npm install` in integration/mobile/scripts.');
    process.exit(2);
  }

  const png = PNG.sync.read(fs.readFileSync(args.image));
  let matched = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (
      Math.abs(png.data[i] - expected.r) <= tolerance &&
      Math.abs(png.data[i + 1] - expected.g) <= tolerance &&
      Math.abs(png.data[i + 2] - expected.b) <= tolerance
    ) {
      matched++;
    }
  }

  const total = png.width * png.height || 1;
  const ratio = ((matched / total) * 100).toFixed(2);
  const rel = path.relative(process.cwd(), args.image);
  console.log(
    `[${rel}] ${png.width}x${png.height}; matched ${matched}px (${ratio}%) within +/-${tolerance} of ${args.expected}; need >=${minPixels}`,
  );

  if (matched < minPixels) {
    console.error(
      `THEME ASSERTION FAILED: only ${matched}px match ${args.expected} (need >=${minPixels}). ` +
        `The theme likely never reached the native layer.`,
    );
    process.exit(1);
  }
}

main();
