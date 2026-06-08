import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import {
  createNativeRedirectCancelledError,
  getRotatingTokenNonceFromNativeRedirectCallback,
  throwIfNativeRedirectCallbackHasError,
  waitForNativeRedirectCallback,
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

  it('creates an abandoned native redirect error', () => {
    const err = createNativeRedirectCancelledError();

    expect(isClerkRuntimeError(err)).toBe(true);
    expect(err).toMatchObject({ code: 'native_redirect_cancelled' });
  });

  it('captures bridge callback rejections without creating an unhandled rejection race', async () => {
    const error = new Error('cancelled');
    const bridge = {
      getRedirectUrl: vi.fn(),
      openExternal: vi.fn(),
      waitForRedirectCallback: vi.fn(() => Promise.reject(error)),
    };

    await expect(waitForNativeRedirectCallback(bridge)).resolves.toEqual({ error });
  });
});
