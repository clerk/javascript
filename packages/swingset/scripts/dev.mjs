import { spawn } from 'node:child_process';

import getPort from 'get-port';

const start = Number(process.env.PORT) || 6006;
const port = await getPort({ port: getPort.makeRange(start, start + 100) });

const child = spawn('next', ['dev', '--port', String(port), ...process.argv.slice(2)], { stdio: 'inherit' });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.removeAllListeners(signal);
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
