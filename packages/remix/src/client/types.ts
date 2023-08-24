import type { IsomorphicClerkOptions } from '@clerk/clerk-react';
import type { InitialState, MultiDomainAndOrProxy, PublishableKeyOrFrontendApi } from '@clerk/types';
import type { PropsWithChildren } from 'react';

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

export type RemixClerkProviderProps = PropsWithChildren<
  Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> &
    Partial<PublishableKeyOrFrontendApi> &
    Omit<IsomorphicClerkOptions, keyof MultiDomainAndOrProxy> &
    MultiDomainAndOrProxy
>;
