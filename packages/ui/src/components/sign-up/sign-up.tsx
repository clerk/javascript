import { Root as SignUpRoot } from '@clerk/elements/sign-up';

import { FallBack } from '~/common/fallback';
import { SignUpContinue } from '~/components/sign-up/steps/continue';
import { SignUpStart } from '~/components/sign-up/steps/start';
// import { SignUpStatus } from '~/components/sign-up/steps/status';
import { SignUpVerifications } from '~/components/sign-up/steps/verifications';

export function SignUp() {
  return (
    <SignUpRoot fallback={<FallBack />}>
      <SignUpStart />
      <SignUpVerifications />
      <SignUpContinue />
      {/* <SignUpStatus /> */}
    </SignUpRoot>
  );
}
