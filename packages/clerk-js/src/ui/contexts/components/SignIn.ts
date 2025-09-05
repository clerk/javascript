import { useClerk } from '@clerk/shared/react';
import { isAbsoluteUrl } from '@clerk/shared/url';
import type { SessionResource } from '@clerk/types';
import { createContext, useContext, useMemo } from 'react';

import { getTaskEndpoint } from '@/core/sessionTasks';

import { SIGN_IN_INITIAL_VALUE_KEYS } from '../../../core/constants';
import { buildURL } from '../../../utils';
import { RedirectUrls } from '../../../utils/redirectUrls';
import { buildRedirectUrl, MAGIC_LINK_VERIFY_PATH_ROUTE, SSO_CALLBACK_PATH_ROUTE } from '../../common/redirects';
import { useEnvironment, useOptions } from '../../contexts';
import type { ParsedQueryString } from '../../router';
import { useRouter } from '../../router';
import type { SignInCtx } from '../../types';
import { getInitialValuesFromQueryParams } from '../utils';

export type SignInContextType = Omit<SignInCtx, 'fallbackRedirectUrl' | 'forceRedirectUrl'> & {
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
  navigateOnSetActive: (opts: { session: SessionResource; redirectUrl: string }) => Promise<unknown>;
  taskUrl: string | null;
};

export const SignInContext = createContext<SignInCtx | null>(null);

export const useSignInContext = (): SignInContextType => {
  const context = useContext(SignInContext);
  const { navigate, basePath } = useRouter();
  const { displayConfig, userSettings } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const signUpMode = userSettings.signUp.mode;
  const options = useOptions();
  const clerk = useClerk();

  if (context === null || context.componentName !== 'SignIn') {
    throw new Error(`Clerk: useSignInContext called outside of the mounted SignIn component.`);
  }

  const isCombinedFlow =
    (signUpMode !== 'restricted' &&
      Boolean(!options.signUpUrl && options.signInUrl && !isAbsoluteUrl(options.signInUrl)) &&
      context.withSignUp !== false) ||
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
      signInFallbackRedirectUrl: ctx.signInFallbackRedirectUrl || ctx.fallbackRedirectUrl,
      signInForceRedirectUrl: ctx.signInForceRedirectUrl || ctx.forceRedirectUrl,
    },
    queryParams,
    mode,
  );

  delete ctx.fallbackRedirectUrl;
  delete ctx.forceRedirectUrl;

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

  const navigateOnSetActive = async ({ session, redirectUrl }: { session: SessionResource; redirectUrl: string }) => {
    const currentTask = session.currentTask;
    if (!currentTask) {
      return navigate(redirectUrl);
    }

    const taskEndpoint = getTaskEndpoint(currentTask);
    const taskNavigationPath = isCombinedFlow ? '/create' + taskEndpoint : taskEndpoint;

    return navigate(`/${basePath + taskNavigationPath}`);
  };

  const taskUrl = clerk.session?.currentTask
    ? (clerk.__internal_getOption('taskUrls')?.[clerk.session?.currentTask.key] ??
      buildRedirectUrl({
        routing: ctx.routing,
        baseUrl: signInUrl,
        authQueryString,
        path: ctx.path,
        endpoint: isCombinedFlow
          ? '/create' + getTaskEndpoint(clerk.session?.currentTask)
          : getTaskEndpoint(clerk.session?.currentTask),
      }))
    : null;

  return {
    ...ctx,
    transferable: ctx.transferable ?? true,
    oauthFlow: ctx.oauthFlow || 'auto',
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
    navigateOnSetActive,
    taskUrl,
  };
};
