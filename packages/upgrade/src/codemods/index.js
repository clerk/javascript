import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { globby } from 'globby';
import { run } from 'jscodeshift/src/Runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GLOBBY_IGNORE = [
  '**/*.md',
  'node_modules/**',
  '**/node_modules/**',
  '.git/**',
  '**/*.json',
  'package.json',
  '**/package.json',
  'package-lock.json',
  '**/package-lock.json',
  'yarn.lock',
  '**/yarn.lock',
  'pnpm-lock.yaml',
  '**/pnpm-lock.yaml',
  'yalc.lock',
  '**/*.(ico|png|webp|svg|gif|jpg|jpeg)+',
  '**/*.(mp4|mkv|wmv|m4v|mov|avi|flv|webm|flac|mka|m4a|aac|ogg)+',
  '**/*.(css|scss|sass|less|styl)+',
];

export async function runCodemod(transform = 'transform-async-request', glob, options = {}) {
  if (!transform) {
    throw new Error('No transform provided');
  }
  const resolvedPath = resolve(__dirname, `${transform}.cjs`);

  const paths = await globby(glob, { ignore: GLOBBY_IGNORE });

  // First pass: dry run to collect stats (jscodeshift only reports stats in dry mode)
  const dryResult = await run(resolvedPath, paths ?? [], {
    ...options,
    dry: true,
    silent: true,
  });

  // Second pass: apply the changes
  const result = await run(resolvedPath, paths ?? [], {
    ...options,
    dry: false,
    silent: true,
  });

  // Merge stats from dry run into final result
  return {
    ...result,
    stats: dryResult.stats,
  };
}
