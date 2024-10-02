import { Root as SignUpRoot } from '@clerk/elements/sign-up';
import type { SignUpProps } from '@clerk/types';

import { SignUpContinue } from '~/components/sign-up/steps/continue';
import { SignUpStart } from '~/components/sign-up/steps/start';
// import { SignUpStatus } from '~/components/sign-up/steps/status';
import { SignUpVerifications } from '~/components/sign-up/steps/verifications';
import { type Appearance, AppearanceProvider } from '~/contexts';

export function SignUp({ appearance, ...props }: { appearance?: Appearance } & SignUpProps) {
  return (
    <AppearanceProvider appearance={appearance}>
      <SignUpRoot {...props}>
        <SignUpStart />
        <SignUpVerifications />
        <SignUpContinue />
        {/* <SignUpStatus /> */}
      </SignUpRoot>
    </AppearanceProvider>
  );
}
