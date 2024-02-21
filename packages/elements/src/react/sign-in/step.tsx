import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignInStart, type SignInStartProps } from './start';
import { SignInVerifications, type SignInVerificationsProps } from './verifications';

export type SignInStepProps =
  | ({ name: 'start' } & SignInStartProps)
  | ({ name: 'verifications' } & SignInVerificationsProps);

/**
 * Render different steps of the sign-in flow. Initially the `'start'` step is rendered. Once a sign-in attempt has been created, `'verifications'` will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'verifications'` step is used to verify the user's credentials like password or MFA. Once the user has been verified, the sign-in attempt will be completed.
 *
 * @param {string} name - Step name. Use `'start'` or `'verifications'`.
 *
 * @example
 * <SignIn>
 *  <Step name='start'>
 *    Continue with Google
 *  </Step>
 *  <Step name='verifications'>
 *    Verify with email code
 *  </Step>
 * </SignIn>
 */
export function SignInStep(props: SignInStepProps) {
  switch (props.name) {
    case 'start':
      return <SignInStart {...props} />;
    case 'verifications':
      return <SignInVerifications {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use 'start' or 'verifications'.`);
  }
}
