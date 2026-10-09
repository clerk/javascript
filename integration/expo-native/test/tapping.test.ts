import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { busyWaits } from '../specs/support/busy-runner.ts';
import { tapOnceUncovered } from '../specs/support/tapping.ts';

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
