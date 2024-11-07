import { deprecatedObjectProperty } from '@clerk/shared/deprecated';
import { useClerk } from '@clerk/shared/react';
import { snakeToCamel } from '@clerk/shared/underscore';
import type {
  HandleOAuthCallbackParams,
  OrganizationResource,
  UserButtonProps,
  UserResource,
  WaitlistProps,
} from '@clerk/types';
import React, { useCallback, useMemo } from 'react';

import { SIGN_IN_INITIAL_VALUE_KEYS, SIGN_UP_INITIAL_VALUE_KEYS } from '../../core/constants';
import { buildURL, createDynamicParamParser } from '../../utils';
import { RedirectUrls } from '../../utils/redirectUrls';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../constants';
import { useEnvironment, useOptions } from '../contexts';
import type { NavbarRoute } from '../elements';
import type { ParsedQueryString } from '../router';
import { useRouter } from '../router';
import type {
  AvailableComponentName,
  AvailableComponentProps,
  CreateOrganizationCtx,
  GoogleOneTapCtx,
  OrganizationListCtx,
  OrganizationProfileCtx,
  OrganizationSwitcherCtx,
  SignInCtx,
  SignUpCtx,
  UserButtonCtx,
  UserProfileCtx,
  UserVerificationCtx,
  WaitlistCtx,
} from '../types';
import type { CustomPageContent } from '../utils';
import {
  createOrganizationProfileCustomPages,
  createUserButtonCustomMenuItems,
  createUserProfileCustomPages,
} from '../utils';

const populateParamFromObject = createDynamicParamParser({ regex: /:(\w+)/ });

export function ComponentContextProvider({
  componentName,
  props,
  children,
}: {
  componentName: AvailableComponentName;
  props: AvailableComponentProps;
  children: React.ReactNode;
}) {
  switch (componentName) {
    case 'SignIn':
      return <SignInContext.Provider value={{ componentName, ...props }}>{children}</SignInContext.Provider>;
    case 'SignUp':
      return <SignUpContext.Provider value={{ componentName, ...props }}>{children}</SignUpContext.Provider>;
    case 'UserProfile':
      return <UserProfileContext.Provider value={{ componentName, ...props }}>{children}</UserProfileContext.Provider>;
    case 'UserVerification':
      return (
        <UserVerificationContext.Provider value={{ componentName, ...props }}>
          {children}
        </UserVerificationContext.Provider>
      );
    case 'UserButton':
      return (
        <UserButtonContext.Provider value={{ componentName, ...(props as UserButtonProps) }}>
          {children}
        </UserButtonContext.Provider>
      );
    case 'OrganizationSwitcher':
      return (
        <OrganizationSwitcherContext.Provider value={{ componentName, ...props }}>
          {children}
        </OrganizationSwitcherContext.Provider>
      );
    case 'OrganizationList':
      return (
        <OrganizationListContext.Provider value={{ componentName, ...props }}>
          {children}
        </OrganizationListContext.Provider>
      );
    case 'OrganizationProfile':
      return (
        <OrganizationProfileContext.Provider value={{ componentName, ...props }}>
          {children}
        </OrganizationProfileContext.Provider>
      );
    case 'CreateOrganization':
      return (
        <CreateOrganizationContext.Provider value={{ componentName, ...props }}>
          {children}
        </CreateOrganizationContext.Provider>
      );
    case 'GoogleOneTap':
      return (
        <GoogleOneTapContext.Provider value={{ componentName, ...props }}>{children}</GoogleOneTapContext.Provider>
      );
    case 'Waitlist':
      return (
        <WaitlistContext.Provider value={{ componentName, ...(props as WaitlistProps) }}>
          {children}
        </WaitlistContext.Provider>
      );
    default:
      throw new Error(`Unknown component context: ${componentName}`);
  }
}

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
  queryParams: ParsedQueryString;
  signInUrl: string;
  signUpUrl: string;
  secondFactorUrl: string;
  authQueryString: string | null;
  afterSignUpUrl: string;
  afterSignInUrl: string;
  waitlistUrl: string;
};

export const SignUpContext = React.createContext<SignUpCtx | null>(null);

export const useSignUpContext = (): SignUpContextType => {
  const context = React.useContext(SignUpContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useClerk();

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_UP_INITIAL_VALUE_KEYS),
    [],
  );

  if (!context || context.componentName !== 'SignUp') {
    throw new Error('Clerk: useSignUpContext called outside of the mounted SignUp component.');
  }

  const { componentName, ...ctx } = context;

  const redirectUrls = new RedirectUrls(
    options,
    {
      ...ctx,
      signUpFallbackRedirectUrl: ctx.fallbackRedirectUrl,
      signUpForceRedirectUrl: ctx.forceRedirectUrl,
    },
    queryParams,
  );

  const afterSignUpUrl = clerk.buildUrlWithAuth(redirectUrls.getAfterSignUpUrl());
  const afterSignInUrl = clerk.buildUrlWithAuth(redirectUrls.getAfterSignInUrl());

  const navigateAfterSignUp = () => navigate(afterSignUpUrl);

  // The `ctx` object here refers to the SignUp component's props.
  // SignUp's own options won't have a `signUpUrl` property, so we have to get the value
  // from the `path` prop instead, when the routing is set to 'path'.
  let signUpUrl = (ctx.routing === 'path' && ctx.path) || options.signUpUrl || displayConfig.signUpUrl;
  let signInUrl = ctx.signInUrl || options.signInUrl || displayConfig.signInUrl;
  let waitlistUrl = ctx.waitlistUrl || options.waitlistUrl || displayConfig.waitlistUrl;

  const preservedParams = redirectUrls.getPreservedSearchParams();
  signInUrl = buildURL({ base: signInUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
  signUpUrl = buildURL({ base: signUpUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
  waitlistUrl = buildURL({ base: waitlistUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });

  // TODO: Avoid building this url again to remove duplicate code. Get it from window.Clerk instead.
  const secondFactorUrl = buildURL({ base: signInUrl, hashPath: '/factor-two' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signInUrl,
    signUpUrl,
    waitlistUrl,
    secondFactorUrl,
    afterSignUpUrl,
    afterSignInUrl,
    navigateAfterSignUp,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString: redirectUrls.toSearchParams().toString(),
  };
};

export type SignInContextType = SignInCtx & {
  navigateAfterSignIn: () => any;
  queryParams: ParsedQueryString;
  signUpUrl: string;
  signInUrl: string;
  signUpContinueUrl: string;
  authQueryString: string | null;
  afterSignUpUrl: string;
  afterSignInUrl: string;
  transferable: boolean;
  waitlistUrl: string;
};

export const SignInContext = React.createContext<SignInCtx | null>(null);

export const useSignInContext = (): SignInContextType => {
  const context = React.useContext(SignInContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useClerk();

  if (context === null || context.componentName !== 'SignIn') {
    throw new Error(`Clerk: useSignInContext called outside of the mounted SignIn component.`);
  }

  const { componentName, ...ctx } = context;

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_IN_INITIAL_VALUE_KEYS),
    [],
  );

  const redirectUrls = new RedirectUrls(
    options,
    {
      ...ctx,
      signInFallbackRedirectUrl: ctx.fallbackRedirectUrl,
      signInForceRedirectUrl: ctx.forceRedirectUrl,
    },
    queryParams,
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(redirectUrls.getAfterSignInUrl());
  const afterSignUpUrl = clerk.buildUrlWithAuth(redirectUrls.getAfterSignUpUrl());

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  // The `ctx` object here refers to the SignIn component's props.
  // SignIn's own options won't have a `signInUrl` property, so we have to get the value
  // from the `path` prop instead, when the routing is set to 'path'.
  let signInUrl = (ctx.routing === 'path' && ctx.path) || options.signInUrl || displayConfig.signInUrl;
  let signUpUrl = ctx.signUpUrl || options.signUpUrl || displayConfig.signUpUrl;
  let waitlistUrl = ctx.waitlistUrl || options.waitlistUrl || displayConfig.waitlistUrl;

  const preservedParams = redirectUrls.getPreservedSearchParams();
  signInUrl = buildURL({ base: signInUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
  signUpUrl = buildURL({ base: signUpUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
  waitlistUrl = buildURL({ base: waitlistUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });

  const signUpContinueUrl = buildURL({ base: signUpUrl, hashPath: '/continue' }, { stringify: true });

  return {
    ...ctx,
    transferable: ctx.transferable ?? true,
    componentName,
    signUpUrl,
    signInUrl,
    waitlistUrl,
    afterSignInUrl,
    afterSignUpUrl,
    navigateAfterSignIn,
    signUpContinueUrl,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString: redirectUrls.toSearchParams().toString(),
  };
};

export type SignOutContextType = {
  navigateAfterSignOut: () => any;
  navigateAfterMultiSessionSingleSignOutUrl: () => any;
  afterSignOutUrl: string;
  afterMultiSessionSingleSignOutUrl: string;
};

export const useSignOutContext = (): SignOutContextType => {
  const { navigate } = useRouter();
  const clerk = useClerk();

  const navigateAfterSignOut = () => navigate(clerk.buildAfterSignOutUrl());
  const navigateAfterMultiSessionSingleSignOutUrl = () => navigate(clerk.buildAfterMultiSessionSingleSignOutUrl());

  return {
    navigateAfterSignOut,
    navigateAfterMultiSessionSingleSignOutUrl,
    afterSignOutUrl: clerk.buildAfterSignOutUrl(),
    afterMultiSessionSingleSignOutUrl: clerk.buildAfterMultiSessionSingleSignOutUrl(),
  };
};

type PagesType = {
  routes: NavbarRoute[];
  contents: CustomPageContent[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};

export type UserProfileContextType = UserProfileCtx & {
  queryParams: ParsedQueryString;
  authQueryString: string | null;
  pages: PagesType;
};

export const UserProfileContext = React.createContext<UserProfileCtx | null>(null);

export const useUserProfileContext = (): UserProfileContextType => {
  const context = React.useContext(UserProfileContext);
  const { queryParams } = useRouter();
  const clerk = useClerk();

  if (!context || context.componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  const { componentName, customPages, ...ctx } = context;

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

export type UserVerificationContextType = UserVerificationCtx;

export const UserVerificationContext = React.createContext<UserVerificationCtx | null>(null);

export const useUserVerification = (): UserVerificationContextType => {
  const context = React.useContext(UserVerificationContext);

  if (!context || context.componentName !== 'UserVerification') {
    throw new Error('Clerk: useUserVerificationContext called outside of the mounted UserVerification component.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};

export const UserButtonContext = React.createContext<UserButtonCtx | null>(null);

export const useUserButtonContext = () => {
  const context = React.useContext(UserButtonContext);
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const options = useOptions();

  if (!context || context.componentName !== 'UserButton') {
    throw new Error('Clerk: useUserButtonContext called outside of the mounted UserButton component.');
  }

  const { componentName, customMenuItems, ...ctx } = context;

  const signInUrl = ctx.signInUrl || options.signInUrl || displayConfig.signInUrl;
  const userProfileUrl = ctx.userProfileUrl || displayConfig.userProfileUrl;

  if (ctx.afterSignOutUrl) {
    deprecatedObjectProperty(ctx, 'afterSignOutUrl', `Move 'afterSignOutUrl' to '<ClerkProvider/>`);
  }

  const afterSignOutUrl = ctx.afterSignOutUrl || clerk.buildAfterSignOutUrl();
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);

  if (ctx.afterSignOutUrl) {
    deprecatedObjectProperty(
      ctx,
      'afterMultiSessionSingleSignOutUrl',
      `Move 'afterMultiSessionSingleSignOutUrl' to '<ClerkProvider/>`,
    );
  }
  const afterMultiSessionSingleSignOutUrl =
    ctx.afterMultiSessionSingleSignOutUrl || clerk.buildAfterMultiSessionSingleSignOutUrl();
  const navigateAfterMultiSessionSingleSignOut = () => clerk.redirectWithAuth(afterMultiSessionSingleSignOutUrl);

  const afterSwitchSessionUrl = ctx.afterSwitchSessionUrl || displayConfig.afterSwitchSessionUrl;
  const navigateAfterSwitchSession = () => navigate(afterSwitchSessionUrl);

  const userProfileMode = !!ctx.userProfileUrl && !ctx.userProfileMode ? 'navigation' : ctx.userProfileMode;

  const menuItems = useMemo(() => {
    return createUserButtonCustomMenuItems(customMenuItems || [], clerk);
  }, []);

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
    menutItems: menuItems,
  };
};

export const OrganizationSwitcherContext = React.createContext<OrganizationSwitcherCtx | null>(null);

export const useOrganizationSwitcherContext = () => {
  const context = React.useContext(OrganizationSwitcherContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (!context || context.componentName !== 'OrganizationSwitcher') {
    throw new Error('Clerk: useOrganizationSwitcherContext called outside OrganizationSwitcher.');
  }

  const { componentName, ...ctx } = context;

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
    const redirectUrl = getAfterSelectOrganizationOrPersonalUrl({
      organization,
      user,
    });

    if (redirectUrl) {
      return navigate(redirectUrl);
    }

    return Promise.resolve();
  };

  const getAfterSelectOrganizationOrPersonalUrl = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return ctx.afterSelectPersonalUrl(user);
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return ctx.afterSelectOrganizationUrl(organization);
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return parsedUrl;
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return parsedUrl;
    }

    return;
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });

  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  const afterSelectOrganizationUrl = (organization: OrganizationResource) =>
    getAfterSelectOrganizationOrPersonalUrl({ organization });
  const afterSelectPersonalUrl = (user: UserResource) => getAfterSelectOrganizationOrPersonalUrl({ user });

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
    hideSlug: ctx.hideSlug || false,
    afterCreateOrganizationUrl,
    afterLeaveOrganizationUrl,
    navigateOrganizationProfile,
    navigateCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    afterSelectOrganizationUrl,
    afterSelectPersonalUrl,
    componentName,
  };
};

export const OrganizationListContext = React.createContext<OrganizationListCtx | null>(null);

export const useOrganizationListContext = () => {
  const context = React.useContext(OrganizationListContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (!context || context.componentName !== 'OrganizationList') {
    throw new Error('Clerk: useOrganizationListContext called outside OrganizationList.');
  }

  const { componentName, ...ctx } = context;

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
    hideSlug: ctx.hideSlug || false,
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
};

export const OrganizationProfileContext = React.createContext<OrganizationProfileCtx | null>(null);

export const useOrganizationProfileContext = (): OrganizationProfileContextType => {
  const context = React.useContext(OrganizationProfileContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const clerk = useClerk();

  if (!context || context.componentName !== 'OrganizationProfile') {
    throw new Error('Clerk: useOrganizationProfileContext called outside OrganizationProfile.');
  }

  const { componentName, customPages, ...ctx } = context;

  const pages = useMemo(() => createOrganizationProfileCustomPages(customPages || [], clerk), [customPages]);

  const navigateAfterLeaveOrganization = () =>
    navigate(ctx.afterLeaveOrganizationUrl || displayConfig.afterLeaveOrganizationUrl);

  const isMembersPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS;
  const isGeneralPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL;
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
  };
};

export const CreateOrganizationContext = React.createContext<CreateOrganizationCtx | null>(null);

export const useCreateOrganizationContext = () => {
  const context = React.useContext(CreateOrganizationContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (!context || context.componentName !== 'CreateOrganization') {
    throw new Error('Clerk: useCreateOrganizationContext called outside CreateOrganization.');
  }

  const { componentName, ...ctx } = context;

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
    hideSlug: ctx.hideSlug || false,
    navigateAfterCreateOrganization,
    componentName,
  };
};

export const GoogleOneTapContext = React.createContext<GoogleOneTapCtx | null>(null);

export const useGoogleOneTapContext = () => {
  const context = React.useContext(GoogleOneTapContext);
  const options = useOptions();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();

  if (!context || context.componentName !== 'GoogleOneTap') {
    throw new Error('Clerk: useGoogleOneTapContext called outside GoogleOneTap.');
  }

  const { componentName, ...ctx } = context;

  const generateCallbackUrls = useCallback(
    (returnBackUrl: string): HandleOAuthCallbackParams => {
      const redirectUrls = new RedirectUrls(
        options,
        {
          ...ctx,
          signInFallbackRedirectUrl: returnBackUrl,
          signUpFallbackRedirectUrl: returnBackUrl,
        },
        queryParams,
      );

      let signUpUrl = options.signUpUrl || displayConfig.signUpUrl;
      let signInUrl = options.signInUrl || displayConfig.signInUrl;

      const preservedParams = redirectUrls.getPreservedSearchParams();
      signInUrl = buildURL({ base: signInUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
      signUpUrl = buildURL({ base: signUpUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });

      const signInForceRedirectUrl = redirectUrls.getAfterSignInUrl();
      const signUpForceRedirectUrl = redirectUrls.getAfterSignUpUrl();

      const signUpContinueUrl = buildURL(
        {
          base: signUpUrl,
          hashPath: '/continue',
          hashSearch: new URLSearchParams({
            sign_up_force_redirect_url: signUpForceRedirectUrl,
          }).toString(),
        },
        { stringify: true },
      );

      const firstFactorUrl = buildURL(
        {
          base: signInUrl,
          hashPath: '/factor-one',
          hashSearch: new URLSearchParams({
            sign_in_force_redirect_url: signInForceRedirectUrl,
          }).toString(),
        },
        { stringify: true },
      );
      const secondFactorUrl = buildURL(
        {
          base: signInUrl,
          hashPath: '/factor-two',
          hashSearch: new URLSearchParams({
            sign_in_force_redirect_url: signInForceRedirectUrl,
          }).toString(),
        },
        { stringify: true },
      );

      return {
        signInUrl,
        signUpUrl,
        firstFactorUrl,
        secondFactorUrl,
        continueSignUpUrl: signUpContinueUrl,
        signInForceRedirectUrl,
        signUpForceRedirectUrl,
      };
    },
    [ctx, displayConfig.signInUrl, displayConfig.signUpUrl, options, queryParams],
  );

  return {
    ...ctx,
    componentName,
    generateCallbackUrls,
  };
};

export type WaitlistContextType = WaitlistCtx & {
  signInUrl: string;
  redirectUrl?: string;
};

export const WaitlistContext = React.createContext<WaitlistCtx | null>(null);

export const useWaitlistContext = (): WaitlistContextType => {
  const context = React.useContext(WaitlistContext);
  const { displayConfig } = useEnvironment();
  const options = useOptions();

  if (!context || context.componentName !== 'Waitlist') {
    throw new Error('Clerk: useWaitlistContext called outside Waitlist.');
  }

  const { componentName, ...ctx } = context;

  let signInUrl = ctx.signInUrl || options.signInUrl || displayConfig.signInUrl;
  signInUrl = buildURL({ base: signInUrl }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signInUrl,
  };
};
