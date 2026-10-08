import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { VerifyFailure, type EvidencePath, type Recording } from '../src/core/types.ts';
import { endRun } from '../src/core/verbs.ts';
import { newEntryId, openWorkspace } from '../src/core/workspace.ts';

describe('endRun', () => {
  it('stops the broker, removes scratch, and closes the recorder entry even when the recorder fails, then reports the failure', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-end-'));
    const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
    const { scratch } = workspace.newRun();
    const recorderEntry = newEntryId();
    workspace.append({ id: recorderEntry, kind: 'process', what: 'recorder', pid: 1, startedAt: new Date().toISOString() });
    let brokerStopped = false;
    const recording: Recording = {
      process: { pid: 1, startedAt: 0 },
      stop: async (): Promise<EvidencePath> => {
        throw new VerifyFailure('NOT_READY', 'adb pull failed', 'rerun with --no-video');
      },
    };
    await assert.rejects(
      endRun(workspace, { recording, recorderEntry, broker: { stop: async () => void (brokerStopped = true) }, scratch }),
      { code: 'NOT_READY', message: 'adb pull failed' },
    );
    assert.equal(brokerStopped, true, 'broker stopped');
    assert.equal(existsSync(scratch), false, 'scratch, with the broker token, removed');
    assert.deepEqual(workspace.unclosedEntries(), [], 'recorder entry closed');
  });
});
