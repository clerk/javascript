import { Root as SignUpRoot } from '@clerk/elements/sign-up';

import { SignUpContinue } from '~/components/sign-up/steps/continue';
import { SignUpStart } from '~/components/sign-up/steps/start';
import { SignUpStatus } from '~/components/sign-up/steps/status';
import { SignUpVerifications } from '~/components/sign-up/steps/verifications';

export function SignUp() {
  return (
    <SignUpRoot>
      <SignUpStart />
      <SignUpVerifications />
      <SignUpContinue />
      <SignUpStatus />
    </SignUpRoot>
  );
}
