import React from 'react';

import { buildAuthQueryString, buildURL, pickRedirectionProp } from '../../utils';
import { useCoreClerk, useEnvironment, useOptions } from '../contexts';
import { useNavigate } from '../hooks';
import type { ParsedQs } from '../router';
import { useRouter } from '../router';
import type { AvailableComponentCtx, SignInCtx, SignUpCtx, UserProfileCtx } from '../types';

export const ComponentContext = React.createContext<AvailableComponentCtx | null>(null);

export type SignUpContextType = SignUpCtx & {
  navigateAfterSignUp: () => any;
  queryParams: ParsedQs;
  signInUrl: string;
  secondFactorUrl: string;
  authQueryString: string | null;
};

export const useSignUpContext = (): SignUpContextType => {
  const ctx = React.useContext(ComponentContext);
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();
  const options = useOptions();
  const clerk = useCoreClerk();

  if (ctx?.componentName !== 'SignUp') {
    throw new Error('Clerk: useSignUpContext called outside of the mounted SignUp component.');
  }

  const afterSignUpUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignUpUrl', {
      queryParams,
      ctx,
      options,
      displayConfig,
    }),
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignInUrl', {
      queryParams,
      ctx,
      options,
      displayConfig,
    }),
  );

  const navigateAfterSignUp = () => navigate(afterSignUpUrl);

  let signInUrl = pickRedirectionProp('signInUrl', { ctx, options, displayConfig }, false);

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
  const ctx = React.useContext(ComponentContext);
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();
  const options = useOptions();
  const clerk = useCoreClerk();

  if (ctx?.componentName !== 'SignIn') {
    throw new Error('Clerk: useSignInContext called outside of the mounted SignIn component.');
  }

  const afterSignUpUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignUpUrl', {
      queryParams,
      ctx,
      options,
      displayConfig,
    }),
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignInUrl', {
      queryParams,
      ctx,
      options,
      displayConfig,
    }),
  );

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  let signUpUrl = pickRedirectionProp('signUpUrl', { ctx, options, displayConfig }, false);

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
  const ctx = React.useContext(ComponentContext);
  const { queryParams } = useRouter();

  if (ctx?.componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  return {
    ...ctx,
    queryParams,
    authQueryString: '',
  };
};

export const useUserButtonContext = () => {
  const ctx = React.useContext(ComponentContext);
  const { navigate } = useNavigate();
  const Clerk = useCoreClerk();
  const { displayConfig } = useEnvironment();
  const options = useOptions();

  if (ctx?.componentName !== 'UserButton') {
    throw new Error('Clerk: useUserButtonContext called outside of the mounted UserButton component.');
  }

  const signInUrl = pickRedirectionProp('signInUrl', { ctx, options, displayConfig }, false);
  const userProfileUrl = ctx.userProfileUrl || displayConfig.userProfileUrl;

  const afterMultiSessionSingleSignOutUrl = ctx.afterMultiSessionSingleSignOutUrl || displayConfig.afterSignOutOneUrl;
  const navigateAfterMultiSessionSingleSignOut = () => Clerk.redirectWithAuth(afterMultiSessionSingleSignOutUrl);

  const afterSignOutUrl = ctx.afterSignOutUrl;
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);

  const afterSwitchSessionUrl = ctx.afterSwitchSessionUrl;
  const navigateAfterSwitchSession = () => navigate(afterSwitchSessionUrl);

  return {
    ...ctx,
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

export const useOrganizationSwitcherContext = () => {
  const ctx = React.useContext(ComponentContext);
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();

  if (ctx?.componentName !== 'OrganizationSwitcher') {
    throw new Error('Clerk: useUserButtonContext called outside OrganizationSwitcher.');
  }

  const afterCreateOrganizationUrl = ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl;
  const afterLeaveOrganizationUrl = ctx.afterLeaveOrganizationUrl || displayConfig.afterLeaveOrganizationUrl;

  const navigateCreateOrganization = () => navigate(ctx.createOrganizationUrl || displayConfig.createOrganizationUrl);
  const navigateOrganizationProfile = () =>
    navigate(ctx.organizationProfileUrl || displayConfig.organizationProfileUrl);
  const navigateAfterSwitchOrganization = () =>
    ctx.afterSwitchOrganizationUrl ? navigate(ctx.afterSwitchOrganizationUrl) : Promise.resolve();

  return {
    ...ctx,
    hidePersonal: ctx.hidePersonal || false,
    organizationProfileMode: ctx.organizationProfileMode || 'modal',
    createOrganizationMode: ctx.createOrganizationMode || 'modal',
    afterCreateOrganizationUrl,
    afterLeaveOrganizationUrl,
    navigateOrganizationProfile,
    navigateCreateOrganization,
    navigateAfterSwitchOrganization,
  };
};

export const useOrganizationProfileContext = () => {
  const ctx = React.useContext(ComponentContext);
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();

  if (ctx?.componentName !== 'OrganizationProfile') {
    throw new Error('Clerk: useOrganizationProfileContext called outside OrganizationProfile.');
  }

  const navigateAfterLeaveOrganization = () =>
    navigate(ctx.afterLeaveOrganizationUrl || displayConfig.afterLeaveOrganizationUrl);

  return {
    ...ctx,
    navigateAfterLeaveOrganization,
  };
};

export const useCreateOrganizationContext = () => {
  const ctx = React.useContext(ComponentContext);
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();

  if (ctx?.componentName !== 'CreateOrganization') {
    throw new Error('Clerk: useCreateOrganizationContext called outside CreateOrganization.');
  }

  const navigateAfterCreateOrganization = () =>
    navigate(ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl);

  return {
    ...ctx,
    navigateAfterCreateOrganization,
  };
};
