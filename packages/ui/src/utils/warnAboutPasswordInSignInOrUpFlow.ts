import { logger } from '@clerk/shared/logger';

function formatPasswordInSignInOrUpWarning(): string {
  return [
    `Clerk: <SignIn> is rendering the sign-in-or-up flow, but visitors without an account cannot`,
    `complete it on this instance.`,
    ``,
    `This is caused by two instance settings being enabled together:`,
    `  - password`,
    `  - strict enumeration protection`,
    ``,
    `Strict enumeration protection makes a sign-in for an unknown identifier advertise every first`,
    `factor the instance supports, password included, and password is the preferred factor by default.`,
    `A visitor who does not have an account is therefore routed to the password screen, where nothing`,
    `they type can succeed and no sign-up transfer is possible. They have to find "Use another method"`,
    `and pick a code or link factor before the flow can create their account.`,
    ``,
    `A wrong password and a non-existent user are deliberately indistinguishable to the client, so the`,
    `component cannot detect this and recover on its own. To make the flow work for new users, either`,
    `disable password on the instance or set the instance's preferred sign-in strategy to OTP.`,
    ``,
    `Learn more: https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options`,
    `(code=sign_up_if_missing_password_preferred)`,
  ].join('\n');
}

/**
 * Warns when the sign-in-or-up flow is active alongside password, a combination in which visitors
 * without an account are routed to a first factor they cannot complete.
 *
 * `signUpIfMissingEnabled` already encodes the combined flow, enumeration protection, and a public
 * sign-up mode, so password being enabled is the only additional condition.
 *
 * Note: The caller should check clerk.instanceType === 'development' before calling.
 * This function assumes it's only called in development mode.
 */
export function warnAboutPasswordInSignInOrUpFlow({
  signUpIfMissingEnabled,
  passwordEnabled,
}: {
  signUpIfMissingEnabled: boolean;
  passwordEnabled: boolean;
}): void {
  if (!signUpIfMissingEnabled || !passwordEnabled) {
    return;
  }

  logger.warnOnce(formatPasswordInSignInOrUpWarning());
}
