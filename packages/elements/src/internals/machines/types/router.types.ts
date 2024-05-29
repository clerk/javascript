import type {
  ClerkResource,
  LoadedClerk,
  OAuthStrategy,
  SamlStrategy,
  SignInStrategy,
  Web3Strategy,
} from '@clerk/types';

import type { ClerkElementsError } from '~/internals/errors';
import type { ClerkRouter } from '~/react/router';

// ---------------------------------- Events ---------------------------------- //

export type BaseRouterLoadingStep = 'start' | 'verifications' | 'continue' | 'reset-password';

export type BaseRouterNextEvent<T extends ClerkResource> = { type: 'NEXT'; resource?: T };
export type BaseRouterPrevEvent = { type: 'NAVIGATE.PREVIOUS' };
export type BaseRouterStartEvent = { type: 'NAVIGATE.START' };
export type BaseRouterResetEvent = { type: 'RESET' };
export type BaseRouterErrorEvent = { type: 'ERROR'; error: Error };
export type BaseRouterTransferEvent = { type: 'TRANSFER' };
export type BaseRouterLoadingEvent<TSteps extends BaseRouterLoadingStep> = (
  | {
      step: TSteps | undefined;
      strategy?: never;
    }
  | {
      step?: never;
      strategy: SignInStrategy | undefined;
    }
) & { type: 'LOADING'; isLoading: boolean };

export type BaseRouterRedirectOauthEvent = { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy };
export type BaseRouterRedirectSamlEvent = { type: 'AUTHENTICATE.SAML'; strategy?: SamlStrategy };
export type BaseRouterRedirectWeb3Event = { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy };
export type BaseRouterSetClerkEvent = { type: 'CLERK.SET'; clerk: LoadedClerk };

export type BaseRouterRedirectEvent =
  | BaseRouterRedirectOauthEvent
  | BaseRouterRedirectSamlEvent
  | BaseRouterRedirectWeb3Event;

// ---------------------------------- Input ---------------------------------- //

export interface BaseRouterInput {
  clerk: LoadedClerk;
  redirectUrl?: string;
  router?: ClerkRouter;
  exampleMode?: boolean;
}

// ---------------------------------- Context ---------------------------------- //

export interface BaseRouterContext {
  clerk: LoadedClerk;
  error?: ClerkElementsError;
  redirectUrl?: string;
  router?: ClerkRouter;
  exampleMode?: boolean;
}
