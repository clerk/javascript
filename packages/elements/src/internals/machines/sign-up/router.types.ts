import type { SignUpResource } from '@clerk/types';
import type { ActorRefFrom, AnyActorLogic } from 'xstate';

import type { TFormMachine } from '~/internals/machines/form';
import type {
  BaseRouterContext,
  BaseRouterErrorEvent,
  BaseRouterInput,
  BaseRouterLoadingEvent,
  BaseRouterNextEvent,
  BaseRouterPrevEvent,
  BaseRouterRedirectEvent,
  BaseRouterRouteRegisterEvent,
  BaseRouterRouteUnregisterEvent,
  BaseRouterSetClerkEvent,
  BaseRouterStartEvent,
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
export type SignUpRouterStartEvent = BaseRouterStartEvent;
export type SignUpRouterPrevEvent = BaseRouterPrevEvent;
export type SignUpRouterErrorEvent = BaseRouterErrorEvent;
export type SignUpRouterTransferEvent = BaseRouterTransferEvent;
export type SignUpRouterRedirectEvent = BaseRouterRedirectEvent;
export type SignUpRouterLoadingEvent = BaseRouterLoadingEvent<'start' | 'verifications' | 'continue'>;
export type SignUpRouterSetClerkEvent = BaseRouterSetClerkEvent;

export interface SignUpRouterInitEvent extends BaseRouterInput {
  type: 'INIT';
  formRef: ActorRefFrom<TFormMachine>;
  signInPath?: string;
}

export type SignUpRouterRouteRegisterEvent<TLogic extends AnyActorLogic = AnyActorLogic> = BaseRouterRouteRegisterEvent<
  SignUpRouterSystemId,
  TLogic
>;
export type SignUpRouterRouteUnregisterEvent = BaseRouterRouteUnregisterEvent<SignUpRouterSystemId>;

export type SignUpRouterRouteEvents = SignUpRouterRouteRegisterEvent | SignUpRouterRouteUnregisterEvent;

export type SignUpRouterNavigationEvents = SignUpRouterStartEvent | SignUpRouterPrevEvent;

export type SignUpRouterEvents =
  | SignUpRouterInitEvent
  | SignUpRouterNextEvent
  | SignUpRouterNavigationEvents
  | SignUpRouterErrorEvent
  | SignUpRouterTransferEvent
  | SignUpRouterRedirectEvent
  | SignUpRouterRouteEvents
  | SignUpRouterLoadingEvent
  | SignUpRouterSetClerkEvent;

// ---------------------------------- Delays ---------------------------------- //

export const SignUpRouterDelays = {
  polling: 300_000, // 5 minutes
} as const;

export type SignUpRouterDelays = keyof typeof SignUpRouterDelays;

// ---------------------------------- Context ---------------------------------- //

export type SignUpRouterLoadingContext = Omit<SignUpRouterLoadingEvent, 'type'>;

export interface SignUpRouterContext extends BaseRouterContext {
  formRef: ActorRefFrom<TFormMachine>;
  loading: SignUpRouterLoadingContext;
  signInPath: string;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpRouterSchema {
  context: SignUpRouterContext;
  events: SignUpRouterEvents;
  tags: SignUpRouterTags;
  delays: SignUpRouterDelays;
}
