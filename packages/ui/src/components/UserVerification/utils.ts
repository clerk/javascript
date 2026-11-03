import type { __internal_UserVerificationProps, SignInFactor } from '@clerk/shared/types';

/** A new password the caller already collected; see [__internal_UserVerificationProps.resetPassword]. */
export type UserVerificationResetPassword = NonNullable<__internal_UserVerificationProps['resetPassword']>;

export function sortByPrimaryFactor(a: SignInFactor, b: SignInFactor) {
  if ('primary' in a && a.primary && !('primary' in b && b.primary)) {
    return -1;
  }

  if ('primary' in b && b.primary && !('primary' in a && a.primary)) {
    return 1;
  }

  return 0;
}
