import React from 'react';

import { buildURL } from '../../utils/url';
import { buildAuthQueryString, parseAuthProp } from '../common/authPropHelpers';
import { useEnvironment } from '../contexts';
import { useNavigate } from '../hooks';
import type { ParsedQs } from '../router';
import { useRouter } from '../router';
import type { AvailableComponentCtx, SignInCtx, SignUpCtx, UserButtonCtx, UserProfileCtx } from '../types';

export const ComponentContext = React.createContext<AvailableComponentCtx | null>(null);

export type SignUpContextType = SignUpCtx & {
  navigateAfterSignUp: () => any;
  queryParams: ParsedQs;
  signInUrl: string;
  secondFactorUrl: string;
  authQueryString: string | null;
};
export const useSignUpContext = (): SignUpContextType => {
  const { componentName, ...ctx } = React.useContext(ComponentContext) as SignUpCtx;
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();

  if (componentName !== 'SignUp') {
    throw new Error('Clerk: useSignUpContext called outside of the mounted SignUp component.');
  }

  // Retrieve values passed through props or qs
  // props always take priority over qs
  const afterSignUpUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignUpUrl',
  });

  const afterSignInUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignInUrl',
  });

  const navigateAfterSignUp = () => navigate(afterSignUpUrl);

  let signInUrl = ctx.signInUrl || displayConfig.signInUrl;

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });

  // Todo: Look for a better way than checking virtual
  if (authQs && ctx.routing != 'virtual') {
    signInUrl += `#/?${authQs}`;
  }

  // TODO: Avoid building this url again to remove duplicate code. Get it from window.Clerk instead.
  const secondFactorUrl = buildURL({ base: signInUrl, hashPath: '/factor-two' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signInUrl,
    secondFactorUrl,
    afterSignUpUrl,
    afterSignInUrl,
    navigateAfterSignUp,
    queryParams,
    authQueryString: authQs,
  };
};

export type SignInContextType = SignInCtx & {
  navigateAfterSignIn: () => any;
  queryParams: ParsedQs;
  signUpUrl: string;
  signUpContinueUrl: string;
  authQueryString: string | null;
};

export const useSignInContext = (): SignInContextType => {
  const { componentName, ...ctx } = React.useContext(ComponentContext) as SignInCtx;
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();

  if (componentName !== 'SignIn') {
    throw new Error('Clerk: useSignInContext called outside of the mounted SignIn component.');
  }

  // Retrieve values passed through props or qs
  // props always take priority over qs
  const afterSignUpUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignUpUrl',
  });

  const afterSignInUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignInUrl',
  });

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  let signUpUrl = ctx.signUpUrl || displayConfig.signUpUrl;

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });
  if (authQs && ctx.routing !== 'virtual') {
    signUpUrl += `#/?${authQs}`;
  }

  const signUpContinueUrl = buildURL({ base: signUpUrl, hashPath: '/continue' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    navigateAfterSignIn,
    signUpContinueUrl,
    queryParams,
    authQueryString: authQs,
  };
};

export type UserProfileContextType = UserProfileCtx & {
  queryParams: ParsedQs;
  authQueryString: string | null;
};

// UserProfile does not accept any props except for
// `routing` and `path`
// TODO: remove if not needed during the components v2 overhaul
export const useUserProfileContext = (): UserProfileContextType => {
  const { componentName, ...ctx } = React.useContext(ComponentContext) as UserProfileCtx;
  const { queryParams } = useRouter();

  if (componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  return {
    ...ctx,
    componentName,
    queryParams,
    authQueryString: '',
  };
};

export const useUserButtonContext = () => {
  const { componentName, ...ctx } = React.useContext(ComponentContext) as UserButtonCtx;
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'UserButton') {
    throw new Error('Clerk: useUserButtonContext called outside of the mounted UserButton component.');
  }

  const signInUrl = ctx.signInUrl || displayConfig.signInUrl;
  const userProfileUrl = ctx.userProfileUrl || displayConfig.userProfileUrl;

  const afterMultiSessionSingleSignOutUrl = ctx.afterMultiSessionSingleSignOutUrl || displayConfig.afterSignOutOneUrl;
  const navigateAfterMultiSessionSingleSignOut = () => navigate(afterMultiSessionSingleSignOutUrl);

  const afterSignOutUrl = ctx.afterSignOutUrl || displayConfig.afterSignOutAllUrl;
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);

  const afterSwitchSessionUrl = ctx.afterSwitchSessionUrl || displayConfig.afterSwitchSessionUrl;
  const navigateAfterSwitchSession = () => navigate(afterSwitchSessionUrl);

  return {
    ...ctx,
    componentName,
    navigateAfterMultiSessionSingleSignOut,
    navigateAfterSignOut,
    navigateAfterSwitchSession,
    signInUrl,
    userProfileUrl,
    afterMultiSessionSingleSignOutUrl,
    afterSignOutUrl,
    afterSwitchSessionUrl,
  };
};
