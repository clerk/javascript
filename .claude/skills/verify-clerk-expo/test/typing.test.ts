import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { typeConfirmed, type FocusedField } from '../src/core/typing.ts';

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
      assert.deepEqual(calls, [`type ${typed}`, 'read'], shown);
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

  it('does not replace when the screen moved on before the value could be read, as it does when a code field submits itself', async () => {
    const { fake, calls } = field(['4242', null]);
    await typeConfirmed(fake, '424242', settle);
    assert.deepEqual(calls, ['type 424242', 'read', 'read']);
  });
});
