import { InitialState } from '@clerk/types';

export type ClerkState = {
  __type: 'clerkState';
  __internal_clerk_state: {
    __clerk_ssr_interstitial: string;
    __clerk_ssr_state: InitialState;
  };
};
