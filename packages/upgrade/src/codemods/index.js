import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { run } from 'jscodeshift/src/Runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runCodemod(transform = 'transform-async-request', paths, options) {
  const resolvedPath = resolve(__dirname, `${transform}.js`);

  return await run(resolvedPath, paths ?? [], {
    dry: true,
    ...options,
    // we must silence stdout to prevent output from interfering with ink CLI
    silent: true,
  });
}
