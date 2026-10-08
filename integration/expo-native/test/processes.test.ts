import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { isAlive } from '../src/core/exec.ts';
import { openProcesses, stopProcesses } from '../src/core/ledgers.ts';
import { newEntryId, openWorkspace } from '../src/core/workspace.ts';

const startedAt = (pid: number) => Date.parse(execFileSync('ps', ['-o', 'lstart=', '-p', String(pid)], { encoding: 'utf8' }).trim());

function sleeper(): ChildProcess {
  return spawn('sleep', ['30'], { stdio: 'ignore' });
}

async function exited(child: ChildProcess, ms: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return true;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), ms);
    child.on('exit', () => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}

describe('stopProcesses', () => {
  it('stops any ledgered process that is still the same process, whatever its command', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-procs-'));
    const workspace = openWorkspace({ packageDir: dir, worktree: dir, home: join(dir, 'home') });
    const recorder = sleeper();
    const reused = sleeper();
    await new Promise((resolve) => setTimeout(resolve, 200));
    workspace.append({ id: newEntryId(), kind: 'process', what: 'recorder', pid: recorder.pid!, startedAt: new Date(startedAt(recorder.pid!)).toISOString() });
    workspace.append({ id: newEntryId(), kind: 'process', what: 'agent-device', pid: reused.pid!, startedAt: new Date(startedAt(reused.pid!) - 3_600_000).toISOString() });
    const stopped = stopProcesses(workspace, openProcesses(workspace));
    assert.deepEqual(stopped, [`recorder ${recorder.pid}`, `agent-device ${reused.pid} had already exited`]);
    assert.equal(await exited(recorder, 2000), true, 'the ledgered recorder was signalled');
    assert.equal(isAlive(reused.pid!), true, 'a pid whose start time does not match is left alone');
    assert.deepEqual(workspace.unclosedEntries(), []);
    reused.kill();
  });
});
