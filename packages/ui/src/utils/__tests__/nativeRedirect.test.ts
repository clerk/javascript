import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authenticateWithNativeRedirect } from '../nativeRedirect';

function createSignInResource(overrides: Record<string, unknown> = {}) {
  const resource = {
    firstFactorVerification: {
      externalVerificationRedirectURL: new URL('https://accounts.example.com'),
      error: null,
    },
    __experimental_authenticateWithNativeRedirect: vi.fn(async () => resource),
    reload: vi.fn(async () => resource),
    ...overrides,
  };

  return resource as any;
}

function createOpts(resource = createSignInResource(), callbackUrl = 'myapp://callback') {
  return {
    clerk: {
      __experimental_handleNativeRedirectCallback: vi.fn(),
    },
    bridge: {
      getRedirectUrl: vi.fn(async () => 'myapp://callback'),
      openExternal: vi.fn(),
      waitForRedirectCallback: vi.fn(async () => callbackUrl),
    },
    resource,
    params: { strategy: 'oauth_google' },
    callbackParams: {},
    navigate: vi.fn(),
  } as any;
}

describe('authenticateWithNativeRedirect', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reloads without a rotating token nonce and throws the verification error when Clerk stored one', async () => {
    const resource = createSignInResource();
    const reloadedResource = createSignInResource({
      firstFactorVerification: {
        externalVerificationRedirectURL: null,
        error: {
          code: 'oauth_access_denied',
          message: 'Access denied',
          longMessage: 'You did not grant access to your Google account.',
        },
      },
    });
    resource.reload.mockResolvedValueOnce(reloadedResource);

    await expect(authenticateWithNativeRedirect(createOpts(resource))).rejects.toSatisfy(error => {
      expect(isClerkAPIResponseError(error)).toBe(true);
      expect(error).toMatchObject({
        errors: [
          {
            code: 'oauth_access_denied',
            message: 'Access denied',
            longMessage: 'You did not grant access to your Google account.',
          },
        ],
      });
      return true;
    });
    expect(resource.reload).toHaveBeenCalledWith();
  });

  it('waits briefly for a verification error after a bare callback', async () => {
    vi.useFakeTimers();

    const resource = createSignInResource();
    const pendingResource = createSignInResource({
      firstFactorVerification: {
        externalVerificationRedirectURL: null,
        error: null,
      },
    });
    const failedResource = createSignInResource({
      firstFactorVerification: {
        externalVerificationRedirectURL: null,
        error: {
          code: 'oauth_access_denied',
          message: 'Access denied',
          longMessage: 'You did not grant access to your Google account.',
        },
      },
    });
    resource.reload.mockResolvedValueOnce(pendingResource).mockResolvedValueOnce(failedResource);

    const promise = authenticateWithNativeRedirect(createOpts(resource));
    const expectation = expect(promise).rejects.toSatisfy(error => {
      expect(isClerkAPIResponseError(error)).toBe(true);
      expect(error).toMatchObject({
        errors: [
          {
            code: 'oauth_access_denied',
            message: 'Access denied',
            longMessage: 'You did not grant access to your Google account.',
          },
        ],
      });
      return true;
    });

    await vi.advanceTimersByTimeAsync(250);
    await expectation;
    expect(resource.reload).toHaveBeenCalledTimes(2);
  });

  it('surfaces a non-silent incomplete error when a callback arrives but the verification never settles', async () => {
    vi.useFakeTimers();

    const resource = createSignInResource();

    const promise = authenticateWithNativeRedirect(createOpts(resource));
    const expectation = expect(promise).rejects.toSatisfy(error => {
      expect(isClerkRuntimeError(error)).toBe(true);
      // Not `native_redirect_cancelled`: a delivered callback is never treated as a cancellation, so
      // the error is shown to the user rather than swallowed.
      expect(error).toMatchObject({ code: 'native_redirect_incomplete' });
      return true;
    });

    await vi.advanceTimersByTimeAsync(3_000);
    await expectation;
    expect(resource.reload).toHaveBeenCalled();
  });

  it('hands off to the native redirect callback when the verification resolves', async () => {
    const resource = createSignInResource();
    const reloadedResource = createSignInResource({
      firstFactorVerification: {
        externalVerificationRedirectURL: null,
        error: null,
        status: 'verified',
      },
    });
    resource.reload.mockResolvedValueOnce(reloadedResource);

    const opts = createOpts(resource, 'myapp://callback?rotating_token_nonce=abc123');
    await authenticateWithNativeRedirect(opts);

    expect(resource.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'abc123' });
    expect(opts.clerk.__experimental_handleNativeRedirectCallback).toHaveBeenCalledWith(
      reloadedResource,
      opts.callbackParams,
      opts.navigate,
    );
  });

  it('treats a true cancellation (no callback) as cancelled', async () => {
    const resource = createSignInResource();
    const opts = createOpts(resource);
    const cancelledError = new ClerkRuntimeError('cancelled', { code: 'native_redirect_cancelled' });
    opts.bridge.waitForRedirectCallback.mockRejectedValueOnce(cancelledError);

    await expect(authenticateWithNativeRedirect(opts)).rejects.toBe(cancelledError);
    expect(resource.reload).not.toHaveBeenCalled();
  });
});
