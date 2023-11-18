import fs from 'node:fs';
import { exit } from 'node:process';

import { EdgeRuntime } from 'edge-runtime';
import * as path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const script = fs.readFileSync(path.join(__dirname, 'bundle.js'), 'utf8');

const runtime = new EdgeRuntime();

const stats = await runtime.evaluate(script);

if (stats.failed > 0) {
  exit(1);
}
