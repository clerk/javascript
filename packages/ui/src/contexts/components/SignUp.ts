import { SIGN_UP_INITIAL_VALUE_KEYS } from '@clerk/shared/internal/clerk-js/constants';
import { RedirectUrls } from '@clerk/shared/internal/clerk-js/redirectUrls';
import { getTaskEndpoint } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { DecorateUrl, SessionResource } from '@clerk/shared/types';
import { isAbsoluteUrl } from '@clerk/shared/url';
import { createContext, useContext, useMemo } from 'react';

import { buildRedirectUrl, MAGIC_LINK_VERIFY_PATH_ROUTE, SSO_CALLBACK_PATH_ROUTE } from '../../common/redirects';
import { useEnvironment, useOptions } from '../../contexts';
import type { ParsedQueryString } from '../../router';
import { useRouter } from '../../router';
import type { SignUpCtx } from '../../types';
import { getInitialValuesFromQueryParams } from '../utils';

export type SignUpContextType = Omit<SignUpCtx, 'fallbackRedirectUrl' | 'forceRedirectUrl'> & {
  navigateAfterSignUp: () => any;
  queryParams: ParsedQueryString;
  signInUrl: string;
  signUpUrl: string;
  secondFactorUrl: string;
  authQueryString: string | null;
  afterSignUpUrl: string;
  afterSignInUrl: string;
  waitlistUrl: string;
  isCombinedFlow: boolean;
  emailLinkRedirectUrl: string;
  ssoCallbackUrl: string;
  navigateOnSetActive: (opts: {
    session: SessionResource;
    redirectUrl: string;
    decorateUrl: DecorateUrl;
  }) => Promise<unknown>;
  taskUrl: string | null;
};

export const SignUpContext = createContext<SignUpCtx | null>(null);

export const useSignUpContext = (): SignUpContextType => {
  const context = useContext(SignUpContext);
  const { navigate, basePath, startPath } = useRouter();
  const { displayConfig, userSettings } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const signUpMode = userSettings.signUp.mode;
  const options = useOptions();
  const clerk = useClerk();
  const isCombinedFlow =
    (signUpMode !== 'restricted' &&
      Boolean(
        !options.signUpUrl && options.signInUrl && !isAbsoluteUrl(options.signInUrl) && signUpMode === 'public',
      )) ||
    false;

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_UP_INITIAL_VALUE_KEYS),
    [],
  );

  if (!context || context.componentName !== 'SignUp') {
    throw new Error('Clerk: useSignUpContext called outside of the mounted SignUp component.');
  }

  const { componentName, mode, ...ctx } = context;

  const redirectUrls = new RedirectUrls(
    options,
    {
      ...ctx,
      signUpFallbackRedirectUrl: ctx.signUpFallbackRedirectUrl || ctx.fallbackRedirectUrl,
      signUpForceRedirectUrl: ctx.signUpForceRedirectUrl || ctx.forceRedirectUrl,
    },
    queryParams,
    mode,
  );

  delete ctx.fallbackRedirectUrl;
  delete ctx.forceRedirectUrl;

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

  const authQueryString = redirectUrls.toSearchParams().toString();

  const emailLinkRedirectUrl =
    ctx.emailLinkRedirectUrl ??
    buildRedirectUrl({
      routing: ctx.routing,
      baseUrl: signUpUrl,
      authQueryString,
      path: ctx.path,
      endpoint: isCombinedFlow ? '/create' + MAGIC_LINK_VERIFY_PATH_ROUTE : MAGIC_LINK_VERIFY_PATH_ROUTE,
    });
  const ssoCallbackUrl =
    ctx.ssoCallbackUrl ??
    buildRedirectUrl({
      routing: ctx.routing,
      baseUrl: signUpUrl,
      authQueryString,
      path: ctx.path,
      endpoint: isCombinedFlow ? '/create' + SSO_CALLBACK_PATH_ROUTE : SSO_CALLBACK_PATH_ROUTE,
    });

  // TODO: Avoid building this url again to remove duplicate code. Get it from window.Clerk instead.
  const secondFactorUrl = buildURL({ base: signInUrl, hashPath: '/factor-two' }, { stringify: true });

  const navigateOnSetActive = async ({
    session,
    redirectUrl,
    decorateUrl,
  }: {
    session: SessionResource;
    redirectUrl: string;
    decorateUrl: DecorateUrl;
  }) => {
    const currentTask = session.currentTask;
    if (!currentTask) {
      // Use decorateUrl to enable Safari ITP cookie refresh when needed
      const decoratedUrl = decorateUrl(redirectUrl);

      // If decorateUrl returns an external URL (Safari ITP fix), do a full page navigation
      if (decoratedUrl.startsWith('https://')) {
        window.location.href = decoratedUrl;
        return;
      }

      return navigate(redirectUrl);
    }

    const taskEndpoint = getTaskEndpoint(currentTask);

    // Base path is required for virtual routing with start path
    // eg: to navigate from /sign-in/factor-one to /sign-in/tasks/choose-organization
    return navigate(`/${basePath + startPath + taskEndpoint}`);
  };

  const taskUrl = clerk.session?.currentTask
    ? (clerk.__internal_getOption('taskUrls')?.[clerk.session?.currentTask.key] ??
      buildRedirectUrl({
        routing: ctx.routing,
        baseUrl: signInUrl,
        authQueryString,
        path: ctx.path,
        endpoint: getTaskEndpoint(clerk.session?.currentTask),
      }))
    : null;

  return {
    ...ctx,
    oauthFlow: ctx.oauthFlow || 'auto',
    componentName,
    signInUrl,
    signUpUrl,
    waitlistUrl,
    secondFactorUrl,
    afterSignUpUrl,
    afterSignInUrl,
    emailLinkRedirectUrl,
    ssoCallbackUrl,
    navigateAfterSignUp,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString,
    isCombinedFlow,
    navigateOnSetActive,
    taskUrl,
  };
};
