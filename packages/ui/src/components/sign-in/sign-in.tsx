import { Root as SignInRoot } from '@clerk/elements/sign-in';
import * as React from 'react';

import { GetHelpContext } from '~/components/sign-in/hooks/use-get-help';
import { SignInChooseStrategy } from '~/components/sign-in/steps/choose-strategy';
import { SignInForgotPassword } from '~/components/sign-in/steps/forgot-password';
import { SignInGetHelp } from '~/components/sign-in/steps/get-help';
import { SignInResetPassword } from '~/components/sign-in/steps/reset-password';
import { SignInStart } from '~/components/sign-in/steps/start';
import { SignInVerifications } from '~/components/sign-in/steps/verifications';

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
export function SignIn() {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <GetHelpContext.Provider value={{ showHelp, setShowHelp }}>
      <SignInRoot>
        {showHelp ? (
          <SignInGetHelp />
        ) : (
          <>
            <SignInStart />
            <SignInVerifications />
            <SignInChooseStrategy />
            <SignInForgotPassword />
            <SignInResetPassword />
          </>
        )}
      </SignInRoot>
    </GetHelpContext.Provider>
  );
}
