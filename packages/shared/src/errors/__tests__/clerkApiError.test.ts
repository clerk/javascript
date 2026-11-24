import { describe, expect, it } from 'vitest';

import { ClerkAPIError } from '../clerkApiError';
import { errorToJSON } from '../parseError';

describe('ClerkAPIError remainingAttempts metadata', () => {
  it('converts remaining_attempts to remainingAttempts, including zero', () => {
    const error = new ClerkAPIError({
      code: 'form_password_validation_failed',
      message: 'Password is incorrect',
      meta: { remaining_attempts: 0 },
    });

    expect(error.meta.remainingAttempts).toBe(0);
  });

  it('serializes remainingAttempts as remaining_attempts', () => {
    const error = new ClerkAPIError({
      code: 'form_password_incorrect',
      message: 'Password is incorrect',
      meta: { remaining_attempts: 2 },
    });

    expect(errorToJSON(error).meta?.remaining_attempts).toBe(2);
  });
});
