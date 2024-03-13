// ---------------------------------- Events ---------------------------------- //

import type {
  ClerkResource,
  LoadedClerk,
  OAuthStrategy,
  SamlStrategy,
  SignInStrategy,
  Web3Strategy,
} from '@clerk/types';
import type { AnyActorLogic, InputFrom } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors';
import type { ClerkRouter } from '~/react/router';

// ---------------------------------- Events ---------------------------------- //

export type BaseRouterNextEvent<T extends ClerkResource> = { type: 'NEXT'; resource?: T };
export type BaseRouterPrevEvent = { type: 'NAVIGATE.PREVIOUS' };
export type BaseRouterStartEvent = { type: 'NAVIGATE.START' };
export type BaseRouterErrorEvent = { type: 'ERROR'; error: Error };
export type BaseRouterTransferEvent = { type: 'TRANSFER' };
export type BaseRouterLoadingEvent = {
  type: 'LOADING';
  value: boolean;
  step?: 'start' | 'verifications';
  strategy?: SignInStrategy;
};

export type BaseRouterRouteRegisterEvent<TSystemId extends string, TLogic extends AnyActorLogic = AnyActorLogic> = {
  type: 'ROUTE.REGISTER';
  id: TSystemId;
  logic: TLogic;
  input: Omit<InputFrom<TLogic>, 'basePath' | 'clerk' | 'form' | 'router'>;
};

export type BaseRouterRouteUnregisterEvent<T extends string> = { type: 'ROUTE.UNREGISTER'; id: T };

export type BaseRouterRedirectOauthEvent = { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy };
export type BaseRouterRedirectSamlEvent = { type: 'AUTHENTICATE.SAML'; strategy?: SamlStrategy };
export type BaseRouterRedirectWeb3Event = { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy };

export type BaseRouterRedirectEvent =
  | BaseRouterRedirectOauthEvent
  | BaseRouterRedirectSamlEvent
  | BaseRouterRedirectWeb3Event;

// ---------------------------------- Input ---------------------------------- //

export interface BaseRouterInput {
  clerk: LoadedClerk;
  router?: ClerkRouter;
}

// ---------------------------------- Context ---------------------------------- //

export interface BaseRouterContext {
  clerk: LoadedClerk;
  error?: ClerkElementsError;
  router?: ClerkRouter;
}
