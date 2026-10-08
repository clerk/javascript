import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { busyWaits, isRunnerBusy, onceTheRunnerIsFree } from '../specs/support/busy-runner.ts';

const BUSY_TAP =
  'ENGINE_FAILURE: perform tap failed: the iOS automation runner is still finishing a command that overran its watchdog (session e2e-ios-0 on iPhone 17 Pro): The iOS runner is still finishing a previous command that exceeded its execution watchdog (usually an accessibility capture on a heavy or animating screen). The app is fine. Wait a few seconds and rerun.';
const BUSY_TYPE = 'agent-device type failed: Error (COMMAND_FAILED): The iOS runner is still finishing a previous command that exceeded its execution watchdog (usually an accessibility capture on a heavy or animating screen).';
const BUSY_READ = 'APP_UNREACHABLE: snapshot failed: the iOS automation runner is still finishing a command that overran its watchdog (session e2e-ios-0 on iPhone 17 Pro)';

const OTHER_ENGINE_FAILURES = [
  "ENGINE_FAILURE: perform tap failed: the iOS automation runner's main thread overran its watchdog on this command (session e2e-ios-0 on iPhone 17 Pro): main thread execution timed out. The app is fine. Rerun once it has drained.",
  'ENGINE_FAILURE: perform tap failed: the iOS automation runner is wedged: its main thread is stuck in abandoned work. agent-device restarts the runner; rerun.',
  'ENGINE_FAILURE: snapshot failed: the iOS automation runner could not present the accessibility snapshot. Rerun.',
  'agent-device type failed: Error (COMMAND_FAILED): main thread execution timed out',
  'snapshot failed: Daemon request timed out',
  'perform tap failed: Ref @e5 is covered by another visible element and cannot be tapped safely',
  'LOCATOR_NOT_FOUND',
];

function step(outcomes: readonly (string | null)[]) {
  let ran = 0;
  let waited = 0;
  return {
    ran: () => ran,
    waited: () => waited,
    run: async () => {
      const outcome = outcomes[Math.min(ran, outcomes.length - 1)]!;
      ran += 1;
      if (outcome !== null) throw new Error(outcome);
      return 'done';
    },
    busy: (most: number) => busyWaits(most, async () => void (waited += 1)),
  };
}

describe('a step the iOS runner refuses because it is still finishing an earlier command', () => {
  it('knows the refusal as the engine words it for a tap and a screen read, and as agent-device words it for typing', () => {
    for (const message of [BUSY_TAP, BUSY_TYPE, BUSY_READ]) assert.equal(isRunnerBusy(new Error(message)), true, message);
  });

  it('takes no other failure of the engine or of agent-device for it', () => {
    for (const message of OTHER_ENGINE_FAILURES) assert.equal(isRunnerBusy(new Error(message)), false, message);
    assert.equal(isRunnerBusy(BUSY_TAP), false, 'a thrown string is not an engine failure');
  });

  it('runs again after a wait and passes when the second try succeeds', async () => {
    const tap = step([BUSY_TAP, null]);
    assert.equal(await onceTheRunnerIsFree(tap.run, tap.busy(6)), 'done');
    assert.equal(tap.ran(), 2);
    assert.equal(tap.waited(), 1);
  });

  it('runs once and never waits when the runner is free', async () => {
    const tap = step([null]);
    await onceTheRunnerIsFree(tap.run, tap.busy(6));
    assert.deepEqual([tap.ran(), tap.waited()], [1, 0]);
  });

  it('stops at the bound and fails with the first refusal', async () => {
    const tap = step([BUSY_TAP, BUSY_READ]);
    await assert.rejects(onceTheRunnerIsFree(tap.run, tap.busy(6)), (error: Error) => error.message === BUSY_TAP);
    assert.deepEqual([tap.ran(), tap.waited()], [7, 6]);
  });

  it('gives the steps that share one bound that many waits in all, so a runner that stays busy fails each later step at its first refusal', async () => {
    const tap = step([BUSY_TAP]);
    const read = step([BUSY_READ]);
    const oneCall = tap.busy(6);
    await assert.rejects(onceTheRunnerIsFree(tap.run, oneCall), (error: Error) => error.message === BUSY_TAP);
    await assert.rejects(onceTheRunnerIsFree(read.run, oneCall), (error: Error) => error.message === BUSY_READ);
    assert.deepEqual([tap.ran(), read.ran(), tap.waited()], [7, 1, 6]);
  });

  it('does not run again after any other failure, on the first try or on a later one', async () => {
    for (const message of OTHER_ENGINE_FAILURES) {
      const first = step([message, null]);
      await assert.rejects(onceTheRunnerIsFree(first.run, first.busy(6)), (error: Error) => error.message === message);
      assert.deepEqual([first.ran(), first.waited()], [1, 0], message);
    }
    const later = step([BUSY_TAP, 'LOCATOR_NOT_FOUND', null]);
    await assert.rejects(onceTheRunnerIsFree(later.run, later.busy(6)), /LOCATOR_NOT_FOUND/);
    assert.deepEqual([later.ran(), later.waited()], [2, 1]);
  });
});
