import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { tapOnceUncovered } from '../src/core/tapping.ts';

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
