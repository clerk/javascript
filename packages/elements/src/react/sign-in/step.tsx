import { ClerkElementsRuntimeError } from '~/internals/errors';

import { SignInStart, type SignInStartProps } from './start';
import { SignInVerifications, type SignInVerificationsProps } from './verifications';

export type SignInStepProps =
  | ({ name: 'start' } & SignInStartProps)
  | ({ name: 'verifications' } & SignInVerificationsProps);

export function SignInStep(props: SignInStepProps) {
  switch (props.name) {
    case 'start':
      return <SignInStart {...props} />;
    case 'verifications':
      return <SignInVerifications {...props} />;
    default:
      throw new ClerkElementsRuntimeError(`Invalid step`);
  }
}
