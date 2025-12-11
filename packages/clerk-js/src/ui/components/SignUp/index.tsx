import { useClerk } from '@clerk/shared/react';
import type { SignUpModalProps, SignUpProps } from '@clerk/shared/types';
import React from 'react';

import { SignUpStartSolanaWalletsCard } from '@/ui/components/SignUp/SignUpStartSolanaWalletsCard';
import { usePreloadTasks } from '@/ui/hooks/usePreloadTasks';

import { SessionTasks as LazySessionTasks } from '../../../ui/lazyModules/components';
import { SignUpEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import { SignUpContext, useSignUpContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { SignUpContinue } from './SignUpContinue';
import { SignUpEnterpriseConnections } from './SignUpEnterpriseConnections';
import { SignUpSSOCallback } from './SignUpSSOCallback';
import { SignUpStart } from './SignUpStart';
import { SignUpVerifyEmail } from './SignUpVerifyEmail';
import { SignUpVerifyPhone } from './SignUpVerifyPhone';

function RedirectToSignUp() {
  const clerk = useClerk();
  React.useEffect(() => {
    void clerk.redirectToSignUp();
  }, []);
  return null;
}

function SignUpRoutes(): JSX.Element {
  usePreloadTasks();

  const signUpContext = useSignUpContext();

  return (
    <Flow.Root flow='signUp'>
      <Switch>
        <Route
          path='verify-email-address'
          canActivate={clerk => !!clerk.client.signUp.emailAddress}
        >
          <SignUpVerifyEmail />
        </Route>
        <Route
          path='verify-phone-number'
          canActivate={clerk => !!clerk.client.signUp.phoneNumber}
        >
          <SignUpVerifyPhone />
        </Route>
        <Route path='sso-callback'>
          <SignUpSSOCallback
            signUpUrl={signUpContext.signUpUrl}
            signInUrl={signUpContext.signInUrl}
            signUpForceRedirectUrl={signUpContext.afterSignUpUrl}
            signInForceRedirectUrl={signUpContext.afterSignInUrl}
            secondFactorUrl={signUpContext.secondFactorUrl}
            continueSignUpUrl='../continue'
            verifyEmailAddressUrl='../verify-email-address'
            verifyPhoneNumberUrl='../verify-phone-number'
          />
        </Route>
        <Route path='verify'>
          <SignUpEmailLinkFlowComplete
            redirectUrlComplete={signUpContext.afterSignUpUrl}
            verifyEmailPath='../verify-email-address'
            verifyPhonePath='../verify-phone-number'
          />
        </Route>
        <Route path='continue'>
          <Route
            path='verify-email-address'
            canActivate={clerk => !!clerk.client.signUp.emailAddress}
          >
            <SignUpVerifyEmail />
          </Route>
          <Route
            path='verify-phone-number'
            canActivate={clerk => !!clerk.client.signUp.phoneNumber}
          >
            <SignUpVerifyPhone />
          </Route>
          <Route index>
            <SignUpContinue />
          </Route>
        </Route>
        <Route path='tasks'>
          <LazySessionTasks redirectUrlComplete={signUpContext.afterSignUpUrl} />
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
          <RedirectToSignUp />
        </Route>
      </Switch>
    </Flow.Root>
  );
}

SignUpRoutes.displayName = 'SignUp';

export const SignUp: React.ComponentType<SignUpProps> = withCoreSessionSwitchGuard(SignUpRoutes);

export const SignUpModal = (props: SignUpModalProps): JSX.Element => {
  const signUpProps = {
    signInUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-in`,
    waitlistUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/waitlist`,
    ...props,
  };

  return (
    <Route path='sign-up'>
      <SignUpContext.Provider
        value={{
          componentName: 'SignUp',
          ...signUpProps,
          routing: 'virtual',
          mode: 'modal',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <SignUp
            {...signUpProps}
            routing='virtual'
          />
        </div>
      </SignUpContext.Provider>
    </Route>
  );
};

export { SignUpContinue, SignUpSSOCallback, SignUpStart, SignUpVerifyEmail, SignUpVerifyPhone };
