import type { SignUpResource } from '@clerk/types';
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

export const SignUpRouterRoutes = {
  start: 'route:start',
  continue: 'route:continue',
  verification: 'route:verification',
  callback: 'route:callback',
  error: 'route:error',
} as const;

export type SignUpRouterRoutes = keyof typeof SignUpRouterRoutes;
export type SignUpRouterTags = (typeof SignUpRouterRoutes)[keyof typeof SignUpRouterRoutes];

// ---------------------------------- Children ---------------------------------- //

export const SignUpRouterSystemId = {
  start: 'start',
  continue: 'continue',
  verification: 'verification',
} as const;

export type SignUpRouterSystemId = keyof typeof SignUpRouterSystemId;

// ---------------------------------- Events ---------------------------------- //

export type SignUpRouterNextEvent = BaseRouterNextEvent<SignUpResource>;
export type SignUpRouterPrevEvent = BaseRouterPrevEvent;
export type SignUpRouterErrorEvent = BaseRouterErrorEvent;
export type SignUpRouterTransferEvent = BaseRouterTransferEvent;

export type SignUpRouterRouteRegisterEvent<TLogic extends AnyActorLogic = AnyActorLogic> = BaseRouterRouteRegisterEvent<
  SignUpRouterSystemId,
  TLogic
>;
export type SignUpRouterRouteUnregisterEvent = BaseRouterRouteUnregisterEvent<SignUpRouterSystemId>;
export type SignUpRouterRouteClearEvent = BaseRouterRouteClearEvent;

export type SignUpRouterRouteEvents =
  | SignUpRouterRouteRegisterEvent
  | SignUpRouterRouteUnregisterEvent
  | SignUpRouterRouteClearEvent;

export type SignUpRouterEvents =
  | SignUpRouterNextEvent
  | SignUpRouterPrevEvent
  | SignUpRouterErrorEvent
  | SignUpRouterTransferEvent
  | SignUpRouterRouteEvents;

// ---------------------------------- Delays ---------------------------------- //

export const SignUpRouterDelays = {
  polling: 300_000, // 5 minutes
} as const;

export type SignUpRouterDelays = keyof typeof SignUpRouterDelays;

// ---------------------------------- Input ---------------------------------- //

export interface SignUpRouterInput extends BaseRouterInput {
  signInPath?: string;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignUpRouterContext extends BaseRouterContext {
  signInPath: string;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpRouterSchema {
  context: SignUpRouterContext;
  input: SignUpRouterInput;
  events: SignUpRouterEvents;
  tags: SignUpRouterTags;
  delays: SignUpRouterDelays;
}
