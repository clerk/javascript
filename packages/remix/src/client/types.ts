import type { InitialState } from '@clerk/types';

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
    __clerk_debug: any;
  };
};

export type WithClerkState<U = any> = {
  data: U;
  clerkState: { __type: 'clerkState' };
};
