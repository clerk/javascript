import { ClerkElementsRuntimeError } from '~/internals/errors';

import type { SignInChooseStrategyProps } from '../choose-strategy';
import { SignInChooseStrategy, SignInForgotPassword } from '../choose-strategy';
import type { SignInStartProps } from '../start';
import { SignInStart } from '../start';
import type { SignInVerificationsProps } from '../verifications';
import { SignInVerifications } from '../verifications';
import type { SignInResetPasswordProps } from './reset-password';
import { SignInResetPassword } from './reset-password';

export const SIGN_IN_STEPS = {
  start: 'start',
  verifications: 'verifications',
  'choose-strategy': 'choose-strategy',
  'forgot-password': 'forgot-password',
  'reset-password': 'reset-password',
} as const;

export type TSignInStep = (typeof SIGN_IN_STEPS)[keyof typeof SIGN_IN_STEPS];
type StepWithProps<N extends TSignInStep, T> = { name: N } & T;

export type SignInStepProps =
  | StepWithProps<'start', SignInStartProps>
  | StepWithProps<'verifications', SignInVerificationsProps>
  | StepWithProps<'choose-strategy' | 'forgot-password', SignInChooseStrategyProps>
  | StepWithProps<'reset-password', SignInResetPasswordProps>;

/**
 * Render different steps of the sign-in flow. Initially the `'start'` step is rendered. Once a sign-in attempt has been created, `'verifications'` will be displayed. If during that verification step the user decides to choose a different method of signing in or verifying, the `'choose-strategy'` step will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'verifications'` step is used to verify the user's credentials like password or MFA. Once the user has been verified, the sign-in attempt will be completed.
 *
 * @param {string} props.name - Step name. Use `'start'`, `'verifications'`, `'choose-strategy'`, or `'forgot-password'`.
 *
 * @example
 * <SignIn>
 *  <Step name='start'>
 *    Continue with Google
 *  </Step>
 *  <Step name='verifications'>
 *    Verify with email code
 *    <Action navigate='choose-strategy'>
 *      Use a different method
 *    </Action>
 *  </Step>
 *  <Step name='choose-strategy'>
 *    <SocialProvider name='github'>
 *      Continue with GitHub
 *    </SocialProvider>
 *  </Step>
 *  <Step name='forgot-password'>
 *    <SocialProvider name='github'>
 *      Continue with GitHub
 *    </SocialProvider>
 *  </Step>
 * </SignIn>
 */
export function SignInStep(props: SignInStepProps) {
  switch (props.name) {
    case SIGN_IN_STEPS['start']:
      return <SignInStart {...props} />;
    case SIGN_IN_STEPS['verifications']:
      return <SignInVerifications {...props} />;
    case SIGN_IN_STEPS['choose-strategy']:
      return <SignInChooseStrategy {...props} />;
    case SIGN_IN_STEPS['forgot-password']:
      return <SignInForgotPassword {...props} />;
    case SIGN_IN_STEPS['reset-password']:
      return <SignInResetPassword {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use: ${Object.keys(SIGN_IN_STEPS).join(',')}.`);
  }
}
