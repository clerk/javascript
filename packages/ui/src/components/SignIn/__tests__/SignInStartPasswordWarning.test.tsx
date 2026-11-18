import { logger } from '@clerk/shared/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { SignInStart } from '../SignInStart';

vi.mock('@clerk/shared/logger', () => ({
  logger: {
    warnOnce: vi.fn(),
    logOnce: vi.fn(),
  },
}));

const { createFixtures } = bindCreateFixtures('SignIn');

// Fixtures build Clerk from a production publishable key to skip the devInit flow, but the warning
// is gated on a development instance, so shadow the prototype getter.
const asDevelopmentInstance = (clerk: unknown) =>
  Object.defineProperty(clerk as object, 'instanceType', { value: 'development', configurable: true });

const warnings = () =>
  vi
    .mocked(logger.warnOnce)
    .mock.calls.map(call => call[0])
    .join('\n');

describe('SignInStart sign-in-or-up password warning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('warns when the sign-in-or-up flow renders on a password-enabled instance', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withEnumerationProtection();
    });
    asDevelopmentInstance(fixtures.clerk);
    props.setProps({ withSignUp: true });

    render(<SignInStart />, { wrapper });

    expect(warnings()).toContain('sign_up_if_missing_password_preferred');
  });

  it('does not warn when password is disabled', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnumerationProtection();
    });
    asDevelopmentInstance(fixtures.clerk);
    props.setProps({ withSignUp: true });

    render(<SignInStart />, { wrapper });

    expect(warnings()).not.toContain('sign_up_if_missing_password_preferred');
  });

  it('does not warn outside the sign-in-or-up flow', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withEnumerationProtection();
    });
    asDevelopmentInstance(fixtures.clerk);

    render(<SignInStart />, { wrapper });

    expect(warnings()).not.toContain('sign_up_if_missing_password_preferred');
  });
});
