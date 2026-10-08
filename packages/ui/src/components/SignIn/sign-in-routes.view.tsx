import { SignUpEmailLinkFlowComplete } from '@/common/EmailLinkCompleteFlowCard';
import { Flow } from '@/customizables';
import { SessionTasks as LazySessionTasks } from '@/lazyModules/components';
import { Route, Switch } from '@/router';
import { SignInFactorOneSolanaWalletsCard } from '@/ui/components/SignIn/SignInFactorOneSolanaWalletsCard';

import {
  LazySignUpContinue,
  LazySignUpProtectCheck,
  LazySignUpSSOCallback,
  LazySignUpStart,
  LazySignUpVerifyEmail,
  LazySignUpVerifyPhone,
} from './lazy-sign-up';
import { ResetPassword } from './ResetPassword';
import { ResetPasswordSuccess } from './ResetPasswordSuccess';
import { RedirectToSignIn } from './sign-in-redirect';
import type { useSignInRoutesController } from './sign-in-routes.controller';
import { SignInAccountSwitcher } from './SignInAccountSwitcher';
import { SignInClientTrust } from './SignInClientTrust';
import { SignInEmailLinkVerify } from './SignInEmailLinkVerify';
import { SignInFactorOne } from './SignInFactorOne';
import { SignInFactorTwo } from './SignInFactorTwo';
import { SignInProtectCheck } from './SignInProtectCheck';
import { SignInSSOCallback } from './SignInSSOCallback';
import { SignInStart } from './SignInStart';

type SignInRoutesController = ReturnType<typeof useSignInRoutesController>;

export function SignInRoutesView(controller: SignInRoutesController): JSX.Element {
  return (
    <Flow.Root flow='signIn'>
      <Switch>
        {/* No canActivate guard here. `!!signIn.protectCheck` flips to false the
            instant the check resolves (submitProtectCheck clears protectCheck),
            which would unmount this card mid-navigation and blank the route
            (RouteGuard renders null + navigateToFlowStart). The card owns its
            own routing — it navigates to the next step on resolution. */}
        <Route path='protect-check'>
          <SignInProtectCheck />
        </Route>
        <Route path='factor-one'>
          <SignInFactorOne />
        </Route>
        <Route path='factor-two'>
          <SignInFactorTwo />
        </Route>
        <Route path='client-trust'>
          <SignInClientTrust />
        </Route>
        <Route path='reset-password'>
          <ResetPassword />
        </Route>
        <Route path='reset-password-success'>
          <ResetPasswordSuccess />
        </Route>
        <Route path='sso-callback'>
          <SignInSSOCallback {...controller.signInOAuthCallbackParams} />
        </Route>
        <Route path='choose'>
          <SignInAccountSwitcher />
        </Route>
        <Route path='choose-wallet'>
          <SignInFactorOneSolanaWalletsCard />
        </Route>
        <Route path='verify'>
          <SignInEmailLinkVerify />
        </Route>

        {controller.isCombinedFlow && (
          <Route path='create'>
            {/* No canActivate guard — same resolution race as the sign-in
                protect-check route above; the card owns its own routing. */}
            <Route path='protect-check'>
              <LazySignUpProtectCheck />
            </Route>
            <Route
              path='verify-email-address'
              canActivate={clerk => !!clerk.client.signUp.emailAddress}
            >
              <LazySignUpVerifyEmail />
            </Route>
            <Route
              path='verify-phone-number'
              canActivate={clerk => !!clerk.client.signUp.phoneNumber}
            >
              <LazySignUpVerifyPhone />
            </Route>
            <Route path='sso-callback'>
              <LazySignUpSSOCallback {...controller.signUpOAuthCallbackParams} />
            </Route>
            <Route path='verify'>
              <SignUpEmailLinkFlowComplete
                redirectUrlComplete={controller.afterSignUpUrl}
                ssoCallbackUrl={controller.ssoCallbackUrl}
                oidcPrompt={controller.oidcPrompt}
                verifyEmailPath='../verify-email-address'
                verifyPhonePath='../verify-phone-number'
                continuePath='../continue'
              />
            </Route>
            <Route path='continue'>
              {/* No canActivate guard — same resolution race as the sign-in
                  protect-check route; the card owns its own routing. */}
              <Route path='protect-check'>
                {/* Under `create/continue`, the continue index is `..`, not `../continue`. */}
                <LazySignUpProtectCheck continuePath='..' />
              </Route>
              <Route
                path='verify-email-address'
                canActivate={clerk => !!clerk.client.signUp.emailAddress}
              >
                <LazySignUpVerifyEmail />
              </Route>
              <Route
                path='verify-phone-number'
                canActivate={clerk => !!clerk.client.signUp.phoneNumber}
              >
                <LazySignUpVerifyPhone />
              </Route>
              <Route index>
                <LazySignUpContinue />
              </Route>
            </Route>
            <Route path='tasks'>
              <LazySessionTasks redirectUrlComplete={controller.combinedFlowTasksRedirectUrl} />
            </Route>
            <Route index>
              <LazySignUpStart />
            </Route>
          </Route>
        )}
        <Route path='tasks'>
          <LazySessionTasks redirectUrlComplete={controller.afterSignInUrl} />
        </Route>
        <Route index>
          <SignInStart />
        </Route>
        <Route>
          <RedirectToSignIn />
        </Route>
      </Switch>
    </Flow.Root>
  );
}
