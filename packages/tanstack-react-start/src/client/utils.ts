import { getPublicEnvVariables } from '../utils/env';
import type { TanstackStartClerkProviderProps } from './types';

type TanStackProviderAndInitialProps = Omit<TanstackStartClerkProviderProps, 'children'>;

export const pickFromClerkInitState = (
  clerkInitState: any,
): TanStackProviderAndInitialProps & {
  clerkSsrState: any;
  __keylessClaimUrl?: string;
  __keylessApiKeysUrl?: string;
} => {
  const {
    __clerk_ssr_state,
    __publishableKey,
    __proxyUrl,
    __domain,
    __isSatellite,
    __signInUrl,
    __signUpUrl,
    __clerkJSUrl,
    __clerkJSVersion,
    __clerkUIUrl,
    __clerkUIVersion,
    __telemetryDisabled,
    __telemetryDebug,
    __signInForceRedirectUrl,
    __signUpForceRedirectUrl,
    __signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl,
    __keylessClaimUrl,
    __keylessApiKeysUrl,
    __prefetchUI,
  } = clerkInitState || {};

  return {
    clerkSsrState: __clerk_ssr_state,
    publishableKey: __publishableKey,
    proxyUrl: __proxyUrl,
    domain: __domain,
    isSatellite: !!__isSatellite,
    signInUrl: __signInUrl,
    signUpUrl: __signUpUrl,
    clerkJSUrl: __clerkJSUrl,
    clerkJSVersion: __clerkJSVersion,
    clerkUIUrl: __clerkUIUrl,
    clerkUIVersion: __clerkUIVersion,
    prefetchUI: __prefetchUI,
    telemetry: {
      disabled: __telemetryDisabled,
      debug: __telemetryDebug,
    },
    signInForceRedirectUrl: __signInForceRedirectUrl,
    signUpForceRedirectUrl: __signUpForceRedirectUrl,
    signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
    signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
    __keylessClaimUrl,
    __keylessApiKeysUrl,
  };
};

export const mergeWithPublicEnvs = (restInitState: any) => {
  const envVars = getPublicEnvVariables();
  return {
    ...restInitState,
    publishableKey: restInitState.publishableKey || envVars.publishableKey,
    domain: restInitState.domain || envVars.domain,
    isSatellite: restInitState.isSatellite || envVars.isSatellite,
    signInUrl: restInitState.signInUrl || envVars.signInUrl,
    signUpUrl: restInitState.signUpUrl || envVars.signUpUrl,
    clerkJSUrl: restInitState.clerkJSUrl || envVars.clerkJsUrl,
    clerkJSVersion: restInitState.clerkJSVersion || envVars.clerkJsVersion,
    clerkUIUrl: restInitState.clerkUIUrl || envVars.clerkUIUrl,
    clerkUIVersion: restInitState.clerkUIVersion || envVars.clerkUIVersion,
    signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
    prefetchUI: restInitState.prefetchUI ?? envVars.prefetchUI,
  };
};

export type ParsedNavigationUrl = {
  to: string;
  search?: Record<string, string>;
  hash?: string;
};

/**
 * Parses a URL string into TanStack Router navigation options.
 * TanStack Router doesn't parse query strings from the `to` parameter,
 * so we need to extract pathname, search params, and hash separately.
 */
export function parseUrlForNavigation(to: string, baseUrl: string): ParsedNavigationUrl {
  const url = new URL(to, baseUrl);
  const searchParams = Object.fromEntries(url.searchParams);
  return {
    to: url.pathname,
    search: Object.keys(searchParams).length > 0 ? searchParams : undefined,
    hash: url.hash ? url.hash.slice(1) : undefined,
  };
}
