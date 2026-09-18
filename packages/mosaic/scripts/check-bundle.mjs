import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distFile = resolve(import.meta.dirname, '../dist/index.js');
const source = await readFile(distFile, 'utf8');

if (!source.startsWith("'use client';") && !source.startsWith('"use client";')) {
  throw new Error("Published Mosaic JS is missing a top-level 'use client' boundary.");
}

const forbidden = [
  { name: '@clerk/ui', pattern: /(?:from|import)\s*['"]@clerk\/ui(?:\/[^'"]*)?['"]/ },
  { name: '@clerk/headless', pattern: /(?:from|import)\s*['"]@clerk\/headless(?:\/[^'"]*)?['"]/ },
  { name: 'Emotion', pattern: /(?:from|import)\s*['"]@emotion\// },
  { name: 'StyleX', pattern: /(?:from|import)\s*['"]@stylexjs\// },
];

const hits = forbidden.filter(({ pattern }) => pattern.test(source)).map(({ name }) => name);

if (hits.length > 0) {
  throw new Error(`Published Mosaic JS still references ${hits.join(', ')}.`);
}

if (!/(?:from|import)\s*['"]@clerk\/shared(?:\/[^'"]*)?['"]/.test(source)) {
  throw new Error(
    'Published Mosaic JS does not import @clerk/shared; Clerk context would not resolve from the host SDK.',
  );
}

console.log(
  '✅ Mosaic bundle is client-boundaried, imports @clerk/shared, and is free of UI, Headless, Emotion, and StyleX runtime imports',
);
