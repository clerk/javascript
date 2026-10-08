import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { VerifyFailure } from '../src/core/types.ts';
import { takeSlotLock } from '../src/core/workspace.ts';

const holder = join(import.meta.dirname, '..', 'testing', 'lock-holder.ts');

function runHolder(packageDir: string, home: string, log: string, startAt: number, mode: 'hold' | 'crash'): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [holder, packageDir, home, log, String(startAt), mode], { stdio: 'ignore' });
    child.on('close', (code) => resolve(code));
  });
}

describe('acquire lock', () => {
  it('takes a lock whose file was cut short, which no running command can have left', async () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'verify-lock-')), 'lock');
    mkdirSync(dir);
    writeFileSync(join(dir, '000000000001'), '{"pid":123,"star');
    const busy = () => new VerifyFailure('DEVICE_BUSY', 'the lock is taken', '');
    const release = await takeSlotLock(dir, 0, busy);
    await assert.rejects(takeSlotLock(dir, 0, busy), { code: 'DEVICE_BUSY' });
    release();
    (await takeSlotLock(dir, 0, busy))();
  });

  it('lets exactly one of several processes break a stale lock at a time', async () => {
    for (let round = 0; round < 4; round += 1) {
      const packageDir = mkdtempSync(join(tmpdir(), 'verify-lock-'));
      const home = join(packageDir, 'home');
      const log = join(packageDir, 'log');
      writeFileSync(log, '');
      await runHolder(packageDir, home, log, 0, 'crash');
      const startAt = Date.now() + 1500;
      const codes = await Promise.all(Array.from({ length: 6 }, () => runHolder(packageDir, home, log, startAt, 'hold')));
      assert.deepEqual(codes, [0, 0, 0, 0, 0, 0]);
      const lines = readFileSync(log, 'utf8').trim().split('\n');
      assert.equal(lines.length, 12, `round ${round}: every holder entered once`);
      for (let i = 0; i < lines.length; i += 2) {
        const [enter, pid] = lines[i]!.split(' ');
        assert.equal(enter, 'enter', `round ${round}: two holders overlapped:\n${lines.join('\n')}`);
        assert.equal(lines[i + 1], `exit ${pid}`, `round ${round}: two holders overlapped:\n${lines.join('\n')}`);
      }
    }
  });
});
