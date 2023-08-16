import type { IsomorphicClerkOptions } from '@clerk/clerk-react';
import type { InitialState, MultiDomainAndOrProxy, PublishableKeyOrFrontendApi } from '@clerk/types';

export type ClerkState = {
  __type: 'clerkState';
  __internal_clerk_state: {
    __clerk_ssr_interstitial: string;
    __clerk_ssr_state: InitialState;
    __frontendApi: string | undefined;
    __publishableKey: string | undefined;
    __proxyUrl: string | undefined;
    __domain: string | undefined;
    __isSatellite: boolean;
    __signInUrl: string | undefined;
    __signUpUrl: string | undefined;
    __afterSignInUrl: string | undefined;
    __afterSignUpUrl: string | undefined;
    __clerk_debug: any;
    __clerkJSUrl: string | undefined;
    __clerkJSVersion: string | undefined;
  };
};

export type WithClerkState<U = any> = {
  data: U;
  clerkState: { __type: 'clerkState' };
};

export type RemixClerkProviderProps = {
  children: React.ReactNode;
  /**
   * If set to true, the NextJS middleware will be invoked
   * every time the client-side auth state changes (sign-out, sign-in, organization switch etc.).
   * That way, any auth-dependent logic can be placed inside the middleware.
   * Example: Configuring the middleware to force a redirect to `/sign-in` when the user signs out
   *
   * @default true
   */
  __unstable_invokeMiddlewareOnAuthStateChange?: boolean;
} & Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> &
  Partial<PublishableKeyOrFrontendApi> &
  Omit<IsomorphicClerkOptions, keyof MultiDomainAndOrProxy> &
  MultiDomainAndOrProxy;
