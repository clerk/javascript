import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { busyWaits } from '../specs/support/busy-runner.ts';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tapMarker } from '../specs/support/evidence.ts';
import { atItsMiddle, backControl, tapMarkedOnceUncovered, tapOnceUncovered } from '../specs/support/tapping.ts';
import { readTaps } from '../src/core/video.ts';

const REFUSED = 'perform tap failed: Ref @e5 is covered by another visible element and cannot be tapped safely';

function taps(outcomes: readonly (string | null)[]) {
  let clock = 0;
  let tapped = 0;
  return {
    count: () => tapped,
    tap: async () => {
      const outcome = outcomes[Math.min(tapped, outcomes.length - 1)]!;
      tapped += 1;
      if (outcome !== null) throw new Error(outcome);
    },
    settle: (timeoutMs: number) => ({ timeoutMs, now: () => clock, wait: async () => void (clock += 400) }),
  };
}

describe('a tap on a control that a screen transition still covers', () => {
  it('taps again once the transition has uncovered the control', async () => {
    const control = taps([REFUSED, REFUSED, null]);
    await tapOnceUncovered(control.tap, control.settle(20_000));
    assert.equal(control.count(), 3);
  });

  it('taps once when nothing covers the control', async () => {
    const control = taps([null]);
    await tapOnceUncovered(control.tap, control.settle(20_000));
    assert.equal(control.count(), 1);
  });

  it('fails with the refusal when the control stays covered past the timeout', async () => {
    const control = taps([REFUSED]);
    await assert.rejects(tapOnceUncovered(control.tap, control.settle(1_000)), /covered by another visible element/);
    assert.equal(control.count(), 4);
  });

  it('does not repeat a tap that failed for another reason', async () => {
    const control = taps(['LOCATOR_NOT_FOUND', null]);
    await assert.rejects(tapOnceUncovered(control.tap, control.settle(20_000)), /LOCATOR_NOT_FOUND/);
    assert.equal(control.count(), 1);
  });
});

describe('a tap that the iOS runner refuses because it is still finishing an earlier command', () => {
  const BUSY = 'ENGINE_FAILURE: perform tap failed: the iOS automation runner is still finishing a command that overran its watchdog (session e2e-ios-0 on iPhone 17 Pro). The app is fine. Wait a few seconds and rerun.';
  const waiting = (retries: number) => {
    const waits: number[] = [];
    return { waits, busy: busyWaits(retries, async () => void waits.push(waits.length + 1)) };
  };

  it('taps again after a wait, and passes when the second tap lands', async () => {
    const control = taps([BUSY, null]);
    const { waits, busy } = waiting(6);
    await tapOnceUncovered(control.tap, control.settle(20_000), busy);
    assert.deepEqual([control.count(), waits.length], [2, 1]);
  });

  it('stops at the bound and fails with the refusal', async () => {
    const control = taps([BUSY]);
    const { waits, busy } = waiting(6);
    await assert.rejects(tapOnceUncovered(control.tap, control.settle(20_000), busy), (error: Error) => error.message === BUSY);
    assert.deepEqual([control.count(), waits.length], [7, 6]);
  });

  it('fails at once when no wait is allowed, and for any other engine failure', async () => {
    const unwaited = taps([BUSY, null]);
    await assert.rejects(tapOnceUncovered(unwaited.tap, unwaited.settle(20_000)), /still finishing a command/);
    assert.equal(unwaited.count(), 1);
    const other = taps(["ENGINE_FAILURE: perform tap failed: the iOS automation runner's main thread overran its watchdog on this command", null]);
    const { waits, busy } = waiting(6);
    await assert.rejects(tapOnceUncovered(other.tap, other.settle(20_000), busy), /main thread overran its watchdog/);
    assert.deepEqual([other.count(), waits.length], [1, 0]);
  });

  it('keeps waiting out a screen transition after the runner is free again', async () => {
    const control = taps([BUSY, REFUSED, REFUSED, null]);
    const { waits, busy } = waiting(6);
    await tapOnceUncovered(control.tap, control.settle(20_000), busy);
    assert.deepEqual([control.count(), waits.length], [4, 1]);
  });
});

describe('the mark of a tap that a transition covered at first', () => {
  it('has the box the control had at the attempt that landed, not before the wait', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'verify-marks-')), 'evidence-marks.jsonl');
    const control = taps([REFUSED, null]);
    const boxes = [{ x: 0, y: 900, width: 100, height: 40 }, { x: 0, y: 500, width: 100, height: 40 }];
    let reads = 0;
    const moving = { boundingBox: async () => boxes[Math.min(reads++, boxes.length - 1)]!, tap: control.tap };
    await tapMarkedOnceUncovered(moving, tapMarker({ marksFile: file, now: () => 7_000 }), control.settle(5_000));
    assert.equal(control.count(), 2);
    assert.deepEqual(readTaps(file), [{ sentAt: 7_000, tappedAt: 7_000, x: 50, y: 520 }]);
  });
});

describe('a back that a user sees', () => {
  it('taps the middle of the navigation back button on iOS and of the top bar back arrow on Android, and marks it like any tap', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'verify-marks-')), 'evidence-marks.jsonl');
    const found: string[] = [];
    const tapped: unknown[] = [];
    const control = (query: string) => (found.push(query), { boundingBox: async () => ({ x: 8, y: 60, width: 44, height: 24 }), tap: async (options: unknown) => void tapped.push(options) });
    const screen = { getByTestId: (id: string) => control(`test id ${id}`), getByLabel: (label: string) => control(`label ${label}`) };
    const settle = { timeoutMs: 5_000, now: () => 0, wait: async () => undefined };
    for (const platform of ['ios', 'android'] as const) await tapMarkedOnceUncovered(atItsMiddle(backControl(screen, platform)), tapMarker({ marksFile: file, now: () => 7_000 }), settle);
    assert.deepEqual(found, ['test id BackButton', 'label Back']);
    assert.deepEqual(tapped, [{ timeout: 5_000, position: { x: 22, y: 12 } }, { timeout: 5_000, position: { x: 22, y: 12 } }]);
    assert.deepEqual(readTaps(file), [{ sentAt: 7_000, tappedAt: 7_000, x: 30, y: 72 }, { sentAt: 7_000, tappedAt: 7_000, x: 30, y: 72 }]);
  });
});
