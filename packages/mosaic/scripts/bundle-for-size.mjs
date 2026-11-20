import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { build } from 'rolldown';

const packageDir = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(await readFile(resolve(packageDir, 'package.json'), 'utf8'));
const externals = Object.keys({ ...packageJson.dependencies, ...packageJson.peerDependencies });

await bundle('eager', true);
await bundle('total', false);

function bundle(name, codeSplitting) {
  return build({
    input: resolve(packageDir, 'dist/index.js'),
    platform: 'browser',
    external: id => externals.some(external => id === external || id.startsWith(`${external}/`)),
    output: {
      dir: resolve(packageDir, 'dist/.bundlewatch', name),
      entryFileNames: '[name].js',
      format: 'esm',
      codeSplitting,
    },
    logLevel: 'warn',
  });
}
