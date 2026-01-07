import type { ClerkError } from '@clerk/shared/error';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { errorsToParsedErrors } from '../state';

describe('errorsToParsedErrors', () => {
  it('returns empty errors object when error is null', () => {
    const initialFields = { emailAddress: null, password: null };
    const result = errorsToParsedErrors(null, initialFields);

    expect(result).toEqual({
      fields: { emailAddress: null, password: null },
      raw: null,
      global: null,
    });
  });

  it('handles non-API errors by putting them in raw and global arrays', () => {
    const initialFields = { emailAddress: null, password: null };
    // Use a plain Error cast as ClerkError to test non-API error handling
    const error = new Error('Something went wrong') as unknown as ClerkError;
    const result = errorsToParsedErrors(error, initialFields);

    expect(result.fields).toEqual({ emailAddress: null, password: null });
    expect(result.raw).toEqual([error]);
    expect(result.global).toBeTruthy();
    expect(result.global?.length).toBe(1);
  });

  it('handles API errors with field errors', () => {
    const initialFields = { emailAddress: null, password: null };
    const error = new ClerkAPIResponseError('Validation failed', {
      data: [
        {
          code: 'form_identifier_not_found',
          message: 'emailAddress not found',
          meta: { param_name: 'emailAddress' },
        },
      ],
      status: 400,
    });
    const result = errorsToParsedErrors(error, initialFields);

    expect(result.fields.emailAddress).toBeTruthy();
    expect(result.fields.password).toBeNull();
    expect(result.raw).toEqual([error.errors[0]]);
    expect(result.global).toBeNull();
  });

  it('handles API errors without field errors', () => {
    const initialFields = { emailAddress: null, password: null };
    const error = new ClerkAPIResponseError('Server error', {
      data: [
        {
          code: 'internal_error',
          message: 'Something went wrong on the server',
        },
      ],
      status: 500,
    });
    const result = errorsToParsedErrors(error, initialFields);

    expect(result.fields).toEqual({ emailAddress: null, password: null });
    // When there are no field errors, individual ClerkAPIError instances are put in raw
    expect(result.raw).toEqual([error.errors[0]]);
    // Note: global is null when errors are processed individually without field errors
    expect(result.global).toBeNull();
  });
});
