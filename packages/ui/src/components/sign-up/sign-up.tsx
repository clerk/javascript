import { Root as SignUpRoot } from '@clerk/elements/sign-up';
import type { SignUpProps } from '@clerk/types';

import { SignUpContinue } from '~/components/sign-up/steps/continue';
import { SignUpStart } from '~/components/sign-up/steps/start';
// import { SignUpStatus } from '~/components/sign-up/steps/status';
import { SignUpVerifications } from '~/components/sign-up/steps/verifications';
import { type Appearance, AppearanceProvider } from '~/contexts';

export function SignUp({ appearance, ...props }: { appearance?: Appearance } & SignUpProps) {
  // If __experimental.newComponents is `true`, we should use __experimental.appearance instead of appearance.
  const componentAppearance = props.__experimental?.newComponents ? props.__experimental.appearance : appearance;

  return (
    <AppearanceProvider appearance={componentAppearance}>
      <SignUpRoot {...props}>
        <SignUpStart />
        <SignUpVerifications />
        <SignUpContinue />
        {/* <SignUpStatus /> */}
      </SignUpRoot>
    </AppearanceProvider>
  );
}
