import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

const packageDir = resolve(process.argv[2] ?? resolve(import.meta.dirname, '..'));
const distDir = resolve(packageDir, 'dist');
const jsFiles = (await readdir(distDir, { recursive: true })).filter(file => file.endsWith('.js'));
const sources = await Promise.all(jsFiles.map(file => readFile(resolve(distDir, file), 'utf8')));
const packageJson = JSON.parse(await readFile(resolve(packageDir, 'package.json'), 'utf8'));
const entryFile = target => resolve(packageDir, typeof target === 'string' ? target : target.import);
const unitEntryFiles = Object.entries(packageJson.exports)
  .filter(([subpath]) => /^\.\/(components|primitives)\//.test(subpath))
  .map(([, target]) => entryFile(target));
const hookEntryFiles = Object.entries(packageJson.exports)
  .filter(([subpath]) => subpath.startsWith('./hooks/'))
  .map(([, target]) => entryFile(target));
const glyphEntryFiles = Object.entries(packageJson.exports)
  .filter(([subpath]) => subpath.startsWith('./icons/glyphs/'))
  .map(([, target]) => entryFile(target));
const entryFiles = [entryFile(packageJson.exports['.']), ...unitEntryFiles, ...hookEntryFiles, ...glyphEntryFiles];

const isClientModule = source => source.startsWith("'use client';") || source.startsWith('"use client";');
const importsOf = source =>
  [...source.matchAll(/^(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["'];?$/gm)].map(m => m[1]);

const visited = new Set();
const checkServerGraph = async (file, entry) => {
  if (visited.has(file)) {
    return;
  }
  visited.add(file);
  const source = await readFile(file, 'utf8');
  if (isClientModule(source)) {
    return;
  }
  for (const specifier of importsOf(source)) {
    if (!specifier.startsWith('.')) {
      throw new Error(
        `${relative(distDir, file)} is reached from ${relative(distDir, entry)} without a 'use client' module in between, and imports ${specifier}. Start it with 'use client', or move the import into a 'use client' module.`,
      );
    }
    await checkServerGraph(resolve(dirname(file), specifier), entry);
  }
};

for (const file of entryFiles) {
  const source = await readFile(file, 'utf8');
  if (isClientModule(source) && unitEntryFiles.includes(file)) {
    throw new Error(
      `Published Mosaic JS entry ${relative(distDir, file)} starts with 'use client'; put the boundary on the modules it re-exports instead.`,
    );
  }
  if (!isClientModule(source) && glyphEntryFiles.includes(file)) {
    throw new Error(
      `Published Mosaic glyph ${relative(distDir, file)} does not start with 'use client'; a Server Component cannot pass it to Icon otherwise.`,
    );
  }
  await checkServerGraph(file, file);
}

const nodeModulesPaths = (await readdir(distDir, { recursive: true })).filter(file =>
  file.split(/[\\/]/).includes('node_modules'),
);
if (nodeModulesPaths.length > 0) {
  throw new Error(
    `Published Mosaic output has files under a node_modules path, which consumers cannot resolve: ${nodeModulesPaths.join(', ')}`,
  );
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
