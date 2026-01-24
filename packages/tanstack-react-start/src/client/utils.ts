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
    __clerkUIUrl,
    __clerkJSVersion,
    __telemetryDisabled,
    __telemetryDebug,
    __signInForceRedirectUrl,
    __signUpForceRedirectUrl,
    __signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl,
    __keylessClaimUrl,
    __keylessApiKeysUrl,
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
    clerkUIUrl: __clerkUIUrl,
    clerkJSVersion: __clerkJSVersion,
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
  return {
    ...restInitState,
    publishableKey: restInitState.publishableKey || getPublicEnvVariables().publishableKey,
    domain: restInitState.domain || getPublicEnvVariables().domain,
    isSatellite: restInitState.isSatellite || getPublicEnvVariables().isSatellite,
    signInUrl: restInitState.signInUrl || getPublicEnvVariables().signInUrl,
    signUpUrl: restInitState.signUpUrl || getPublicEnvVariables().signUpUrl,
    clerkJSUrl: restInitState.clerkJSUrl || getPublicEnvVariables().clerkJsUrl,
    clerkUIUrl: restInitState.clerkUIUrl || getPublicEnvVariables().clerkUIUrl,
    clerkJSVersion: restInitState.clerkJSVersion || getPublicEnvVariables().clerkJsVersion,
    signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
    clerkJSVariant: restInitState.clerkJSVariant || getPublicEnvVariables().clerkJsVariant,
  };
};
