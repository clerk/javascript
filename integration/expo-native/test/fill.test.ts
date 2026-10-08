import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { busyWaits } from '../specs/support/busy-runner.ts';
import { fillField, type FillDevice, type NamedField } from '../specs/support/fill.ts';
import type { Platform } from '../specs/support/types.ts';

const BUSY = 'ENGINE_FAILURE: perform tap failed: the iOS automation runner is still finishing a command that overran its watchdog (session e2e-ios-0 on iPhone 17 Pro)';

interface BusyRunner {
  readonly tap?: number;
  readonly read?: number;
  readonly type?: number;
  readonly replace?: number;
}

interface Screen {
  texts(): readonly string[];
  afterTyping?(held: string): string;
}

const CODE = '424242';
const resendIn = (seconds: number): string => `Didn't receive a code? Resend (${seconds})`;
const EMAIL_CODE_SCREEN = ['Check your email', 'someone+clerk_test@example.com', resendIn(30)];
const PHONE_CODE_SCREEN = ['Check your phone', '+1 201-555-0160', resendIn(30)];

function form(runner: BusyRunner = {}, platform: Platform = 'ios', tapsUntilFocused = 1, screen: Screen = { texts: () => EMAIL_CODE_SCREEN }) {
  const refusalsLeft = { tap: runner.tap ?? 0, read: runner.read ?? 0, type: runner.type ?? 0, replace: runner.replace ?? 0 };
  const calls: string[] = [];
  let held = '';
  let focused = false;
  const step = (site: keyof typeof refusalsLeft, what: string): void => {
    calls.push(what);
    if (refusalsLeft[site] > 0) {
      refusalsLeft[site] -= 1;
      throw new Error(BUSY);
    }
  };
  const frame = { x: 20, y: 300, width: 200, height: 40 };
  const field: NamedField = {
    tap: async () => {
      step('tap', 'tap');
      focused = (tapsUntilFocused -= 1) <= 0;
    },
    all: async () => [{ inputValue: async () => held, boundingBox: async () => frame }],
  };
  const device: FillDevice = {
    platform,
    focused: {
      count: async () => (step('read', 'read'), focused ? 1 : 0),
      boundingBox: async () => frame,
      inputValue: async () => held,
      tap: async () => step('tap', 'refocus'),
    },
    texts: { allTextContents: async () => [...screen.texts()] },
    type: async ([command, ...operands]) => {
      step(command === 'fill' ? 'replace' : 'type', `${command} ${operands.join(' ')}`);
      held = command === 'fill' ? operands.at(-1)! : held + operands.join('');
      held = screen.afterTyping?.(held) ?? held;
    },
  };
  let waited = 0;
  const fill = (text: string, most: number): Promise<void> =>
    fillField(field, text, device, { tapTimeoutMs: 1_000, reads: 2, now: () => 0, wait: async () => undefined }, busyWaits(most, async () => void (waited += 1)));
  return { fill, calls, held: () => held, waited: () => waited };
}

describe('one host.fill', () => {
  it('taps the field, types the text on the device, and reads back that the field holds it', async () => {
    const email = form();
    await email.fill('someone+clerk_test@example.com', 6);
    assert.equal(email.held(), 'someone+clerk_test@example.com');
    assert.deepEqual(email.calls.filter((call) => !call.startsWith('read')), ['tap', 'type someone+clerk_te', 'type st@example.com']);
    assert.equal(email.waited(), 0);
  });

  it('waits for a busy runner at the tap, at a read, and at the typing, then replaces what the busy typing may have left', async () => {
    const code = form({ tap: 2, read: 1, type: 1 });
    await code.fill('424242', 6);
    assert.equal(code.held(), '424242');
    assert.equal(code.waited(), 4);
    assert.equal(code.calls.at(-1)?.startsWith('read'), true);
    assert.ok(code.calls.includes('fill 120 320 424242'), 'the replacement goes to the middle of the focused field');
  });

  it('spends one bound of waits on all its steps together: steps that need five waits fail under a bound of four and pass under five', async () => {
    const needsFive = { tap: 2, type: 1, replace: 2 };
    const short = form(needsFive);
    await assert.rejects(short.fill('424242', 4), (error: Error) => error.message === BUSY);
    assert.equal(short.waited(), 4);
    const enough = form(needsFive);
    await enough.fill('424242', 5);
    assert.deepEqual([enough.held(), enough.waited()], ['424242', 5]);
  });

  it('fails at the first refusal once the bound is spent, and types nothing after a tap that never landed', async () => {
    const stuck = form({ tap: 7 });
    await assert.rejects(stuck.fill('424242', 6), (error: Error) => error.message === BUSY);
    assert.deepEqual([stuck.waited(), stuck.held()], [6, '']);
    assert.deepEqual(stuck.calls, Array.from({ length: 7 }, () => 'tap'));
  });

  it('taps the field again on Android when the first tap left nothing focused, so no text is typed at nothing', async () => {
    const android = form({}, 'android', 2);
    await android.fill('424242', 6);
    assert.equal(android.held(), '424242');
    assert.deepEqual(android.calls.filter((call) => !call.startsWith('read')), ['tap', 'tap', 'type 424242']);
  });

  describe('when the field reads empty after the typing', () => {
    const swallowsTheFirstTyping = (): ((held: string) => string) => {
      let typings = 0;
      return (held) => ((typings += 1) === 1 ? '' : held);
    };
    const typedTwice = ['tap', `type ${CODE}`, 'refocus', `type ${CODE}`];

    it('types a code once when the app took it and shows the next screen, whose empty code field has the same name in the same place', async () => {
      const screens = [EMAIL_CODE_SCREEN, PHONE_CODE_SCREEN, ['Signed in as someone+clerk_test@example.com']];
      let on = 0;
      const emailCode = form({}, 'ios', 1, { texts: () => screens[on]!, afterTyping: (held) => (held === CODE ? ((on += 1), '') : held) });
      await emailCode.fill(CODE, 6);
      assert.deepEqual(emailCode.calls.filter((call) => !call.startsWith('read')), ['tap', `type ${CODE}`]);
      assert.deepEqual(screens[on], PHONE_CODE_SCREEN, 'the phone code screen is still waiting for its code');
    });

    it('types again when the typing never arrived: the screen shows nothing it did not show before the typing', async () => {
      const dropped = form({}, 'ios', 1, { texts: () => EMAIL_CODE_SCREEN, afterTyping: swallowsTheFirstTyping() });
      await dropped.fill(CODE, 6);
      assert.deepEqual(dropped.calls.filter((call) => !call.startsWith('read')), typedTwice);
      assert.equal(dropped.held(), CODE);
    });

    it('takes a screen whose resend countdown went on for the same screen, so a typing that never arrived there is typed again', async () => {
      let seconds = 30;
      const counting = form({}, 'ios', 1, { texts: () => [...EMAIL_CODE_SCREEN.slice(0, 2), resendIn((seconds -= 1))], afterTyping: swallowsTheFirstTyping() });
      await counting.fill(CODE, 6);
      assert.deepEqual(counting.calls.filter((call) => !call.startsWith('read')), typedTwice);
      assert.equal(counting.held(), CODE);
    });

    it('types again when texts only left the screen since the typing, as the texts of the screen before do while an iOS screen arrives', async () => {
      let typings = 0;
      const arriving = form({}, 'ios', 1, { texts: () => (typings === 0 ? ['Welcome! Sign in to continue', ...EMAIL_CODE_SCREEN] : EMAIL_CODE_SCREEN), afterTyping: (held) => ((typings += 1) === 1 ? '' : held) });
      await arriving.fill(CODE, 6);
      assert.deepEqual(arriving.calls.filter((call) => !call.startsWith('read')), typedTwice);
      assert.equal(arriving.held(), CODE);
    });

    it('types once and claims nothing when the texts of the screen cannot be read', async () => {
      const unreadable = form({}, 'ios', 1, {
        texts: () => {
          throw new Error('ENGINE_FAILURE: the snapshot holds a secure node');
        },
        afterTyping: swallowsTheFirstTyping(),
      });
      await unreadable.fill(CODE, 6);
      assert.deepEqual(unreadable.calls.filter((call) => !call.startsWith('read')), ['tap', `type ${CODE}`]);
    });
  });
});
