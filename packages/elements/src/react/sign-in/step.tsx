import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';

import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignInChooseSession, type SignInChooseSessionProps } from './choose-session';
import { SignInChooseStrategy, type SignInChooseStrategyProps, SignInForgotPassword } from './choose-strategy';
import { SignInResetPassword, type SignInResetPasswordProps } from './reset-password';
import { SignInStart, type SignInStartProps } from './start';
import { SignInVerifications, type SignInVerificationsProps } from './verifications';

export const SIGN_IN_STEPS = {
  start: 'start',
  verifications: 'verifications',
  'choose-strategy': 'choose-strategy',
  'choose-session': 'choose-session',
  'forgot-password': 'forgot-password',
  'reset-password': 'reset-password',
} as const;

export type TSignInStep = (typeof SIGN_IN_STEPS)[keyof typeof SIGN_IN_STEPS];
type StepWithProps<N extends TSignInStep, T> = { name: N } & T;

export type SignInStepProps =
  | StepWithProps<'start', SignInStartProps>
  | StepWithProps<'verifications', SignInVerificationsProps>
  | StepWithProps<'choose-strategy' | 'forgot-password', SignInChooseStrategyProps>
  | StepWithProps<'reset-password', SignInResetPasswordProps>
  | StepWithProps<'choose-session', SignInChooseSessionProps>;

/**
 * Render different steps of the sign-in flow. Initially the `'start'` step is rendered. Once a sign-in attempt has been created, `'verifications'` will be displayed. If during that verification step the user decides to choose a different method of signing in or verifying, the `'choose-strategy'` step will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'verifications'` step is used to verify the user's credentials like password or MFA. Once the user has been verified, the sign-in attempt will be completed.
 *
 * @param {string} name - Step name. Use `'start'`, `'verifications'`, `'choose-strategy'`, `'reset-password'`, or `'forgot-password'`.
 *
 * @example
 * <SignIn.Root>
 *  <SignIn.Step name='start' />
 *  <SignIn.Step name='verifications' />
 *  <SignIn.Step name='choose-strategy' />
 *  <SignIn.Step name='forgot-password' />
 *  <SignIn.Step name='reset-password' />
 *  <SignIn.Step name='choose-session' />
 * </SignIn.Root>
 */
export function SignInStep(props: SignInStepProps) {
  const clerk = useClerk();

  clerk.telemetry?.record(eventComponentMounted('Elements_SignInStep', { name: props.name }));

  switch (props.name) {
    case SIGN_IN_STEPS.start:
      return <SignInStart {...props} />;
    case SIGN_IN_STEPS.verifications:
      return <SignInVerifications {...props} />;
    case SIGN_IN_STEPS['choose-strategy']:
      return <SignInChooseStrategy {...props} />;
    case SIGN_IN_STEPS['forgot-password']:
      return <SignInForgotPassword {...props} />;
    case SIGN_IN_STEPS['reset-password']:
      return <SignInResetPassword {...props} />;
    case SIGN_IN_STEPS['choose-session']:
      return <SignInChooseSession {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use: ${Object.keys(SIGN_IN_STEPS).join(',')}.`);
  }
}
