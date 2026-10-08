import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { busyWaits } from '../specs/support/busy-runner.ts';
import { typeConfirmed, type FocusedField } from '../specs/support/typing.ts';

function field(reads: readonly (string | null)[], swallows = 0, replaced: () => void = () => {}) {
  const calls: string[] = [];
  let typed = 0;
  let read = 0;
  const fake: FocusedField = {
    async type(text) {
      typed += 1;
      calls.push(typed <= swallows ? `type ${text} (swallowed)` : `type ${text}`);
    },
    async valueIfReadable() {
      calls.push('read');
      const value = reads[Math.min(read, reads.length - 1)]!;
      read += 1;
      return typed <= swallows ? '' : value;
    },
    async valuesOfTheNamedNodes() {
      return [];
    },
    async refocus() {
      calls.push('refocus');
    },
    async tapAgain() {
      calls.push('tap again');
    },
    async replace(text) {
      calls.push(`replace ${text.length}`);
      replaced();
    },
  };
  return { fake, calls };
}

function fieldWhoseFirstTapMissed(failures: number, message = 'agent-device type failed: Error (TEXT_INPUT_NOT_FOCUSED): No focused text input was available for typing.') {
  const { fake, calls } = field(['Verify']);
  let attempts = 0;
  const type = fake.type.bind(fake);
  const missed: FocusedField = {
    ...fake,
    async type(text) {
      attempts += 1;
      if (attempts <= failures) {
        calls.push('type refused');
        throw new Error(message);
      }
      await type(text);
    },
  };
  return { fake: missed, calls };
}

function fieldWithNoFocusedInput(named: string[], replaced: () => void = () => {}) {
  const { fake, calls } = field([null], 0, replaced);
  return { fake: { ...fake, valuesOfTheNamedNodes: async () => [...named] }, calls };
}

const EMAIL = 'verify_r20261008_122943_f5bd_1+clerk_test@example.com';
const EMAIL_IN_COMMANDS = ['type verify_r20261008', 'type _122943_f5bd_1+c', 'type lerk_test@exampl', 'type e.com'];

const settle = { reads: 3, wait: async () => {} };

describe('typeConfirmed', () => {
  it('types once when the field shows the text', async () => {
    const { fake, calls } = field(['Verify']);
    await typeConfirmed(fake, 'Verify', settle);
    assert.deepEqual(calls, ['type Verify', 'read']);
  });

  it('focuses the field and types once more when the field swallowed the first attempt', async () => {
    const { fake, calls } = field(['Verify'], 1);
    await typeConfirmed(fake, 'Verify', settle);
    assert.deepEqual(calls, ['type Verify (swallowed)', 'read', 'read', 'read', 'refocus', 'type Verify', 'read']);
  });

  it('fails and says the text never reached the field when the second attempt is swallowed too', async () => {
    const { fake, calls } = field(['Verify'], 2);
    await assert.rejects(typeConfirmed(fake, 'Verify', settle), /the text never reached the field/);
    assert.equal(calls.filter((call) => call.startsWith('type')).length, 2);
  });

  it('taps the field again and types when the first tap left nothing focused', async () => {
    const { fake, calls } = fieldWhoseFirstTapMissed(1);
    await typeConfirmed(fake, 'Verify', settle);
    assert.deepEqual(calls, ['type refused', 'tap again', 'type Verify', 'read']);
  });

  it('fails with the typing error when the second tap leaves nothing focused either', async () => {
    const { fake, calls } = fieldWhoseFirstTapMissed(2);
    await assert.rejects(typeConfirmed(fake, 'Verify', settle), /TEXT_INPUT_NOT_FOCUSED/);
    assert.deepEqual(calls, ['type refused', 'tap again', 'type refused']);
  });

  it('taps again on a platform whose typing succeeds into nothing, when it says no field has focus', async () => {
    const { fake, calls } = field(['Verify']);
    const focus = [false, true];
    const silent: FocusedField = { ...fake, nothingFocused: async () => !focus.shift() };
    await typeConfirmed(silent, 'Verify', settle);
    assert.deepEqual(calls, ['tap again', 'type Verify', 'read']);
  });

  it('fails without typing when the second tap leaves no field focused there either', async () => {
    const { fake, calls } = field(['Verify']);
    const silent: FocusedField = { ...fake, nothingFocused: async () => true };
    await assert.rejects(typeConfirmed(silent, 'Verify', settle), /TEXT_INPUT_NOT_FOCUSED/);
    assert.deepEqual(calls, ['tap again']);
  });

  it('does not tap again for any other typing failure', async () => {
    const { fake, calls } = fieldWhoseFirstTapMissed(1, 'agent-device type failed: the session is gone');
    await assert.rejects(typeConfirmed(fake, 'Verify', settle), /the session is gone/);
    assert.deepEqual(calls, ['type refused']);
  });

  it('sends a long text sixteen characters to a command, so that no typing command outlasts the 30 seconds the iOS runner gives one', async () => {
    const { fake, calls } = field([EMAIL]);
    await typeConfirmed(fake, EMAIL, settle);
    assert.deepEqual(calls, [...EMAIL_IN_COMMANDS, 'read']);
  });

  it('taps again for the first command only, and sends the rest of a long text once', async () => {
    const { fake, calls } = fieldWhoseFirstTapMissed(1);
    await typeConfirmed({ ...fake, valueIfReadable: async () => EMAIL }, EMAIL, settle);
    assert.deepEqual(calls, ['type refused', 'tap again', ...EMAIL_IN_COMMANDS]);
  });

  it('types a swallowed long text again in the same commands', async () => {
    const { fake, calls } = field([EMAIL], EMAIL_IN_COMMANDS.length);
    await typeConfirmed(fake, EMAIL, settle);
    assert.deepEqual(calls.slice(-1 - EMAIL_IN_COMMANDS.length), [...EMAIL_IN_COMMANDS, 'read']);
    assert.equal(calls.filter((call) => call === 'refocus').length, 1);
  });

  it('replaces a long text with its first command and types the rest, whatever way the replacing command ended', async () => {
    const reads = [EMAIL.slice(1)];
    const { fake, calls } = field(reads, 0, () => {
      reads.splice(0, 1, EMAIL);
      throw new Error('agent-device fill failed: Error (TEXT_ENTRY_MISMATCH): text entry verification failed');
    });
    await typeConfirmed(fake, EMAIL, settle);
    assert.deepEqual(calls.slice(EMAIL_IN_COMMANDS.length + settle.reads), ['replace 16', ...EMAIL_IN_COMMANDS.slice(1), 'read']);
  });

  it('does not type again when the field shows the text a moment after the typing ends', async () => {
    const { fake, calls } = field(['', 'Verify']);
    await typeConfirmed(fake, 'Verify', settle);
    assert.deepEqual(calls, ['type Verify', 'read', 'read']);
  });

  it('types once and confirms nothing when the screen withholds the value, as it does for a secure field', async () => {
    const { fake, calls } = field([null]);
    await typeConfirmed(fake, 'a password', settle);
    assert.deepEqual(calls, ['type a password', 'read']);
  });

  it('confirms nothing for a secure field that reads as bullets', async () => {
    const { fake, calls } = field(['\u2022'.repeat(9)]);
    await typeConfirmed(fake, 'Verify-Pw1!', settle);
    assert.deepEqual(calls, ['type Verify-Pw1!', 'read']);
  });

  it('accepts the formatting a field adds and the case it changes', async () => {
    for (const [typed, shown] of [['2015550124', '+1 (201) 555-0124'], ['Ada+clerk_test@Example.com', 'ada+clerk_test@example.com'], ['424242', '4 2 4 2 4 2']] as const) {
      const { fake, calls } = field([shown]);
      await typeConfirmed(fake, typed, settle);
      assert.deepEqual(calls.filter((call) => !call.startsWith('type ')), ['read'], shown);
    }
  });

  it('replaces the contents once when a character was dropped, and passes when the field then holds the text', async () => {
    const reads = ['44242'];
    const { fake, calls } = field(reads, 0, () => reads.splice(0, 1, '424242'));
    await typeConfirmed(fake, '424242', settle);
    assert.deepEqual(calls, ['type 424242', 'read', 'read', 'read', 'replace 6', 'read']);
  });

  it('judges a replacement by what the field then holds, not by how the command that made it ended', async () => {
    const reads: (string | null)[] = ['(215) 550-198'];
    const formatted = field(reads, 0, () => {
      reads.splice(0, 1, '(201) 555-0198');
      throw new Error('agent-device fill failed: Error (TEXT_ENTRY_MISMATCH): text entry verification failed');
    });
    await typeConfirmed(formatted.fake, '2015550198', settle);
    assert.equal(formatted.calls.at(-1), 'read');

    const code: (string | null)[] = ['44242'];
    const submitted = field(code, 0, () => {
      code.splice(0, 1, null);
      throw new Error('agent-device fill failed: the screen changed while the code was typed');
    });
    await typeConfirmed(submitted.fake, '424242', settle);
    assert.equal(submitted.calls.at(-1), 'read');

    const stillWrong = field(['44242'], 0, () => {
      throw new Error('agent-device fill failed: the session is gone');
    });
    await assert.rejects(typeConfirmed(stillWrong.fake, '424242', settle), /6 letters and digits were typed, and after one attempt to replace its contents the field holds 5$/);
  });

  it('fails with the two lengths and neither value when the replacement leaves the field wrong too', async () => {
    const { fake, calls } = field(['Verify-Pw']);
    const failure = await typeConfirmed(fake, 'Verify-Pw1!', settle).then(() => null, (error: Error) => error.message);
    assert.equal(failure, 'the field does not hold the typed text: 9 letters and digits were typed, and after one attempt to replace its contents the field holds 8');
    assert.equal(calls.filter((call) => call.startsWith('replace')).length, 1);
    assert.equal(calls.filter((call) => call.startsWith('type')).length, 1);
  });

  it('reads the nodes the test named when no focused text input can be read, and replaces a wrong value there', async () => {
    const labelAndInput = ['', '442422'];
    const { fake, calls } = fieldWithNoFocusedInput(labelAndInput, () => labelAndInput.splice(1, 1, '424242'));
    await typeConfirmed(fake, '424242', settle);
    assert.deepEqual(calls.filter((call) => call !== 'read'), ['type 424242', 'replace 6']);
  });

  it('fails when the named node holds the digits in another order after the replacement too', async () => {
    const { fake } = fieldWithNoFocusedInput(['442422']);
    await assert.rejects(typeConfirmed(fake, '424242', settle), /6 letters and digits were typed, and after one attempt to replace its contents the field holds 6$/);
  });

  it('makes no claim when no named node shows a value, as a node that is not a text input shows none, or when two show different values', async () => {
    for (const named of [[''], [], ['442422', '424242']]) {
      const { fake, calls } = fieldWithNoFocusedInput(named);
      await typeConfirmed(fake, '424242', settle);
      assert.deepEqual(calls, ['type 424242', 'read'], JSON.stringify(named));
    }
  });

  it('does not replace when the screen moved on before the value could be read, as it does when a code field submits itself', async () => {
    const { fake, calls } = field(['4242', null]);
    await typeConfirmed(fake, '424242', settle);
    assert.deepEqual(calls, ['type 424242', 'read', 'read']);
  });

  describe('when the iOS runner refuses a typing command because it is still finishing an earlier one', () => {
    const BUSY = 'agent-device type failed: Error (COMMAND_FAILED): The iOS runner is still finishing a previous command that exceeded its execution watchdog (usually an accessibility capture on a heavy or animating screen).';

    function busyField(options: { readonly reads: (string | null)[]; readonly refuse: (call: 'type' | 'replace', nth: number) => boolean; readonly onReplace?: () => void }) {
      const calls: string[] = [];
      let waits = 0;
      let sent = 0;
      const refusedOr = (call: 'type' | 'replace', text: string, land: () => void): void => {
        sent += 1;
        if (options.refuse(call, sent)) {
          calls.push(`${call} refused`);
          throw new Error(`${BUSY} (command ${sent})`);
        }
        calls.push(call === 'type' ? `type ${text}` : `replace ${text.length}`);
        land();
      };
      const fake: FocusedField = {
        type: async (text) => refusedOr('type', text, () => {}),
        replace: async (text) => refusedOr('replace', text, options.onReplace ?? (() => {})),
        valueIfReadable: async () => (calls.push('read'), options.reads[0]!),
        valuesOfTheNamedNodes: async () => [],
        refocus: async () => void calls.push('refocus'),
        tapAgain: async () => void calls.push('tap again'),
      };
      return { fake, calls, waits: () => waits, busy: (most: number) => busyWaits(most, async () => void ((waits += 1), calls.push('wait'))) };
    }

    it('waits, then replaces the contents instead of typing the command again, so characters that landed are not typed twice', async () => {
      const reads = ['Ver'];
      const refused = busyField({ reads, refuse: (_call, nth) => nth === 1, onReplace: () => reads.splice(0, 1, 'Verify') });
      await typeConfirmed(refused.fake, 'Verify', settle, refused.busy(6));
      assert.deepEqual(refused.calls, ['type refused', 'wait', 'replace 6', 'read']);
    });

    it('starts the replacement of a long text again from its first command when a later command is refused', async () => {
      const refused = busyField({ reads: [EMAIL], refuse: (_call, nth) => nth === 2 || nth === 4 });
      await typeConfirmed(refused.fake, EMAIL, settle, refused.busy(6));
      assert.deepEqual(refused.calls, ['type verify_r20261008', 'type refused', 'wait', 'replace 16', 'type refused', 'wait', 'replace 16', ...EMAIL_IN_COMMANDS.slice(1), 'read']);
    });

    it('stops at the bound and fails with the first refusal', async () => {
      const refused = busyField({ reads: ['Verify'], refuse: () => true });
      await assert.rejects(typeConfirmed(refused.fake, 'Verify', settle, refused.busy(3)), (error: Error) => error.message === `${BUSY} (command 1)`);
      assert.deepEqual(refused.calls, ['type refused', 'wait', 'replace refused', 'wait', 'replace refused', 'wait', 'replace refused']);
      assert.equal(refused.waits(), 3);
    });

    it('has one bound for the whole fill, so the waits of its typing count against the replacement of a wrong value', async () => {
      const refused = busyField({ reads: ['Verfy'], refuse: (_call, nth) => nth !== 3 });
      await assert.rejects(typeConfirmed(refused.fake, 'Verify', settle, refused.busy(3)), (error: Error) => error.message === `${BUSY} (command 5)`);
      assert.deepEqual(refused.calls, ['type refused', 'wait', 'replace refused', 'wait', 'replace 6', 'read', 'read', 'read', 'replace refused', 'wait', 'replace refused']);
      assert.equal(refused.waits(), 3);
    });

    it('still fails at the fill when the replacement leaves the field wrong', async () => {
      const refused = busyField({ reads: ['Verfy'], refuse: (_call, nth) => nth === 1 });
      await assert.rejects(typeConfirmed(refused.fake, 'Verify', settle, refused.busy(6)), /after one attempt to replace its contents the field holds 5$/);
      assert.equal(refused.calls.filter((call) => call === 'type Verify').length, 0, 'the refused command is never typed again');
    });

    it('waits and replaces again when the runner refuses the replacement of a wrong value', async () => {
      const reads = ['44242'];
      const refused = busyField({ reads, refuse: (call, nth) => call === 'replace' && nth === 2, onReplace: () => reads.splice(0, 1, '424242') });
      await typeConfirmed(refused.fake, '424242', settle, refused.busy(6));
      assert.deepEqual(refused.calls, ['type 424242', 'read', 'read', 'read', 'replace refused', 'wait', 'replace 6', 'read']);
    });

    it('fails with the refusal at once when no wait is allowed, as before', async () => {
      const refused = busyField({ reads: ['Verify'], refuse: (_call, nth) => nth === 1 });
      await assert.rejects(typeConfirmed(refused.fake, 'Verify', settle), (error: Error) => error.message === `${BUSY} (command 1)`);
      assert.deepEqual(refused.calls, ['type refused']);
    });

    it('does not wait or replace for any other typing failure', async () => {
      const { fake, calls } = fieldWhoseFirstTapMissed(1, 'agent-device type failed: Error (COMMAND_FAILED): main thread execution timed out');
      const waited: string[] = [];
      await assert.rejects(typeConfirmed(fake, 'Verify', settle, busyWaits(6, async () => void waited.push('wait'))), /main thread execution timed out/);
      assert.deepEqual([calls, waited], [['type refused'], []]);
    });
  });
});
