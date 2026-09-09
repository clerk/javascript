import { build } from 'rolldown';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(directory, '../..');
const clerk = path.join(repository, 'packages/clerk-js');
for (const [entry, output] of [
  ['src/embedded.ts', 'clerk-core.js'],
  ['test/entry.ts', 'clerk-core-test.js'],
])
  await build({
    input: path.join(directory, entry),
    platform: 'neutral',
    resolve: { alias: { '@': `${clerk}/src` }, mainFields: ['module', 'main'] },
    transform: {
      define: {
        __DEV__: 'false',
        __PKG_VERSION__: JSON.stringify(JSON.parse(fs.readFileSync(`${clerk}/package.json`)).version),
        __PKG_NAME__: '"@clerk/clerk-js"',
        __BUILD_FLAG_KEYLESS_UI__: 'false',
        __BUILD_DISABLE_RHC__: 'false',
        'process.env.NODE_ENV': '"production"',
        'process.env.CLERK_ENV': '"production"',
        'import.meta': '{}',
      },
    },
    plugins: [
      {
        name: 'embedded-source-boundaries',
        resolveId(source, importer) {
          if (source.endsWith('/moduleManager') && importer?.startsWith(`${clerk}/src/`)) {
            return path.join(directory, 'src/moduleManager.ts');
          }
          if (source.startsWith('@clerk/shared/')) {
            const base = path.join(repository, 'packages/shared/src', source.slice('@clerk/shared/'.length));
            for (const suffix of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
              if (fs.existsSync(base + suffix)) return base + suffix;
            }
          }
        },
      },
    ],
    output: { file: path.join(directory, 'dist', output), format: 'iife', name: 'ClerkCore', codeSplitting: false },
  });
