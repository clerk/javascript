import { useClerk } from '@clerk/shared/react';
import type { SignUpModalProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { SignUpEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import { ComponentContext, useSignUpContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { SignUpContinue } from './SignUpContinue';
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
            afterSignUpUrl={signUpContext.afterSignUpUrl}
            afterSignInUrl={signUpContext.afterSignInUrl}
            redirectUrl={signUpContext.redirectUrl}
            secondFactorUrl={signUpContext.secondFactorUrl}
            continueSignUpUrl='../continue'
            verifyEmailAddressUrl='../verify-email-address'
            verifyPhoneNumberUrl='../verify-phone-number'
          />
        </Route>
        <Route path='verify'>
          <SignUpEmailLinkFlowComplete
            redirectUrlComplete={signUpContext.afterSignUpUrl || signUpContext.redirectUrl || undefined}
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
    ...props,
  };

  return (
    <Route path='sign-up'>
      <ComponentContext.Provider
        value={{
          componentName: 'SignUp',
          ...signUpProps,
          routing: 'virtual',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <SignUp
            {...signUpProps}
            routing='virtual'
          />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
