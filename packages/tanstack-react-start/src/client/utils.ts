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
    __clerkUiUrl,
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
    multiDomain: __isSatellite
      ? {
          isSatellite: true,
          ...(__domain ? { domain: __domain } : {}),
        }
      : undefined,
    signInUrl: __signInUrl,
    signUpUrl: __signUpUrl,
    clerkJSUrl: __clerkJSUrl,
    clerkUiUrl: __clerkUiUrl,
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
    multiDomain:
      restInitState.multiDomain ||
      (getPublicEnvVariables().isSatellite
        ? {
            isSatellite: true,
            ...(getPublicEnvVariables().domain ? { domain: getPublicEnvVariables().domain } : {}),
          }
        : undefined),
    signInUrl: restInitState.signInUrl || getPublicEnvVariables().signInUrl,
    signUpUrl: restInitState.signUpUrl || getPublicEnvVariables().signUpUrl,
    clerkJSUrl: restInitState.clerkJSUrl || getPublicEnvVariables().clerkJsUrl,
    clerkUiUrl: restInitState.clerkUiUrl || getPublicEnvVariables().clerkUiUrl,
    clerkJSVersion: restInitState.clerkJSVersion || getPublicEnvVariables().clerkJsVersion,
    signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
    clerkJSVariant: restInitState.clerkJSVariant || getPublicEnvVariables().clerkJsVariant,
  };
};
