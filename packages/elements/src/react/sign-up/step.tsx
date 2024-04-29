import { eventComponentMounted } from '@clerk/shared/telemetry';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { useTelemetry } from '~/react/utils/telemetry';

import type { SignUpContinueProps } from './continue';
import { SignUpContinue } from './continue';
import type { SignUpStartProps } from './start';
import { SignUpStart } from './start';
import type { SignUpVerificationsProps } from './verifications';
import { SignUpVerifications } from './verifications';

export const SIGN_UP_STEPS = {
  start: 'start',
  continue: 'continue',
  verifications: 'verifications',
} as const;

export type TSignUpStep = (typeof SIGN_UP_STEPS)[keyof typeof SIGN_UP_STEPS];
type StepWithProps<N extends TSignUpStep, T> = { name: N } & T;

export type SignUpStepProps =
  | StepWithProps<'start', SignUpStartProps>
  | StepWithProps<'continue', SignUpContinueProps>
  | StepWithProps<'verifications', SignUpVerificationsProps>;

/**
 * Render different steps of the sign-up flow. Initially the `'start'` step is rendered. Optionally, you can render additional fields in the `'continue'` step. Once a sign-up attempt has been created, `'verifications'` will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'continue'` step can hold inputs for username, first name/last name or other metadata. The `'verifications'` step is used to verify the user's information like an email verification. Once the user has been verified, the sign-up attempt will be completed.
 *
 * @param {string} name - Step name. Use `'start'`, `'continue'`, or `'verifications'`.
 *
 * @example
 * <SignUp.Root>
 *  <SignUp.Step name='start' />
 *  <SignUp.Step name='continue' />
 *  <SignUp.Step name='verifications' />
 * </SignUp.Root>
 */
export function SignUpStep(props: SignUpStepProps) {
  const telemetry = useTelemetry();

  telemetry?.record(eventComponentMounted('Elements_SignUpStep', props));

  switch (props.name) {
    case SIGN_UP_STEPS.start:
      return <SignUpStart {...props} />;
    case SIGN_UP_STEPS.continue:
      return <SignUpContinue {...props} />;
    case SIGN_UP_STEPS.verifications:
      return <SignUpVerifications {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use 'start', 'continue', or 'verifications'.`);
  }
}
