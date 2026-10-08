import { SignUpEmailLinkFlowComplete } from '@/common/EmailLinkCompleteFlowCard';
import { Flow } from '@/customizables';
import { SessionTasks as LazySessionTasks } from '@/lazyModules/components';
import { Route, Switch } from '@/router';

import type { SignUpRoutesData } from './sign-up-routes.types';
import { SignUpContinue } from './SignUpContinue';
import { SignUpEnterpriseConnections } from './SignUpEnterpriseConnections';
import { SignUpProtectCheck } from './SignUpProtectCheck';
import { SignUpRedirect } from './SignUpRedirect';
import { SignUpSSOCallback } from './SignUpSSOCallback';
import { SignUpStart } from './SignUpStart';
import { SignUpStartSolanaWalletsCard } from './SignUpStartSolanaWalletsCard';
import { SignUpVerifyEmail } from './SignUpVerifyEmail';
import { SignUpVerifyPhone } from './SignUpVerifyPhone';

export const SignUpRoutesView = (routes: SignUpRoutesData): JSX.Element => {
  return (
    <Flow.Root flow='signUp'>
      <Switch>
        {/* No canActivate guard here. `!!signUp.protectCheck` flips to false
            when submitProtectCheck resolves and clears protectCheck, which
            unmounts this card mid-navigation and blanks the route. The card
            owns its own post-resolution routing. */}
        <Route path='protect-check'>
          <SignUpProtectCheck />
        </Route>
        <Route
          path='verify-email-address'
          canActivate={routes.canVerifyEmail}
        >
          <SignUpVerifyEmail />
        </Route>
        <Route
          path='verify-phone-number'
          canActivate={routes.canVerifyPhone}
        >
          <SignUpVerifyPhone />
        </Route>
        <Route path='sso-callback'>
          <SignUpSSOCallback
            signUpUrl={routes.signUpUrl}
            signInUrl={routes.signInUrl}
            signUpForceRedirectUrl={routes.afterSignUpUrl}
            signInForceRedirectUrl={routes.afterSignInUrl}
            secondFactorUrl={routes.secondFactorUrl}
            continueSignUpUrl='../continue'
            verifyEmailAddressUrl='../verify-email-address'
            verifyPhoneNumberUrl='../verify-phone-number'
            signUpProtectCheckUrl='../protect-check'
            unsafeMetadata={routes.unsafeMetadata}
          />
        </Route>
        <Route path='verify'>
          <SignUpEmailLinkFlowComplete
            redirectUrlComplete={routes.afterSignUpUrl}
            ssoCallbackUrl={routes.ssoCallbackUrl}
            oidcPrompt={routes.oidcPrompt}
            verifyEmailPath='../verify-email-address'
            verifyPhonePath='../verify-phone-number'
          />
        </Route>
        <Route path='continue'>
          {/* No canActivate guard: same resolution race as the top-level
              protect-check route; the card owns its own routing. */}
          <Route path='protect-check'>
            {/* Under `continue`, the continue index is `..`, not `../continue`. */}
            <SignUpProtectCheck continuePath='..' />
          </Route>
          <Route
            path='verify-email-address'
            canActivate={routes.canVerifyEmail}
          >
            <SignUpVerifyEmail />
          </Route>
          <Route
            path='verify-phone-number'
            canActivate={routes.canVerifyPhone}
          >
            <SignUpVerifyPhone />
          </Route>
          <Route index>
            <SignUpContinue />
          </Route>
        </Route>
        <Route path='tasks'>
          <LazySessionTasks redirectUrlComplete={routes.afterSignUpUrl} />
        </Route>
        <Route path='enterprise-connections'>
          <SignUpEnterpriseConnections />
        </Route>
        <Route path='choose-wallet'>
          <SignUpStartSolanaWalletsCard />
        </Route>
        <Route index>
          <SignUpStart />
        </Route>
        <Route>
          <SignUpRedirect />
        </Route>
      </Switch>
    </Flow.Root>
  );
};
