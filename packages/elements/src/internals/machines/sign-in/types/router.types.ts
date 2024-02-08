import type { SignInResource } from '@clerk/types';
import type { AnyActorLogic } from 'xstate';

import type {
  BaseRouterContext,
  BaseRouterErrorEvent,
  BaseRouterInput,
  BaseRouterNextEvent,
  BaseRouterPrevEvent,
  BaseRouterRouteClearEvent,
  BaseRouterRouteRegisterEvent,
  BaseRouterRouteUnregisterEvent,
  BaseRouterTransferEvent,
} from '~/internals/machines/types';

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

export type SignInRouterNextEvent = BaseRouterNextEvent<SignInResource>;
export type SignInRouterPrevEvent = BaseRouterPrevEvent;
export type SignInRouterErrorEvent = BaseRouterErrorEvent;
export type SignInRouterTransferEvent = BaseRouterTransferEvent;

export type SignInRouterRouteRegisterEvent<TLogic extends AnyActorLogic = AnyActorLogic> = BaseRouterRouteRegisterEvent<
  SignInRouterSystemId,
  TLogic
>;
export type SignInRouterRouteUnregisterEvent = BaseRouterRouteUnregisterEvent<SignInRouterSystemId>;
export type SignInRouterRouteClearEvent = BaseRouterRouteClearEvent;

export type SignInRouterRouteEvents =
  | SignInRouterRouteRegisterEvent
  | SignInRouterRouteUnregisterEvent
  | SignInRouterRouteClearEvent;

export type SignInRouterEvents =
  | SignInRouterNextEvent
  | SignInRouterPrevEvent
  | SignInRouterErrorEvent
  | SignInRouterTransferEvent
  | SignInRouterRouteEvents;

// ---------------------------------- Input ---------------------------------- //
export interface SignInRouterInput extends BaseRouterInput {
  signUpPath?: string;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInRouterContext extends BaseRouterContext {
  signUpPath: string;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInRouterSchema {
  context: SignInRouterContext;
  input: SignInRouterInput;
  events: SignInRouterEvents;
  tags: SignInRouterTags;
}
