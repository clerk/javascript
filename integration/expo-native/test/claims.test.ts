import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { freeSlot, isOrphaned, readClaim, takeSlot } from '../src/core/claims.ts';
import { currentProcess, isRunning } from '../src/core/exec.ts';

const taker = join(import.meta.dirname, '..', 'testing', 'claim-taker.ts');

function take(dir: string, worktree: string, startAt: number, from: number): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [taker, dir, worktree, String(startAt), String(from)], (error, stdout) => (error === null ? resolve(stdout) : reject(error)));
  });
}

describe('device claims', () => {
  it('lets only one of several processes take an orphaned slot', async () => {
    for (let round = 0; round < 4; round += 1) {
      const dir = mkdtempSync(join(tmpdir(), 'verify-claims-'));
      const gone = mkdtempSync(join(tmpdir(), 'verify-gone-'));
      const orphan = takeSlot(dir, 'ios', 1, 0, gone)!;
      rmSync(gone, { recursive: true });
      assert.equal(isOrphaned({ ...orphan, owner: { pid: 1, startedAt: 0 } }), true);
      const startAt = Date.now() + 1500;
      const results = await Promise.all(Array.from({ length: 6 }, (_, i) => take(dir, join(dir, `worktree-${i}`), startAt, orphan.gen)));
      assert.equal(results.filter((r) => r === 'won').length, 1, `round ${round}: ${results.join(' ')}`);
    }
  });

  it('never lets a stale holder overwrite or free a slot another worktree now holds', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-claims-'));
    const first = takeSlot(dir, 'ios', 1, 0, '/worktrees/a')!;
    assert.equal(freeSlot(dir, first), true);
    const second = takeSlot(dir, 'ios', 1, readClaim(dir, 'ios', 1).gen, '/worktrees/b')!;
    assert.equal(takeSlot(dir, 'ios', 1, first.gen, '/worktrees/a'), null, 'a retake from a stale generation fails');
    assert.equal(freeSlot(dir, first), false, 'a stale free fails');
    assert.equal(readClaim(dir, 'ios', 1).claim?.nonce, second.nonce);
  });

  it('treats a reused pid as a different process', () => {
    const me = currentProcess();
    assert.equal(isRunning(me), true);
    assert.equal(isRunning({ pid: me.pid, startedAt: me.startedAt - 3_600_000 }), false);
  });
});
