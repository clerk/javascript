import type { ErrorThrowerOptions } from '../error';
import { buildErrorThrower, ClerkRuntimeError, isClerkRuntimeError } from '../error';

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
    }).toThrow(/^🔒 Clerk: test\n\n\(code="test_code"\)/);
  });

  it('throws the correct error message without duplicate prefixes', () => {
    expect(() => {
      throw new ClerkRuntimeError('🔒 Clerk: test', { code: 'test_code' });
    }).toThrow(/^🔒 Clerk: test\n\n\(code="test_code"\)/);
  });

  it('properties are populated correctly', () => {
    expect(clerkRuntimeError.name).toEqual('ClerkRuntimeError');
    expect(clerkRuntimeError.code).toEqual('test_code');
    expect(clerkRuntimeError.message).toMatch(/🔒 Clerk: test\n\n\(code="test_code"\)/);
    expect(clerkRuntimeError.clerkRuntimeError).toBe(true);
    expect(clerkRuntimeError.toString()).toMatch(
      /^\[ClerkRuntimeError\]\nMessage:🔒 Clerk: test\n\n\(code="test_code"\)/,
    );
  });

  it('helper recognises error', () => {
    expect(isClerkRuntimeError(clerkRuntimeError)).toEqual(true);
  });
});
