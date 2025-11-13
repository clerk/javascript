import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { globby } from 'globby';
import { run } from 'jscodeshift/src/Runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runCodemod(transform = 'transform-async-request', glob, options) {
  if (!transform) {
    throw new Error('No transform provided');
  }
  const resolvedPath = resolve(__dirname, `${transform}.cjs`);

  const paths = await globby(glob, {
    ignore: [
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
      '**/*.(ico|png|webp|svg|gif|jpg|jpeg)+', // common image files
      '**/*.(mp4|mkv|wmv|m4v|mov|avi|flv|webm|flac|mka|m4a|aac|ogg)+', // common video files] }).then(files => {
      '**/*.(css|scss|sass|less|styl)+', // common style files
    ],
  });

  return await run(resolvedPath, paths ?? [], {
    dry: false,
    ...options,
    // we must silence stdout to prevent output from interfering with ink CLI
    silent: true,
  });
}
