import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignUpContinue, type SignUpContinueProps } from './continue';
import { SignUpStart, type SignUpStartProps } from './start';
import { SignUpVerifications, type SignUpVerificationsProps } from './verifications';

export type SignUpStepProps =
  | ({ name: 'start' } & SignUpStartProps)
  | ({ name: 'continue' } & SignUpContinueProps)
  | ({ name: 'verifications' } & SignUpVerificationsProps);

/**
 * Render different steps of the sign-up flow. Initially the `'start'` step is rendered. Optionally, you can render additional fields in the `'continue'` step. Once a sign-up attempt has been created, `'verifications'` will be displayed.
 *
 * You typically want to place fields like username, password, or social providers in the `'start'` step. The `'continue'` step can hold inputs for username, firstname/lastname or other metadata. The `'verifications'` step is used to verify the user's information like an email verification. Once the user has been verified, the sign-up attempt will be completed.
 *
 * @param {string} name - Step name. Use `'start'`, `'continue'`, or `'verifications'`.
 *
 * @example
 * <SignUp>
 *  <Step name='start'>
 *    Enter email and password
 *  </Step>
 *  <Step name='continue'>
 *    Enter username and phone number
 *  </Step>
 *  <Step name='verifications'>
 *    Verify with email link
 *  </Step>
 * </SignUp>
 */
export function SignUpStep(props: SignUpStepProps) {
  switch (props.name) {
    case 'start':
      return <SignUpStart {...props} />;
    case 'continue':
      return <SignUpContinue {...props} />;
    case 'verifications':
      return <SignUpVerifications {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step name. Use 'start', 'continue', or 'verifications'.`);
  }
}
