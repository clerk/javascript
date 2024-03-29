import { useClerk } from '@clerk/shared/react';
import { snakeToCamel } from '@clerk/shared/underscore';
import type { OrganizationResource, UserResource } from '@clerk/types';
import React, { useMemo } from 'react';

import { SIGN_IN_INITIAL_VALUE_KEYS, SIGN_UP_INITIAL_VALUE_KEYS } from '../../core/constants';
import { buildAuthQueryString, buildURL, createDynamicParamParser, pickRedirectionProp } from '../../utils';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../constants';
import { useEnvironment, useOptions } from '../contexts';
import type { NavbarRoute } from '../elements';
import type { ParsedQs } from '../router';
import { useRouter } from '../router';
import type {
  AvailableComponentCtx,
  CreateOrganizationCtx,
  OrganizationListCtx,
  OrganizationProfileCtx,
  OrganizationSwitcherCtx,
  SignInCtx,
  SignUpCtx,
  UserButtonCtx,
  UserProfileCtx,
} from '../types';
import type { CustomPageContent } from '../utils';
import { createOrganizationProfileCustomPages, createUserProfileCustomPages } from '../utils';

const populateParamFromObject = createDynamicParamParser({ regex: /:(\w+)/ });

export const ComponentContext = React.createContext<AvailableComponentCtx | null>(null);

const getInitialValuesFromQueryParams = (queryString: string, params: string[]) => {
  const props: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((value, key) => {
    if (params.includes(key) && typeof value === 'string') {
      props[snakeToCamel(key)] = value;
    }
  });

  return props;
};

export type SignUpContextType = SignUpCtx & {
  navigateAfterSignUp: () => any;
  queryParams: ParsedQs;
  signInUrl: string;
  signUpUrl: string;
  secondFactorUrl: string;
  authQueryString: string | null;
};

export const useSignUpContext = (): SignUpContextType => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as SignUpCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useClerk();

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_UP_INITIAL_VALUE_KEYS),
    [],
  );

  if (componentName !== 'SignUp') {
    throw new Error('Clerk: useSignUpContext called outside of the mounted SignUp component.');
  }

  const afterSignUpUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignUpUrl', {
      queryParams,
      ctx,
      options,
    }) || '/',
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignInUrl', {
      queryParams,
      ctx,
      options,
    }) || '/',
  );

  const navigateAfterSignUp = () => navigate(afterSignUpUrl);

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });

  // The `ctx` object here refers to the SignUp component's props.
  // SignUp's own options won't have a `signUpUrl` property, so we have to get the value
  // from the `path` prop instead, when the routing is set to 'path'.
  let signUpUrl =
    (ctx.routing === 'path' ? ctx.path : undefined) ||
    pickRedirectionProp('signUpUrl', { options, displayConfig }, false);
  if (authQs && ctx.routing !== 'virtual') {
    signUpUrl += `#/?${authQs}`;
  }

  let signInUrl = pickRedirectionProp('signInUrl', { ctx, options, displayConfig }, false);
  if (authQs && ctx.routing !== 'virtual') {
    signInUrl += `#/?${authQs}`;
  }

  // TODO: Avoid building this url again to remove duplicate code. Get it from window.Clerk instead.
  const secondFactorUrl = buildURL({ base: signInUrl, hashPath: '/factor-two' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signInUrl,
    signUpUrl,
    secondFactorUrl,
    afterSignUpUrl,
    afterSignInUrl,
    navigateAfterSignUp,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString: authQs,
  };
};

export type SignInContextType = SignInCtx & {
  navigateAfterSignIn: () => any;
  queryParams: ParsedQs;
  signUpUrl: string;
  signInUrl: string;
  signUpContinueUrl: string;
  authQueryString: string | null;
};

export const useSignInContext = (): SignInContextType => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as SignInCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useClerk();

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_IN_INITIAL_VALUE_KEYS),
    [],
  );

  if (componentName !== 'SignIn') {
    throw new Error('Clerk: useSignInContext called outside of the mounted SignIn component.');
  }

  const afterSignUpUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignUpUrl', {
      queryParams,
      ctx,
      options,
    }) || '/',
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(
    pickRedirectionProp('afterSignInUrl', {
      queryParams,
      ctx,
      options,
    }) || '/',
  );

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });

  let signUpUrl = pickRedirectionProp('signUpUrl', { ctx, options, displayConfig }, false);
  if (authQs && ctx.routing !== 'virtual') {
    signUpUrl += `#/?${authQs}`;
  }

  // The `ctx` object here refers to the SignIn component's props.
  // SignIn's own options won't have a `signInUrl` property, so we have to get the value
  // from the `path` prop instead, when the routing is set to 'path'.
  let signInUrl =
    (ctx.routing === 'path' ? ctx.path : undefined) ||
    pickRedirectionProp('signInUrl', { options, displayConfig }, false);
  if (authQs && ctx.routing !== 'virtual') {
    signInUrl += `#/?${authQs}`;
  }

  const signUpContinueUrl = buildURL({ base: signUpUrl, hashPath: '/continue' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signUpUrl,
    signInUrl,
    afterSignInUrl,
    afterSignUpUrl,
    navigateAfterSignIn,
    signUpContinueUrl,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString: authQs,
  };
};

export type SignOutContextType = {
  navigateAfterSignOut: () => any;
};

export const useSignOutContext = (): SignOutContextType => {
  const { navigate } = useRouter();
  const clerk = useClerk();

  const navigateAfterSignOut = () => navigate(clerk.buildAfterSignOutUrl());

  return { navigateAfterSignOut };
};

type PagesType = {
  routes: NavbarRoute[];
  contents: CustomPageContent[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};

export type UserProfileContextType = UserProfileCtx & {
  queryParams: ParsedQs;
  authQueryString: string | null;
  pages: PagesType;
};

export const useUserProfileContext = (): UserProfileContextType => {
  const { componentName, customPages, ...ctx } = (React.useContext(ComponentContext) || {}) as UserProfileCtx;
  const { queryParams } = useRouter();
  const clerk = useClerk();

  if (componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  const pages = useMemo(() => {
    return createUserProfileCustomPages(customPages || [], clerk);
  }, [customPages]);

  return {
    ...ctx,
    pages,
    componentName,
    queryParams,
    authQueryString: '',
  };
};

export const useUserButtonContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as UserButtonCtx;
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const options = useOptions();

  if (componentName !== 'UserButton') {
    throw new Error('Clerk: useUserButtonContext called outside of the mounted UserButton component.');
  }

  const signInUrl = pickRedirectionProp('signInUrl', { ctx, options, displayConfig }, false);
  const userProfileUrl = ctx.userProfileUrl || displayConfig.userProfileUrl;

  const afterSignOutUrl = ctx.afterSignOutUrl || clerk.buildAfterSignOutUrl();
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);

  const afterMultiSessionSingleSignOutUrl = ctx.afterMultiSessionSingleSignOutUrl || afterSignOutUrl;
  const navigateAfterMultiSessionSingleSignOut = () => clerk.redirectWithAuth(afterMultiSessionSingleSignOutUrl);

  const afterSwitchSessionUrl = ctx.afterSwitchSessionUrl || displayConfig.afterSwitchSessionUrl;
  const navigateAfterSwitchSession = () => navigate(afterSwitchSessionUrl);

  const userProfileMode = !!ctx.userProfileUrl && !ctx.userProfileMode ? 'navigation' : ctx.userProfileMode;

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
    userProfileMode: userProfileMode || 'modal',
  };
};

export const useOrganizationSwitcherContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as OrganizationSwitcherCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'OrganizationSwitcher') {
    throw new Error('Clerk: useOrganizationSwitcherContext called outside OrganizationSwitcher.');
  }

  const afterCreateOrganizationUrl = ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl;
  const afterLeaveOrganizationUrl = ctx.afterLeaveOrganizationUrl || displayConfig.afterLeaveOrganizationUrl;

  const navigateCreateOrganization = () => navigate(ctx.createOrganizationUrl || displayConfig.createOrganizationUrl);
  const navigateOrganizationProfile = () =>
    navigate(ctx.organizationProfileUrl || displayConfig.organizationProfileUrl);

  const navigateAfterSelectOrganizationOrPersonal = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return navigate(ctx.afterSelectPersonalUrl(user));
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return navigate(ctx.afterSelectOrganizationUrl(organization));
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return navigate(parsedUrl);
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return Promise.resolve();
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });

  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  const organizationProfileMode =
    !!ctx.organizationProfileUrl && !ctx.organizationProfileMode ? 'navigation' : ctx.organizationProfileMode;

  const createOrganizationMode =
    !!ctx.createOrganizationUrl && !ctx.createOrganizationMode ? 'navigation' : ctx.createOrganizationMode;

  return {
    ...ctx,
    hidePersonal: ctx.hidePersonal || false,
    organizationProfileMode: organizationProfileMode || 'modal',
    createOrganizationMode: createOrganizationMode || 'modal',
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    afterCreateOrganizationUrl,
    afterLeaveOrganizationUrl,
    navigateOrganizationProfile,
    navigateCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    componentName,
  };
};

export const useOrganizationListContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as unknown as OrganizationListCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'OrganizationList') {
    throw new Error('Clerk: useOrganizationListContext called outside OrganizationList.');
  }

  const afterCreateOrganizationUrl = ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl;

  const navigateAfterCreateOrganization = (organization: OrganizationResource) => {
    if (typeof ctx.afterCreateOrganizationUrl === 'function') {
      return navigate(ctx.afterCreateOrganizationUrl(organization));
    }

    if (ctx.afterCreateOrganizationUrl) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterCreateOrganizationUrl,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return navigate(displayConfig.afterCreateOrganizationUrl);
  };

  const navigateAfterSelectOrganizationOrPersonal = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return navigate(ctx.afterSelectPersonalUrl(user));
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return navigate(ctx.afterSelectOrganizationUrl(organization));
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return navigate(parsedUrl);
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return Promise.resolve();
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });
  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  return {
    ...ctx,
    afterCreateOrganizationUrl,
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    hidePersonal: ctx.hidePersonal || false,
    navigateAfterCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    componentName,
  };
};

export type OrganizationProfileContextType = OrganizationProfileCtx & {
  pages: PagesType;
  navigateAfterLeaveOrganization: () => Promise<unknown>;
  navigateToGeneralPageRoot: () => Promise<unknown>;
  isMembersPageRoot: boolean;
  isGeneralPageRoot: boolean;
  isBillingPageRoot: boolean;
};

export const useOrganizationProfileContext = (): OrganizationProfileContextType => {
  const { componentName, customPages, ...ctx } = (React.useContext(ComponentContext) || {}) as OrganizationProfileCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const clerk = useClerk();

  if (componentName !== 'OrganizationProfile') {
    throw new Error('Clerk: useOrganizationProfileContext called outside OrganizationProfile.');
  }

  const pages = useMemo(() => createOrganizationProfileCustomPages(customPages || [], clerk), [customPages]);

  const navigateAfterLeaveOrganization = () =>
    navigate(ctx.afterLeaveOrganizationUrl || displayConfig.afterLeaveOrganizationUrl);

  const isMembersPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS;
  const isGeneralPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL;
  const isBillingPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING;

  const navigateToGeneralPageRoot = () =>
    navigate(isGeneralPageRoot ? '../' : isMembersPageRoot ? './organization-general' : '../organization-general');

  return {
    ...ctx,
    pages,
    navigateAfterLeaveOrganization,
    componentName,
    navigateToGeneralPageRoot,
    isMembersPageRoot,
    isGeneralPageRoot,
    isBillingPageRoot,
  };
};

export const useCreateOrganizationContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as CreateOrganizationCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'CreateOrganization') {
    throw new Error('Clerk: useCreateOrganizationContext called outside CreateOrganization.');
  }

  const navigateAfterCreateOrganization = (organization: OrganizationResource) => {
    if (typeof ctx.afterCreateOrganizationUrl === 'function') {
      return navigate(ctx.afterCreateOrganizationUrl(organization));
    }

    if (ctx.afterCreateOrganizationUrl) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterCreateOrganizationUrl,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return navigate(displayConfig.afterCreateOrganizationUrl);
  };

  return {
    ...ctx,
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    navigateAfterCreateOrganization,
    componentName,
  };
};
