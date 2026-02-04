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
    signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
    prefetchUI: restInitState.prefetchUI ?? envVars.prefetchUI,
  };
};
