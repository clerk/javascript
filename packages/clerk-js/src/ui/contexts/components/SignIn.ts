import { useClerk } from '@clerk/shared/react';
import { isAbsoluteUrl } from '@clerk/shared/url';
import { createContext, useContext, useMemo } from 'react';

import { SIGN_IN_INITIAL_VALUE_KEYS } from '../../../core/constants';
import { buildURL } from '../../../utils';
import { RedirectUrls } from '../../../utils/redirectUrls';
import { buildRedirectUrl, MAGIC_LINK_VERIFY_PATH_ROUTE, SSO_CALLBACK_PATH_ROUTE } from '../../common/redirects';
import { useEnvironment, useOptions } from '../../contexts';
import type { ParsedQueryString } from '../../router';
import { useRouter } from '../../router';
import type { SignInCtx } from '../../types';
import { getInitialValuesFromQueryParams } from '../utils';

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
  emailLinkRedirectUrl: string;
  ssoCallbackUrl: string;
  isCombinedFlow: boolean;
};

export const SignInContext = createContext<SignInCtx | null>(null);

export const useSignInContext = (): SignInContextType => {
  const context = useContext(SignInContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useClerk();

  if (context === null || context.componentName !== 'SignIn') {
    throw new Error(`Clerk: useSignInContext called outside of the mounted SignIn component.`);
  }

  const isCombinedFlow =
    Boolean(!options.signUpUrl && options.signInUrl && !isAbsoluteUrl(options.signInUrl)) ||
    context.withSignUp ||
    false;

  const { componentName, mode, ...ctx } = context;
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
    mode,
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(redirectUrls.getAfterSignInUrl());
  const afterSignUpUrl = clerk.buildUrlWithAuth(redirectUrls.getAfterSignUpUrl());

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  // The `ctx` object here refers to the SignIn component's props.
  // SignIn's own options won't have a `signInUrl` property, so we have to get the value
  // from the `path` prop instead, when the routing is set to 'path'.
  let signInUrl = (ctx.routing === 'path' && ctx.path) || options.signInUrl || displayConfig.signInUrl;
  let signUpUrl = isCombinedFlow
    ? (ctx.routing === 'path' && ctx.path) || options.signUpUrl || displayConfig.signUpUrl
    : ctx.signUpUrl || options.signUpUrl || displayConfig.signUpUrl;
  let waitlistUrl = ctx.waitlistUrl || options.waitlistUrl || displayConfig.waitlistUrl;

  const preservedParams = redirectUrls.getPreservedSearchParams();
  signInUrl = buildURL({ base: signInUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
  signUpUrl = buildURL({ base: signUpUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
  waitlistUrl = buildURL({ base: waitlistUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });

  const authQueryString = redirectUrls.toSearchParams().toString();

  const emailLinkRedirectUrl = buildRedirectUrl({
    routing: ctx.routing,
    baseUrl: signUpUrl,
    authQueryString,
    path: ctx.path,
    endpoint: isCombinedFlow ? '/create' + MAGIC_LINK_VERIFY_PATH_ROUTE : MAGIC_LINK_VERIFY_PATH_ROUTE,
  });
  const ssoCallbackUrl = buildRedirectUrl({
    routing: ctx.routing,
    baseUrl: signUpUrl,
    authQueryString,
    path: ctx.path,
    endpoint: isCombinedFlow ? '/create' + SSO_CALLBACK_PATH_ROUTE : SSO_CALLBACK_PATH_ROUTE,
  });

  if (isCombinedFlow) {
    signUpUrl = buildURL(
      { base: signInUrl, hashPath: '/create', hashSearchParams: [queryParams, preservedParams] },
      { stringify: true },
    );
  }

  const signUpContinueUrl = buildURL({ base: signUpUrl, hashPath: '/continue' }, { stringify: true });

  return {
    ...(ctx as SignInCtx),
    transferable: ctx.transferable ?? true,
    componentName,
    signUpUrl,
    signInUrl,
    waitlistUrl,
    afterSignInUrl,
    afterSignUpUrl,
    emailLinkRedirectUrl,
    ssoCallbackUrl,
    navigateAfterSignIn,
    signUpContinueUrl,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString,
    isCombinedFlow,
  };
};
