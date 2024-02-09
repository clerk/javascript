// ---------------------------------- Events ---------------------------------- //

import type { ClerkResource, LoadedClerk } from '@clerk/types';
import type { AnyActorLogic, InputFrom } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors/error';
import type { ClerkRouter } from '~/react/router';

// ---------------------------------- Events ---------------------------------- //

export type BaseRouterNextEvent<T extends ClerkResource> = { type: 'NEXT'; resource?: T };
export type BaseRouterPrevEvent = { type: 'PREV' };
export type BaseRouterErrorEvent = { type: 'ERROR'; error: Error };
export type BaseRouterTransferEvent = { type: 'TRANSFER' };

export type BaseRouterRouteRegisterEvent<TSystemId extends string, TLogic extends AnyActorLogic = AnyActorLogic> = {
  type: 'ROUTE.REGISTER';
  id: TSystemId;
  logic: TLogic;
  input: Omit<InputFrom<TLogic>, 'basePath' | 'clerk' | 'form' | 'router'>;
};

export type BaseRouterRouteUnregisterEvent<T extends string> = { type: 'ROUTE.UNREGISTER'; id: T };

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
