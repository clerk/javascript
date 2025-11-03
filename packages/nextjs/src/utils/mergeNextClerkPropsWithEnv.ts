import { isTruthy } from '@clerk/shared/underscore';

import { SDK_METADATA } from '../server/constants';
import type { NextClerkProviderProps } from '../types';

// @ts-ignore - https://github.com/microsoft/TypeScript/issues/47663
export const mergeNextClerkPropsWithEnv = (props: Omit<NextClerkProviderProps, 'children'>): any => {
  return {
    ...props,
    publishableKey: props.publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    clerkJSUrl: props.clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS_URL,
    clerkUiUrl: (props as any).clerkUiUrl || process.env.NEXT_PUBLIC_CLERK_UI_URL,
    clerkJSVersion: props.clerkJSVersion || process.env.NEXT_PUBLIC_CLERK_JS_VERSION,
    proxyUrl: props.proxyUrl || process.env.NEXT_PUBLIC_CLERK_PROXY_URL || '',
    domain: props.domain || process.env.NEXT_PUBLIC_CLERK_DOMAIN || '',
    isSatellite: props.isSatellite || isTruthy(process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE),
    signInUrl: props.signInUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '',
    signUpUrl: props.signUpUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '',
    signInForceRedirectUrl:
      props.signInForceRedirectUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || '',
    signUpForceRedirectUrl:
      props.signUpForceRedirectUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '',
    signInFallbackRedirectUrl:
      props.signInFallbackRedirectUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '',
    signUpFallbackRedirectUrl:
      props.signUpFallbackRedirectUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '',
    afterSignInUrl: props.afterSignInUrl || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '',
    afterSignUpUrl: props.afterSignUpUrl || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '',
    newSubscriptionRedirectUrl:
      props.newSubscriptionRedirectUrl || process.env.NEXT_PUBLIC_CLERK_CHECKOUT_CONTINUE_URL || '',
    telemetry: props.telemetry ?? {
      disabled: isTruthy(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED),
      debug: isTruthy(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG),
    },
    sdkMetadata: SDK_METADATA,
  };
};
