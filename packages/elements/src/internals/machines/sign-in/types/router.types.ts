import type { LoadedClerk, SignInResource } from '@clerk/types';
import type { AnyActorLogic, AnyActorRef, InputFrom } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors/error';
import type { ClerkRouter } from '~/react/router';

// ---------------------------------- Tags ---------------------------------- //

export const SignInRouterRoutes = {
  start: 'route:start',
  firstFactor: 'route:first-factor',
  secondFactor: 'route:second-factor',
  callback: 'route:callback',
  error: 'route:error',
  forgotPassword: 'route:forgot-password',
} as const;

export type SignInRouterRoutes = keyof typeof SignInRouterRoutes;
export type SignInRouterTags = (typeof SignInRouterRoutes)[keyof typeof SignInRouterRoutes];

// ---------------------------------- Children ---------------------------------- //

export const SignInRouterSystemId = {
  start: 'start',
  firstFactor: 'firstFactor',
  secondFactor: 'secondFactor',
} as const;

export type SignInRouterSystemId = keyof typeof SignInRouterSystemId;

// ---------------------------------- Events ---------------------------------- //

export type SignInRouterNextEvent = { type: 'NEXT'; resource?: SignInResource };
export type SignInRouterPrevEvent = { type: 'PREV' };
export type SignInRouterErrorEvent = { type: 'ERROR'; error: Error };
export type SignInRouterTransferEvent = { type: 'TRANSFER' };

export type SignInRouterRouteRegisterEvent<TLogic extends AnyActorLogic = AnyActorLogic> = {
  type: 'ROUTE.REGISTER';
  id: SignInRouterSystemId;
  logic: TLogic;
  input: Omit<InputFrom<TLogic>, 'basePath' | 'clerk' | 'form' | 'router'>;
  // options?: ActorOptions<TLogic>;
};
export type SignInRouterRouteUnregisterEvent = { type: 'ROUTE.UNREGISTER'; id: SignInRouterSystemId };
export type SignInRouterRouteClearEvent = { type: 'ROUTE.CLEAR'; id: SignInRouterSystemId };

export type SignInRouterRouteEvent =
  | SignInRouterRouteRegisterEvent
  | SignInRouterRouteUnregisterEvent
  | SignInRouterRouteClearEvent;

export type SignInRouterEvents =
  | SignInRouterNextEvent
  | SignInRouterPrevEvent
  | SignInRouterErrorEvent
  | SignInRouterTransferEvent
  | SignInRouterRouteEvent;

// ---------------------------------- Input ---------------------------------- //

export interface SignInRouterInput {
  clerk: LoadedClerk;
  router?: ClerkRouter;
  signUpPath?: string;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInRouterContext {
  clerk: LoadedClerk;
  error?: ClerkElementsError;
  routes: Map<SignInRouterSystemId, AnyActorRef>;
  router?: ClerkRouter;
  signUpPath: string;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInRouterSchema {
  context: SignInRouterContext;
  input: SignInRouterInput;
  events: SignInRouterEvents;
  tags: SignInRouterTags;
}
