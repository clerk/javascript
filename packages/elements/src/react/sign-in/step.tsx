import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignInChooseStrategy, type SignInChooseStrategyProps } from './choose-strategy';
import { SignInStart, type SignInStartProps } from './start';
import { SignInVerifications, type SignInVerificationsProps } from './verifications';

export type SignInStep = 'start' | 'verifications' | 'choose-strategy';
type StepWithProps<N extends SignInStep, T> = { name: N } & T;

export type SignInStepProps =
  | StepWithProps<'start', SignInStartProps>
  | StepWithProps<'verifications', SignInVerificationsProps>
  | StepWithProps<'choose-strategy', SignInChooseStrategyProps>;

/**
 * Render different steps of the sign-in flow. Initially the `'start'` step is rendered. Once a sign-in attempt has been created, `'verifications'` will be displayed. If during that verification step the user decides to choose a different method of signing in or verifying, the `'choose-strategy'` step will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'verifications'` step is used to verify the user's credentials like password or MFA. Once the user has been verified, the sign-in attempt will be completed.
 *
 * @param {string} name - Step name. Use `'start'`, `'verifications'`, or `'choose-strategy'`.
 *
 * @example
 * <SignIn>
 *  <Step name='start'>
 *    Continue with Google
 *  </Step>
 *  <Step name='verifications'>
 *    Verify with email code
 *    <ChooseAlternateStrategy>
 *      Use a different method
 *    </ChooseAlternateStrategy>
 *  </Step>
 *  <Step name='choose-strategy'>
 *    <SocialProvider name='github'>
 *      Continue with GitHub
 *    </SocialProvider>
 *  </Step>
 * </SignIn>
 */
export function SignInStep(props: SignInStepProps) {
  switch (props.name) {
    case 'start':
      return <SignInStart {...props} />;
    case 'verifications':
      return <SignInVerifications {...props} />;
    case 'choose-strategy':
      return <SignInChooseStrategy {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use 'start', 'verifications', or 'choose-strategy'.`);
  }
}
