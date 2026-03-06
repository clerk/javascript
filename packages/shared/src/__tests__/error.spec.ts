import { describe, expect, it } from 'vitest';

import type { ErrorThrowerOptions } from '../error';
import {
  buildErrorThrower,
  ClerkOfflineError,
  ClerkRuntimeError,
  is429Error,
  is4xxError,
  isClerkRuntimeError,
  isUnauthenticatedError,
} from '../error';

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

describe('is4xxError', () => {
  it('returns true for 4xx status codes', () => {
    expect(is4xxError({ status: 400 })).toBe(true);
    expect(is4xxError({ status: 401 })).toBe(true);
    expect(is4xxError({ status: 429 })).toBe(true);
    expect(is4xxError({ status: 499 })).toBe(true);
  });

  it('returns false for non-4xx status codes', () => {
    expect(is4xxError({ status: 200 })).toBe(false);
    expect(is4xxError({ status: 500 })).toBe(false);
    expect(is4xxError({})).toBe(false);
    expect(is4xxError(null)).toBe(false);
  });
});

describe('is429Error', () => {
  it('returns true for 429 status', () => {
    expect(is429Error({ status: 429 })).toBe(true);
  });

  it('returns false for other status codes', () => {
    expect(is429Error({ status: 400 })).toBe(false);
    expect(is429Error({ status: 401 })).toBe(false);
    expect(is429Error({ status: 500 })).toBe(false);
    expect(is429Error({})).toBe(false);
    expect(is429Error(null)).toBe(false);
    expect(is429Error(undefined)).toBe(false);
  });
});

describe('isUnauthenticatedError', () => {
  it('returns true for authentication failure status codes', () => {
    expect(isUnauthenticatedError({ status: 401 })).toBe(true);
    expect(isUnauthenticatedError({ status: 422 })).toBe(true);
  });

  it('returns false for other 4xx status codes', () => {
    expect(isUnauthenticatedError({ status: 400 })).toBe(false);
    expect(isUnauthenticatedError({ status: 403 })).toBe(false);
    expect(isUnauthenticatedError({ status: 404 })).toBe(false);
    expect(isUnauthenticatedError({ status: 429 })).toBe(false);
  });

  it('returns false for non-4xx errors', () => {
    expect(isUnauthenticatedError({ status: 200 })).toBe(false);
    expect(isUnauthenticatedError({ status: 500 })).toBe(false);
    expect(isUnauthenticatedError({})).toBe(false);
    expect(isUnauthenticatedError(null)).toBe(false);
  });
});

describe('ClerkOfflineError', () => {
  it('is an instance of ClerkRuntimeError', () => {
    const error = new ClerkOfflineError('Network request failed');
    expect(error).toBeInstanceOf(ClerkRuntimeError);
    expect(error.code).toBe('clerk_offline');
  });

  describe('ClerkOfflineError.is() type guard', () => {
    it('returns true for ClerkOfflineError instances', () => {
      const error = new ClerkOfflineError('test');
      expect(ClerkOfflineError.is(error)).toBe(true);
    });

    it('returns true for ClerkRuntimeError with clerk_offline code', () => {
      const error = new ClerkRuntimeError('test', { code: 'clerk_offline' });
      expect(ClerkOfflineError.is(error)).toBe(true);
    });

    it('returns false for other ClerkRuntimeError instances', () => {
      const error = new ClerkRuntimeError('test', { code: 'other_code' });
      expect(ClerkOfflineError.is(error)).toBe(false);
    });

    it('returns false for regular Error instances', () => {
      const error = new Error('test');
      expect(ClerkOfflineError.is(error)).toBe(false);
    });

    it('returns false for null', () => {
      expect(ClerkOfflineError.is(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(ClerkOfflineError.is(undefined)).toBe(false);
    });

    it('returns false for non-error objects', () => {
      expect(ClerkOfflineError.is({ message: 'test' })).toBe(false);
    });
  });
});
