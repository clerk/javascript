import type { SignInContextType, SignUpContextType, UserProfileContextType } from 'ui/contexts';

import { buildURL } from '../../utils/url';

const SSO_CALLBACK_PATH_ROUTE = '/sso-callback';
const MAGIC_LINK_VERIFY_PATH_ROUTE = '/verify';

export function buildMagicLinkRedirectUrl(
  ctx: SignInContextType | SignUpContextType | UserProfileContextType,
  baseUrl: string | undefined = '',
): string {
  const { routing, authQueryString, path } = ctx;
  return buildRedirectUrl({
    routing,
    baseUrl,
    authQueryString,
    path,
    endpoint: MAGIC_LINK_VERIFY_PATH_ROUTE,
    forcePathBased: true,
  });
}

export function buildSSOCallbackURL(
  ctx: Partial<SignInContextType | SignUpContextType>,
  baseUrl: string | undefined = '',
): string {
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
  forcePathBased?: boolean;
};

const buildRedirectUrl = ({
  routing,
  authQueryString,
  baseUrl,
  path,
  endpoint,
  forcePathBased,
}: BuildRedirectUrlParams): string => {
  if (!routing || routing === 'hash') {
    return buildHashBasedUrl(authQueryString, endpoint);
  }

  if (routing === 'path') {
    return buildPathBasedUrl(path || '', authQueryString, endpoint);
  }

  return buildVirtualBasedUrl(baseUrl || '', authQueryString, endpoint, forcePathBased);
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

const buildVirtualBasedUrl = (
  base: string,
  authQueryString: AuthQueryString,
  endpoint: string,
  forcePathBased?: boolean,
): string => {
  forcePathBased;
  if (forcePathBased) {
    const searchArg = authQueryString ? { search: `?${authQueryString}` } : {};
    return buildURL({ base: base + endpoint, ...searchArg }, { stringify: true });
  } else {
    const hash = endpoint + (authQueryString ? `?${authQueryString}` : '');
    return buildURL({ base, hash }, { stringify: true });
  }
};
