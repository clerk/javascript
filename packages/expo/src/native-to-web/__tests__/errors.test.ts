import { describe, expect, test } from 'vitest';

import { isSessionTransferError, sessionTransferError, toSessionTransferError } from '../errors';

describe('session transfer errors', () => {
  test.each([
    ['a session transfer error', sessionTransferError('signed_out', 'Signed out.'), true],
    ['an error with a code but another name', Object.assign(new Error('x'), { code: 'signed_out' }), false],
    ['a plain object', { name: 'SessionTransferError', code: 'signed_out' }, false],
    ['null', null, false],
  ])('recognizes %s: %s', (_, value, expected) => {
    expect(isSessionTransferError(value)).toBe(expected);
  });

  test('wraps an unknown failure as unexpected_response', () => {
    const cause = new Error('boom');

    expect(toSessionTransferError(cause)).toMatchObject({ code: 'unexpected_response', cause });
  });
});
