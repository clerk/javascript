import { describe, expect, test } from 'vitest';

import { isSessionTransferError, sessionTransferError, toSessionTransferError } from '../errors';

describe('session transfer errors', () => {
  test('builds an Error with a name and code', () => {
    const error = sessionTransferError('expired', 'The sign-in link expired.');

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      name: 'SessionTransferError',
      code: 'expired',
      message: 'The sign-in link expired.',
    });
    expect(error).not.toHaveProperty('cause');
  });

  test('keeps the cause when given one', () => {
    const cause = new Error('underlying');

    expect(sessionTransferError('network_error', 'Offline.', cause).cause).toBe(cause);
  });

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
    const known = sessionTransferError('load_failed', 'Load failed.');

    expect(toSessionTransferError(known)).toBe(known);
    expect(toSessionTransferError(cause)).toMatchObject({ code: 'unexpected_response', cause });
  });
});
