import { isClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import {
  createNativeRedirectResourceError,
  getRotatingTokenNonceFromNativeRedirectCallback,
  throwIfNativeRedirectCallbackHasError,
} from '../nativeRedirectCallback';

describe('nativeRedirectCallback', () => {
  it('wraps callback errors as Clerk API response errors', () => {
    let err: unknown;

    try {
      throwIfNativeRedirectCallbackHasError(
        'myapp://callback?error_code=oauth_access_denied&error_message=Access%20denied&long_message=You%20did%20not%20grant%20access&status=422',
      );
    } catch (e) {
      err = e;
    }

    expect(isClerkAPIResponseError(err)).toBe(true);
    expect(err).toMatchObject({
      status: 422,
      errors: [
        {
          code: 'oauth_access_denied',
          message: 'Access denied',
          longMessage: 'You did not grant access',
        },
      ],
    });
  });

  it('supports provider-style error params', () => {
    let err: unknown;

    try {
      throwIfNativeRedirectCallbackHasError(
        'myapp://callback?error=access_denied&error_description=The%20user%20cancelled',
      );
    } catch (e) {
      err = e;
    }

    expect(isClerkAPIResponseError(err)).toBe(true);
    expect(err).toMatchObject({
      status: 400,
      errors: [
        {
          code: 'access_denied',
          message: 'The user cancelled',
        },
      ],
    });
  });

  it('does nothing when the callback has no error params', () => {
    expect(() =>
      throwIfNativeRedirectCallbackHasError('myapp://callback?rotating_token_nonce=test-nonce'),
    ).not.toThrow();
  });

  it('returns the rotating token nonce from a successful callback', () => {
    expect(getRotatingTokenNonceFromNativeRedirectCallback('myapp://callback?rotating_token_nonce=test-nonce')).toBe(
      'test-nonce',
    );
  });

  it('returns null when the callback has no rotating token nonce', () => {
    expect(getRotatingTokenNonceFromNativeRedirectCallback('myapp://callback')).toBeNull();
  });

  it('wraps resource verification errors as Clerk API response errors', () => {
    let err: unknown;

    try {
      throw createNativeRedirectResourceError({
        code: 'oauth_access_denied',
        message: 'Access denied',
        longMessage: 'You did not grant access',
        meta: {
          sessionId: 'sess_123',
        },
      });
    } catch (e) {
      err = e;
    }

    expect(isClerkAPIResponseError(err)).toBe(true);
    expect(err).toMatchObject({
      status: 400,
      errors: [
        {
          code: 'oauth_access_denied',
          message: 'Access denied',
          longMessage: 'You did not grant access',
          meta: {
            sessionId: 'sess_123',
          },
        },
      ],
    });
  });
});
