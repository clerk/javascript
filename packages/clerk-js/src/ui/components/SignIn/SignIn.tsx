import { useClerk } from '@clerk/shared/react';
import type { SignInModalProps, SignInProps } from '@clerk/types';
import React from 'react';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../../core/sessionTasks';
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
import { useFetch } from '../../hooks';
import { preloadSessionTask, SessionTask } from '../../lazyModules/components';
import { Route, Switch, useRouter, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import {
  LazySignUpContinue,
  LazySignUpSSOCallback,
  LazySignUpStart,
  LazySignUpVerifyEmail,
  LazySignUpVerifyPhone,
  preloadSignUp,
} from './lazy-sign-up';
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
              <LazySignUpVerifyEmail />
            </Route>
            <Route
              path='verify-phone-number'
              canActivate={clerk => !!clerk.client.signUp.phoneNumber}
            >
              <LazySignUpVerifyPhone />
            </Route>
            <Route path='sso-callback'>
              <LazySignUpSSOCallback
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
                <LazySignUpVerifyEmail />
              </Route>
              <Route
                path='verify-phone-number'
                canActivate={clerk => !!clerk.client.signUp.phoneNumber}
              >
                <LazySignUpVerifyPhone />
              </Route>
              {signInContext.withSessionTasks && (
                <Route path={SESSION_TASK_ROUTE_BY_KEY['org']}>
                  <SessionTask task='org' />
                </Route>
              )}
              <Route index>
                <LazySignUpContinue />
              </Route>
            </Route>
            <Route index>
              <LazySignUpStart />
            </Route>
          </Route>
        )}
        {signInContext.withSessionTasks && (
          <Route path={SESSION_TASK_ROUTE_BY_KEY['org']}>
            <SessionTask task='org' />
          </Route>
        )}
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

const usePreloadSignUp = (enabled = false) =>
  useFetch(enabled ? preloadSignUp : undefined, 'preloadComponent', { staleTime: Infinity });

const usePreloadSessionTask = (enabled = false) =>
  useFetch(enabled ? preloadSessionTask : undefined, 'preloadComponent', { staleTime: Infinity });

function SignInRoot() {
  const { __internal_setComponentNavigationContext } = useClerk();
  const { navigate, basePath } = useRouter();

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

  /**
   * Preload Sign Up when in Combined Flow.
   */
  usePreloadSignUp(signInContext.isCombinedFlow);

  // `experimental.withSessionTasks` will be removed soon in favor of checking via environment response
  usePreloadSessionTask(signInContext.withSessionTasks);

  React.useEffect(() => {
    return __internal_setComponentNavigationContext?.({ basePath, navigate });
  }, [basePath, navigate]);

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
