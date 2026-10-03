import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { isAlive } from '../src/core/exec.ts';
import { stopProcesses } from '../src/core/ledgers.ts';
import { agentDeviceDaemonCheck } from '../src/core/verbs.ts';
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
    const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
    const recorder = sleeper();
    const reused = sleeper();
    await new Promise((resolve) => setTimeout(resolve, 200));
    workspace.append({ id: newEntryId(), kind: 'process', what: 'recorder', pid: recorder.pid!, startedAt: new Date(startedAt(recorder.pid!)).toISOString() });
    workspace.append({ id: newEntryId(), kind: 'process', what: 'agent-device', pid: reused.pid!, startedAt: new Date(startedAt(reused.pid!) - 3_600_000).toISOString() });
    const stopped = stopProcesses(workspace);
    assert.deepEqual(stopped, [`recorder ${recorder.pid}`]);
    assert.equal(await exited(recorder, 2000), true, 'the ledgered recorder was signalled');
    assert.equal(isAlive(reused.pid!), true, 'a pid whose start time does not match is left alone');
    assert.deepEqual(workspace.unclosedEntries(), []);
    reused.kill();
  });
});

describe('agent-device daemon doctor check', () => {
  it('fails when the daemon runs from an install that was removed', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-daemon-'));
    const script = join(dir, 'daemon.js');
    writeFileSync(script, 'setInterval(() => {}, 1000);');
    const daemon = spawn(process.execPath, [script], { stdio: 'ignore' });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lstart = execFileSync('ps', ['-o', 'lstart=', '-p', String(daemon.pid)], { encoding: 'utf8' }).trim();
    const state = join(dir, 'state');
    execFileSync('mkdir', ['-p', state]);
    writeFileSync(join(state, 'daemon.json'), JSON.stringify({ pid: daemon.pid, processStartTime: lstart }));
    try {
      assert.equal(agentDeviceDaemonCheck([state]).ok, true);
      rmSync(script);
      const check = agentDeviceDaemonCheck([state]);
      assert.equal(check.ok, false);
      assert.match(check.fix ?? '', new RegExp(`kill ${daemon.pid}`));
      assert.equal(agentDeviceDaemonCheck([join(dir, 'none')]).ok, true, 'no daemon is fine');
      assert.ok(readFileSync(join(state, 'daemon.json'), 'utf8').length > 0);
    } finally {
      daemon.kill();
    }
  });
});
