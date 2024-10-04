import { Root as SignInRoot } from '@clerk/elements/sign-in';
import type { SignInProps } from '@clerk/types';
import * as React from 'react';

import { GetHelpContext } from '~/components/sign-in/hooks/use-get-help';
import { SignInChooseSession } from '~/components/sign-in/steps/choose-session';
import { SignInChooseStrategy } from '~/components/sign-in/steps/choose-strategy';
import { SignInForgotPassword } from '~/components/sign-in/steps/forgot-password';
import { SignInGetHelp } from '~/components/sign-in/steps/get-help';
import { SignInResetPassword } from '~/components/sign-in/steps/reset-password';
import { SignInStart } from '~/components/sign-in/steps/start';
// import { SignInStatus } from '~/components/sign-in/steps/status';
import { SignInVerifications } from '~/components/sign-in/steps/verifications';
import { type Appearance, AppearanceProvider } from '~/contexts';

/**
 * Implementation Details:
 *
 * - For now we use a private context to switch between the "Get help" view and
 *   `SignIn.Step`s. Initially, this ternary was used within the relevant steps,
 *   but it lead to React rendering errors. Lifting the state and component here
 *   seemed to reolve those issues.
 * - We plan to revisit this again in https://linear.app/clerk/issue/SDKI-115;
 *   where we'll consider its integration within Elements, as well as ensure
 *   bulletproof a11y.
 */
export function SignIn({ appearance, ...props }: { appearance?: Appearance } & SignInProps) {
  const [showHelp, setShowHelp] = React.useState(false);

  // If __experimental.newComponents is `true`, we should use __experimental.appearance instead of appearance.
  const componentAppearance = props.__experimental?.newComponents ? props.__experimental.appearance : appearance;

  return (
    <AppearanceProvider appearance={componentAppearance}>
      <GetHelpContext.Provider value={{ showHelp, setShowHelp }}>
        <SignInRoot {...props}>
          {showHelp ? (
            <SignInGetHelp />
          ) : (
            <>
              <SignInStart />
              <SignInVerifications />
              <SignInChooseStrategy />
              <SignInForgotPassword />
              <SignInResetPassword />
              <SignInChooseSession />
              {/* Hidden until elements work is tackled https://linear.app/clerk/issue/SDKI-593/[signin]-verification-link-is-invalid-for-this-device */}
              {/* <SignInStatus /> */}
            </>
          )}
        </SignInRoot>
      </GetHelpContext.Provider>
    </AppearanceProvider>
  );
}
