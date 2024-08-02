import { Root as SignUpRoot } from '@clerk/elements/sign-up';

import { SignUpContinue } from './steps/continue';
import { SignUpStart } from './steps/start';
import { SignUpVerifications } from './steps/verifications';

export function SignUp() {
  return (
    <SignUpRoot>
      <SignUpStart />
      <SignUpVerifications />
      <SignUpContinue />
    </SignUpRoot>
  );
}
