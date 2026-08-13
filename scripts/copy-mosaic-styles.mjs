#!/usr/bin/env node

/**
 * Copies `@clerk/ui`'s built Mosaic stylesheet into the calling package's dist, so an SDK can
 * export it under its own name (`@clerk/nextjs/experimental/mosaic/styles.css`).
 *
 * Copied rather than re-exported through a path into `node_modules`: pnpm's layout gives no stable
 * relative path from one package to another's files, so an export pointing there resolves only by
 * luck of hoisting.
 *
 * Usage: node ../../scripts/copy-mosaic-styles.mjs <dest-relative-to-cwd>
 */

import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const dest = resolve(process.cwd(), process.argv[2]);
const source = createRequire(`${process.cwd()}/`).resolve('@clerk/ui/experimental/mosaic/styles.css');

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(source, dest);

console.log(`✅ Copied the Mosaic stylesheet to ${process.argv[2]}`);
