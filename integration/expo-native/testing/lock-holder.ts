import { appendFileSync } from 'node:fs';
import { openWorkspace } from '../src/core/workspace.ts';

const [packageDir, home, log, startAt, mode] = process.argv.slice(2) as [string, string, string, string, string];
const workspace = openWorkspace({ packageDir, worktree: packageDir, home });
while (Date.now() < Number(startAt)) await new Promise((resolve) => setTimeout(resolve, 1));
await workspace.withAcquireLock('ios', async () => {
  if (mode === 'crash') process.kill(process.pid, 'SIGKILL');
  appendFileSync(log, `enter ${process.pid}\n`);
  await new Promise((resolve) => setTimeout(resolve, 100));
  appendFileSync(log, `exit ${process.pid}\n`);
});
