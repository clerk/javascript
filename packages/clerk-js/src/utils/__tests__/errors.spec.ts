import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { isError } from '../errors';

describe('isError(err, code)', () => {
  it('check if the the API response contains at least one error of the provided code', () => {
    const err = {
      errors: [
        {
          code: 'foo',
        },
      ],
    } as ClerkAPIResponseError;
    expect(isError(err, 'foo')).toBe(true);
    expect(isError(err, 'bar')).toBe(false);
    expect(isError(err, '')).toBe(false);
  });
});
