import { describe, expect, it } from 'vitest';

import type { ErrorThrowerOptions } from '../error';
import { buildErrorThrower, ClerkOfflineError, ClerkRuntimeError, isClerkRuntimeError } from '../error';

describe('ErrorThrower', () => {
  const errorThrower = buildErrorThrower({ packageName: '@clerk/test-package' });

  it('throws the correct error message and interpolates pkg and known parameters', () => {
    expect(() => errorThrower.throwInvalidPublishableKeyError({ key: 'whatever' })).toThrow(
      '@clerk/test-package: The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key=whatever)',
    );
  });

  it('throws the correct error message and interpolates pkg if no parameters are provided', () => {
    expect(() => errorThrower.throwMissingPublishableKeyError()).toThrow(
      '@clerk/test-package: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
    );
  });

  it('throws a custom error message and interpolates pkg and known parameters', () => {
    expect(() =>
      errorThrower
        .setPackageName({
          packageName: '@clerk/another-test-package',
        })
        .setMessages({
          customMessages: {
            InvalidPublishableKeyErrorMessage:
              'This is a custom error message for key={{key}} and an unknown {{replacement}}',
          },
        } as ErrorThrowerOptions)
        .throwInvalidPublishableKeyError({ key: 'whatever' }),
    ).toThrow('@clerk/another-test-package: This is a custom error message for key=whatever and an unknown ');
  });
});

describe('ClerkRuntimeError', () => {
  const clerkRuntimeError = new ClerkRuntimeError('test', { code: 'test_code' });

  it('throws the correct error message', () => {
    expect(() => {
      throw clerkRuntimeError;
    }).toThrow(/^Clerk: test\n\n\(code="test_code"\)/);
  });

  it('throws the correct error message without duplicate prefixes', () => {
    expect(() => {
      throw new ClerkRuntimeError('Clerk: test', { code: 'test_code' });
    }).toThrow(/^Clerk: test\n\n\(code="test_code"\)/);
  });

  it('properties are populated correctly', () => {
    expect(clerkRuntimeError.name).toEqual('ClerkRuntimeError');
    expect(clerkRuntimeError.code).toEqual('test_code');
    expect(clerkRuntimeError.message).toMatch(/Clerk: test\n\n\(code="test_code"\)/);
    expect(clerkRuntimeError.clerkRuntimeError).toBe(true);
    expect(clerkRuntimeError.toString()).toMatch(/^\[ClerkRuntimeError\]\nMessage:Clerk: test\n\n\(code="test_code"\)/);
  });

  it('helper recognises error', () => {
    expect(isClerkRuntimeError(clerkRuntimeError)).toEqual(true);
  });
});

describe('ClerkOfflineError', () => {
  it('has the correct error code constant', () => {
    expect(ClerkOfflineError.ERROR_CODE).toEqual('clerk_offline');
  });

  it('can be instantiated with message', () => {
    const offlineError = new ClerkOfflineError('Network request failed while offline');
    expect(offlineError.message).toContain('Network request failed while offline');
    expect(offlineError.message).toContain('clerk_offline');
    expect(offlineError.code).toBe('clerk_offline');
  });

  it('identifies ClerkOfflineError instances', () => {
    const offlineError = new ClerkOfflineError('Network request failed while offline');
    expect(ClerkOfflineError.is(offlineError)).toBe(true);
  });

  it('does not identify ClerkRuntimeError with different code', () => {
    const otherError = new ClerkRuntimeError('Some other error', {
      code: 'other_error',
    });
    expect(ClerkOfflineError.is(otherError)).toBe(false);
  });

  it('does not identify non-ClerkOfflineError', () => {
    expect(ClerkOfflineError.is(new Error('regular error'))).toBe(false);
    expect(ClerkOfflineError.is({ code: 'clerk_offline' })).toBe(false);
    expect(ClerkOfflineError.is(null)).toBe(false);
    expect(ClerkOfflineError.is(undefined)).toBe(false);
  });

  it('supports non-sensitive context properties', () => {
    const offlineError = new ClerkOfflineError('Network request failed while offline', {
      hasCachedToken: true,
      tokenId: 'sess_123',
    });

    expect(ClerkOfflineError.is(offlineError)).toBe(true);
    expect(offlineError.hasCachedToken).toBe(true);
    expect(offlineError.tokenId).toBe('sess_123');
    expect(offlineError.code).toEqual('clerk_offline');
  });

  it('preserves cause from original error', () => {
    const originalError = new Error('Original network error');
    const offlineError = new ClerkOfflineError('Network request failed while offline', {
      cause: originalError,
    });

    expect(ClerkOfflineError.is(offlineError)).toBe(true);
    expect(offlineError.cause).toBe(originalError);
  });
});
