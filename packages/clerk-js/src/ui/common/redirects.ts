import type { SessionTask } from '@clerk/types';

import { SESSION_TASK_ROUTE_BY_KEY } from '../../core/sessionTasks';
import { buildURL } from '../../utils/url';
import type { SignInContextType, SignUpContextType, UserProfileContextType } from './../contexts';

export const SSO_CALLBACK_PATH_ROUTE = '/sso-callback';
export const MAGIC_LINK_VERIFY_PATH_ROUTE = '/verify';

export function buildVerificationRedirectUrl({
  ctx,
  baseUrl = '',
  intent = 'sign-in',
}: {
  ctx: SignInContextType | SignUpContextType | UserProfileContextType;
  baseUrl?: string;
  intent?: 'sign-in' | 'sign-up' | 'profile';
}): string {
  const { routing, authQueryString, path } = ctx;
  const isCombinedFlow = 'isCombinedFlow' in ctx && ctx.isCombinedFlow;
  return buildRedirectUrl({
    routing,
    baseUrl,
    authQueryString,
    path,
    endpoint:
      isCombinedFlow && intent === 'sign-up' ? `/create${MAGIC_LINK_VERIFY_PATH_ROUTE}` : MAGIC_LINK_VERIFY_PATH_ROUTE,
  });
}

export function buildSessionTaskRedirectUrl({
  routing,
  path,
  baseUrl,
  task,
}: Pick<SignInContextType | SignUpContextType, 'routing' | 'path'> & {
  baseUrl: string;
  task?: SessionTask;
}) {
  if (!task) {
    return null;
  }

  return buildRedirectUrl({
    routing,
    baseUrl,
    path,
    endpoint: `/tasks/${SESSION_TASK_ROUTE_BY_KEY[task.key]}`,
    authQueryString: null,
  });
}

export function buildSSOCallbackURL(
  ctx: Partial<SignInContextType | SignUpContextType>,
  baseUrl: string | undefined = '',
): string {
  // If the context contains an SSO callback URL, use it instead of building a new one, as it likely contains the
  // combined flow path.
  if ('ssoCallbackUrl' in ctx && ctx.ssoCallbackUrl) {
    return ctx.ssoCallbackUrl;
  }
  const { routing, authQueryString, path } = ctx;
  return buildRedirectUrl({
    routing,
    baseUrl,
    authQueryString,
    path,
    endpoint: SSO_CALLBACK_PATH_ROUTE,
  });
}

type AuthQueryString = string | null | undefined;

type BuildRedirectUrlParams = {
  routing: string | undefined;
  authQueryString: AuthQueryString;
  baseUrl: string;
  path: string | undefined;
  endpoint: string;
};

export const buildRedirectUrl = ({
  routing,
  authQueryString,
  baseUrl,
  path,
  endpoint,
}: BuildRedirectUrlParams): string => {
  // If a routing strategy is not provided, default to hash routing
  // All routing strategies know how to convert a hash-based url to their own format
  // Example: navigating from a hash-based to a path-based component,
  // the path-based component can parse and fix the URL automatically
  // /#/sso-callback?code=123 -> /sso-callback?code=123
  if (!routing || routing === 'hash') {
    return buildHashBasedUrl(authQueryString, endpoint);
  }

  if (routing === 'path') {
    return buildPathBasedUrl(path || '', authQueryString, endpoint);
  }

  return buildVirtualBasedUrl(baseUrl || '', authQueryString, endpoint);
};

const buildHashBasedUrl = (authQueryString: AuthQueryString, endpoint: string): string => {
  // Strip hash to get the URL where we're mounted
  const hash = endpoint + (authQueryString ? `?${authQueryString}` : '');
  return buildURL({ hash }, { stringify: true });
};

const buildPathBasedUrl = (path: string, authQueryString: AuthQueryString, endpoint: string): string => {
  const searchArg = authQueryString ? { search: '?' + authQueryString } : {};
  return buildURL(
    {
      pathname: path + endpoint,
      ...searchArg,
    },
    { stringify: true },
  );
};

const buildVirtualBasedUrl = (base: string, authQueryString: AuthQueryString, endpoint: string): string => {
  const hash = endpoint + (authQueryString ? `?${authQueryString}` : '');
  return buildURL({ base, hash }, { stringify: true });
};
