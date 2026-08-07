import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the dependencies before importing the module
vi.mock('@clerk/shared/logger', () => ({
  logger: {
    warnOnce: vi.fn(),
  },
}));

import { logger } from '@clerk/shared/logger';

import { warnAboutPasswordInSignInOrUpFlow } from '../warnAboutPasswordInSignInOrUpFlow';

const getWarningMessage = () => {
  const calls = vi.mocked(logger.warnOnce).mock.calls;
  return calls.length > 0 ? calls[0][0] : null;
};

describe('warnAboutPasswordInSignInOrUpFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('warns when the sign-in-or-up flow runs on a password-enabled instance', () => {
    warnAboutPasswordInSignInOrUpFlow({ signUpIfMissingEnabled: true, passwordEnabled: true });

    expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    const message = getWarningMessage();
    expect(message).toContain('sign_up_if_missing_password_preferred');
    // Both triggering settings must be named, so the reader knows what to change.
    expect(message).toContain('password');
    expect(message).toContain('strict enumeration protection');
  });

  test('does not warn when the sign-in-or-up flow is not active', () => {
    warnAboutPasswordInSignInOrUpFlow({ signUpIfMissingEnabled: false, passwordEnabled: true });

    expect(logger.warnOnce).not.toHaveBeenCalled();
  });

  test('does not warn when password is disabled, since new users can complete a code factor', () => {
    warnAboutPasswordInSignInOrUpFlow({ signUpIfMissingEnabled: true, passwordEnabled: false });

    expect(logger.warnOnce).not.toHaveBeenCalled();
  });
});
