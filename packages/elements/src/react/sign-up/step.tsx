import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignUpContinue, type SignUpContinueProps } from './continue';
import { SignUpStart, type SignUpStartProps } from './start';
import { SignUpVerifications, type SignUpVerificationsProps } from './verifications';

export type SignUpStepProps =
  | ({ name: 'start' } & SignUpStartProps)
  | ({ name: 'continue' } & SignUpContinueProps)
  | ({ name: 'verifications' } & SignUpVerificationsProps);

export function SignUpStep(props: SignUpStepProps) {
  switch (props.name) {
    case 'start':
      return <SignUpStart {...props} />;
    case 'continue':
      return <SignUpContinue {...props} />;
    case 'verifications':
      return <SignUpVerifications {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step`);
  }
}
