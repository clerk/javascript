import { describe, expect, it } from 'vitest';

import { ClerkAPIError } from '../errors/clerkApiError';
import { errorToJSON } from '../errors/parseError';
import type { ClerkAPIErrorJSON } from '../types/errors';

describe('user_locked error meta', () => {
  const json: ClerkAPIErrorJSON = {
    code: 'user_locked',
    message: 'Account locked',
    long_message: 'Too many failed attempts. Try again later.',
    meta: {
      lockout_expires_in_seconds: 3599,
    },
  };

  it('keeps lockoutExpiresInSeconds from the wire payload', () => {
    const error = new ClerkAPIError(json);
    expect(error.meta.lockoutExpiresInSeconds).toBe(3599);
  });

  it('survives a snapshot round trip', () => {
    const roundTripped = new ClerkAPIError(errorToJSON(new ClerkAPIError(json)));
    expect(roundTripped.meta.lockoutExpiresInSeconds).toBe(3599);
    expect(errorToJSON(roundTripped).meta?.lockout_expires_in_seconds).toBe(3599);
  });

  it('leaves an error without lockout duration alone', () => {
    const error = new ClerkAPIError({
      code: 'form_code_incorrect',
      message: 'Incorrect code',
      meta: { param_name: 'code' },
    });
    expect(error.meta.lockoutExpiresInSeconds).toBeUndefined();
    expect(errorToJSON(error).meta?.lockout_expires_in_seconds).toBeUndefined();
  });
});
