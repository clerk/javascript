import type { SignUpProps } from '@clerk/shared/types';
import type { ComponentType } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignUp } from '../../common';
import { useSignUpProtectCheckController } from './sign-up-protect-check.controller';
import { useSignUpProtectCheckModel } from './sign-up-protect-check.model';
import { SignUpProtectCheckView } from './sign-up-protect-check.view';

/**
 * Continuation paths default to the standalone `/sign-up/protect-check` mount. When the card is
 * mounted deeper (e.g. `continue/protect-check` or the combined-flow `create/.../protect-check`),
 * the nested route passes overrides so a resolved gate routes within the correct subtree instead
 * of dead-ending. The verify/self paths resolve correctly from every mount; only `continuePath`
 * differs (the `continue` index is `..`, not `../continue`, once we're already under `continue`).
 */
export type SignUpProtectCheckProps = Partial<SignUpProps> & {
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  continuePath?: string;
  protectCheckPath?: string;
};

function SignUpProtectCheckInternal({
  verifyEmailPath = '../verify-email-address',
  verifyPhonePath = '../verify-phone-number',
  continuePath = '../continue',
  protectCheckPath = '.',
}: SignUpProtectCheckProps = {}): JSX.Element | null {
  const model = useSignUpProtectCheckModel({
    verifyEmailPath,
    verifyPhonePath,
    continuePath,
    protectCheckPath,
  });
  const controller = useSignUpProtectCheckController(model);

  return <SignUpProtectCheckView {...controller} />;
}

// The redirect HOC widens props back to the shared component-props union; re-expose the path
// overrides so nested route mounts (continue/protect-check, create/continue/protect-check) can
// pass them.
export const SignUpProtectCheck = withRedirectToAfterSignUp(
  withCardStateProvider(SignUpProtectCheckInternal),
) as ComponentType<SignUpProtectCheckProps>;
