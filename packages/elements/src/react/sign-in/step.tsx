import { useClerk } from '@clerk/clerk-react';
import { eventComponentMounted } from '@clerk/shared/telemetry';

import { ClerkElementsRuntimeError } from '~/internals/errors';

import type { SignInChooseStrategyProps } from './choose-strategy';
import { SignInChooseStrategy, SignInForgotPassword } from './choose-strategy';
import type { SignInCompleteProps } from './complete';
import { SignInComplete } from './complete';
import type { SignInResetPasswordProps } from './reset-password';
import { SignInResetPassword } from './reset-password';
import type { SignInStartProps } from './start';
import { SignInStart } from './start';
import type { SignInVerificationsProps } from './verifications';
import { SignInVerifications } from './verifications';

export const SIGN_IN_STEPS = {
  start: 'start',
  verifications: 'verifications',
  'choose-strategy': 'choose-strategy',
  'forgot-password': 'forgot-password',
  'reset-password': 'reset-password',
  complete: 'complete',
} as const;

export type TSignInStep = (typeof SIGN_IN_STEPS)[keyof typeof SIGN_IN_STEPS];
type StepWithProps<N extends TSignInStep, T> = { name: N } & T;

export type SignInStepProps =
  | StepWithProps<'start', SignInStartProps>
  | StepWithProps<'verifications', SignInVerificationsProps>
  | StepWithProps<'choose-strategy' | 'forgot-password', SignInChooseStrategyProps>
  | StepWithProps<'reset-password', SignInResetPasswordProps>
  | StepWithProps<'complete', SignInCompleteProps>;

/**
 * Render different steps of the sign-in flow. Initially the `'start'` step is rendered. Once a sign-in attempt has been created, `'verifications'` will be displayed. If during that verification step the user decides to choose a different method of signing in or verifying, the `'choose-strategy'` step will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'verifications'` step is used to verify the user's credentials like password or MFA. Once the user has been verified, the sign-in attempt will be completed.
 *
 * @param {string} name - Step name. Use `'start'`, `'verifications'`, `'choose-strategy'`, `'reset-password'`, `'forgot-password'`, or `'complete'`.
 *
 * @example
 * <SignIn.Root>
 *  <SignIn.Step name='start' />
 *  <SignIn.Step name='verifications' />
 *  <SignIn.Step name='choose-strategy' />
 *  <SignIn.Step name='forgot-password' />
 *  <SignIn.Step name='reset-password' />
 *  <SignIn.Step name='complete' />
 * </SignIn.Root>
 */
export function SignInStep(props: SignInStepProps) {
  const clerk = useClerk();

  clerk.telemetry?.record(eventComponentMounted('Elements_SignInStep', { name: props.name }));

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
    case SIGN_IN_STEPS['complete']:
      return <SignInComplete {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use: ${Object.keys(SIGN_IN_STEPS).join(',')}.`);
  }
}
