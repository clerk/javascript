import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve(import.meta.dirname, '../dist');
const jsFiles = (await readdir(distDir)).filter(file => file.endsWith('.js'));
const sources = await Promise.all(jsFiles.map(file => readFile(resolve(distDir, file), 'utf8')));
const entry = await readFile(resolve(distDir, 'index.js'), 'utf8');

if (!entry.startsWith("'use client';") && !entry.startsWith('"use client";')) {
  throw new Error("Published Mosaic JS is missing a top-level 'use client' boundary.");
}

const forbidden = [
  { name: '@clerk/ui', pattern: /(?:from|import)\s*['"]@clerk\/ui(?:\/[^'"]*)?['"]/ },
  { name: 'Emotion', pattern: /(?:from|import)\s*['"]@emotion\// },
  { name: 'StyleX', pattern: /(?:from|import)\s*['"]@stylexjs\// },
];

const hits = forbidden.filter(({ pattern }) => sources.some(source => pattern.test(source))).map(({ name }) => name);

if (hits.length > 0) {
  throw new Error(`Published Mosaic JS still references ${hits.join(', ')}.`);
}

if (sources.some(source => /^\/\/#region src\/icons\/registry\b/m.test(source))) {
  throw new Error('Published Mosaic JS bundles the icon registry; import glyphs directly so unused ones tree-shake.');
}

if (!sources.some(source => /(?:from|import)\s*['"]@clerk\/shared(?:\/[^'"]*)?['"]/.test(source))) {
  throw new Error(
    'Published Mosaic JS does not import @clerk/shared; Clerk context would not resolve from the host SDK.',
  );
}

if (!sources.some(source => /(?:from|import)\s*['"]@floating-ui\/react(?:\/[^'"]*)?['"]/.test(source))) {
  throw new Error('Published Mosaic JS does not import @floating-ui/react; it should be an external dependency.');
}

console.log(
  '✅ Mosaic bundle is client-boundaried, imports @clerk/shared and @floating-ui/react, and is free of UI, Emotion, and StyleX runtime imports',
);
