import { EdgeRuntime } from 'edge-runtime';
import fs from 'node:fs';
import * as url from 'url';
import * as path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const script = fs.readFileSync(path.join(__dirname, 'bundle.js'), 'utf8');

const runtime = new EdgeRuntime({
  extend: context => {
    // context.process = {
    //   env: {},
    // };

    return context;
  },
});

try {
  await runtime.evaluate(script);
} catch (err) {
  console.error(err);
  process.exit(1);
}
