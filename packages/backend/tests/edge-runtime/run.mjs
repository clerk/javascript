import { EdgeRuntime } from 'edge-runtime';
import { exit } from 'node:process';
import fs from 'node:fs';
import * as url from 'url';
import * as path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const script = fs.readFileSync(path.join(__dirname, 'bundle.js'), 'utf8');

const runtime = new EdgeRuntime();

const stats = await runtime.evaluate(script);

if (stats.failed > 0) {
  exit(1);
}
