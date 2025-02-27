import { useClerk } from '@clerk/shared/react';
import type { SignInModalProps, SignInProps } from '@clerk/types';
import React from 'react';

import { sessionTaskRoutePaths } from '../../../ui/common/tasks';
import { normalizeRoutingOptions } from '../../../utils/normalizeRoutingOptions';
import { SignInEmailLinkFlowComplete, SignUpEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import type { SignUpContextType } from '../../contexts';
import {
  SignInContext,
  SignUpContext,
  useSignInContext,
  useSignUpContext,
  withCoreSessionSwitchGuard,
} from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { SignUpContinue } from '../SignUp/SignUpContinue';
import { SignUpSSOCallback } from '../SignUp/SignUpSSOCallback';
import { SignUpStart } from '../SignUp/SignUpStart';
import { SignUpVerifyEmail } from '../SignUp/SignUpVerifyEmail';
import { SignUpVerifyPhone } from '../SignUp/SignUpVerifyPhone';
import { Task } from '../Task';
import { ResetPassword } from './ResetPassword';
import { ResetPasswordSuccess } from './ResetPasswordSuccess';
import { SignInAccountSwitcher } from './SignInAccountSwitcher';
import { SignInFactorOne } from './SignInFactorOne';
import { SignInFactorTwo } from './SignInFactorTwo';
import { SignInSSOCallback } from './SignInSSOCallback';
import { SignInStart } from './SignInStart';

function RedirectToSignIn() {
  const clerk = useClerk();
  React.useEffect(() => {
    void clerk.redirectToSignIn();
  }, []);
  return null;
}

function SignInRoutes(): JSX.Element {
  const signInContext = useSignInContext();
  const signUpContext = useSignUpContext();

  return (
    <Flow.Root flow='signIn'>
      <Switch>
        <Route path='factor-one'>
          <SignInFactorOne />
        </Route>
        <Route path='factor-two'>
          <SignInFactorTwo />
        </Route>
        <Route path='reset-password'>
          <ResetPassword />
        </Route>
        <Route path='reset-password-success'>
          <ResetPasswordSuccess />
        </Route>
        <Route path='sso-callback'>
          <SignInSSOCallback
            signUpUrl={signInContext.signUpUrl}
            signInUrl={signInContext.signInUrl}
            signInForceRedirectUrl={signInContext.afterSignInUrl}
            signUpForceRedirectUrl={signInContext.afterSignUpUrl}
            continueSignUpUrl={signInContext.signUpContinueUrl}
            transferable={signInContext.transferable}
            firstFactorUrl={'../factor-one'}
            secondFactorUrl={'../factor-two'}
            resetPasswordUrl={'../reset-password'}
          />
        </Route>
        <Route path='choose'>
          <SignInAccountSwitcher />
        </Route>
        <Route path='verify'>
          <SignInEmailLinkFlowComplete
            redirectUrlComplete={signInContext.afterSignInUrl}
            redirectUrl='../factor-two'
          />
        </Route>
        {signInContext.isCombinedFlow && (
          <Route path='create'>
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
                continuePath='../continue'
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
          </Route>
        )}
        {sessionTaskRoutePaths.map(path => (
          <Route
            key={path}
            path={path}
          >
            <Task />
          </Route>
        ))}
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

function SignInRoot() {
  const signInContext = useSignInContext();
  const normalizedSignUpContext = {
    componentName: 'SignUp',
    emailLinkRedirectUrl: signInContext.emailLinkRedirectUrl,
    ssoCallbackUrl: signInContext.ssoCallbackUrl,
    forceRedirectUrl: signInContext.signUpForceRedirectUrl,
    fallbackRedirectUrl: signInContext.signUpFallbackRedirectUrl,
    signInUrl: signInContext.signInUrl,
    unsafeMetadata: signInContext.unsafeMetadata,
    ...normalizeRoutingOptions({ routing: signInContext?.routing, path: signInContext?.path }),
  } as SignUpContextType;

  return (
    <SignUpContext.Provider value={normalizedSignUpContext}>
      <SignInRoutes />
    </SignUpContext.Provider>
  );
}

SignInRoutes.displayName = 'SignIn';

export const SignIn: React.ComponentType<SignInProps> = withCoreSessionSwitchGuard(SignInRoot);

export const SignInModal = (props: SignInModalProps): JSX.Element => {
  const signInProps = {
    signUpUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-up`,
    waitlistUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/waitlist`,
    ...props,
  };

  return (
    <Route path='sign-in'>
      <SignInContext.Provider
        value={{
          componentName: 'SignIn',
          ...signInProps,
          routing: 'virtual',
          mode: 'modal',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <SignIn
            {...signInProps}
            routing='virtual'
          />
        </div>
      </SignInContext.Provider>
    </Route>
  );
};
