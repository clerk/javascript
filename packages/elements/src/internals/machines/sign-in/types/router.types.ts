import type { LoadedClerk } from '@clerk/types';

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

export type SignInRouterNextEvent = { type: 'NEXT' };
export type SignInRouterPrevEvent = { type: 'PREV' };
export type SignInRouterErrorEvent = { type: 'ERROR'; error: Error };
export type SignInRouterTransferEvent = { type: 'TRANSFER' };

export type SignInRouterEvents =
  | SignInRouterNextEvent
  | SignInRouterPrevEvent
  | SignInRouterErrorEvent
  | SignInRouterTransferEvent;

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
