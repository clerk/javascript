import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { build } from 'rolldown';

const packageDir = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(await readFile(resolve(packageDir, 'package.json'), 'utf8'));
const externals = Object.keys({ ...packageJson.dependencies, ...packageJson.peerDependencies });

await build({
  input: resolve(packageDir, 'dist/index.js'),
  platform: 'browser',
  external: id => externals.some(name => id === name || id.startsWith(`${name}/`)),
  output: { dir: resolve(packageDir, 'dist/.bundlewatch'), entryFileNames: '[name].js', format: 'esm' },
  logLevel: 'warn',
});
