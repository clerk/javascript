import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

const distDir = resolve(import.meta.dirname, '../dist');
const jsFiles = (await readdir(distDir, { recursive: true })).filter(file => file.endsWith('.js'));
const sources = await Promise.all(jsFiles.map(file => readFile(resolve(distDir, file), 'utf8')));
const packageJson = JSON.parse(await readFile(resolve(import.meta.dirname, '../package.json'), 'utf8'));
const entryFiles = Object.entries(packageJson.exports)
  .filter(([subpath]) => subpath === '.' || /^\.\/(components|primitives)\//.test(subpath))
  .map(([, target]) => target)
  .map(target => (typeof target === 'string' ? target : target.import))
  .filter(file => file?.endsWith('.js'))
  .map(file => resolve(import.meta.dirname, '..', file));

const isClientModule = source => source.startsWith("'use client';") || source.startsWith('"use client";');
const importsOf = source =>
  [...source.matchAll(/^import\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["'];?$/gm)].map(m => m[1]);
const importsReact = source =>
  importsOf(source).some(specifier => specifier === 'react' || specifier.startsWith('react/'));
const code = source =>
  source
    .replace(/\/\/.*$/gm, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

const checkNamespaceEntry = async (entryFile, source) => {
  const display = relative(distDir, entryFile);
  const lines = code(source);
  const namespaceImport = /^import \{ (\w+) \} from "(\.[^"]+)";$/;
  const namespaceExport = /^export \{ (\w+ as \w+(?:, \w+ as \w+)*) \};$/;
  if (!lines.every(line => namespaceImport.test(line) || namespaceExport.test(line))) {
    throw new Error(
      `Published Mosaic JS entry ${display} must start with 'use client' or contain only \`export * as\` namespace re-exports.`,
    );
  }
  for (const line of lines.filter(line => namespaceImport.test(line))) {
    const [, binding, specifier] = line.match(namespaceImport);
    const partsFile = resolve(dirname(entryFile), specifier);
    const parts = await readFile(partsFile, 'utf8');
    if (isClientModule(parts) || !new RegExp(`^var ${binding} = /\\* @__PURE__ \\*/ __exportAll\\(`, 'm').test(parts)) {
      throw new Error(
        `${display} imports ${binding} from ${relative(distDir, partsFile)}, which must be a namespace object with no directive.`,
      );
    }
    for (const leafSpecifier of importsOf(parts).filter(specifier => specifier.startsWith('.'))) {
      const leafFile = resolve(dirname(partsFile), leafSpecifier);
      const leaf = await readFile(leafFile, 'utf8');
      if (importsReact(leaf) && !isClientModule(leaf)) {
        throw new Error(
          `${relative(distDir, leafFile)}, re-exported by the namespace ${relative(distDir, partsFile)}, imports React but is missing a top-level 'use client' boundary.`,
        );
      }
    }
  }
};

for (const entryFile of entryFiles) {
  const source = await readFile(entryFile, 'utf8');
  if (!isClientModule(source)) {
    await checkNamespaceEntry(entryFile, source);
  }
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
