import type { SignInResource } from '@clerk/types';
import type { AnyActorLogic, MachineSnapshot } from 'xstate';

import type { SignInVerificationFactorUpdateEvent } from '~/internals/machines/sign-in/types';
import type {
  BaseRouterContext,
  BaseRouterErrorEvent,
  BaseRouterInput,
  BaseRouterNextEvent,
  BaseRouterPrevEvent,
  BaseRouterRedirectEvent,
  BaseRouterRouteRegisterEvent,
  BaseRouterRouteUnregisterEvent,
  BaseRouterStartEvent,
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
  chooseStrategy: 'route:choose-strategy',
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
export type SignInRouterStartEvent = BaseRouterStartEvent;
export type SignInRouterPrevEvent = BaseRouterPrevEvent;
export type SignInRouterChooseStrategyEvent = { type: 'NAVIGATE.CHOOSE_STRATEGY' };
export type SignInRouterForgotPasswordEvent = { type: 'NAVIGATE.FORGOT_PASSWORD' };
export type SignInRouterErrorEvent = BaseRouterErrorEvent;
export type SignInRouterTransferEvent = BaseRouterTransferEvent;
export type SignInRouterRedirectEvent = BaseRouterRedirectEvent;

export interface SignInRouterInitEvent extends BaseRouterInput {
  type: 'INIT';
  signUpPath?: string;
}

export type SignInRouterRouteRegisterEvent<TLogic extends AnyActorLogic = AnyActorLogic> = BaseRouterRouteRegisterEvent<
  SignInRouterSystemId,
  TLogic
>;
export type SignInRouterRouteUnregisterEvent = BaseRouterRouteUnregisterEvent<SignInRouterSystemId>;

export type SignInRouterRouteEvents = SignInRouterRouteRegisterEvent | SignInRouterRouteUnregisterEvent;

export type SignInRouterNavigationEvents =
  | SignInRouterStartEvent
  | SignInRouterChooseStrategyEvent
  | SignInRouterForgotPasswordEvent
  | SignInRouterPrevEvent;

export type SignInRouterEvents =
  | SignInRouterInitEvent
  | SignInRouterNextEvent
  | SignInRouterNavigationEvents
  | SignInRouterErrorEvent
  | SignInRouterTransferEvent
  | SignInRouterRouteEvents
  | SignInRouterRedirectEvent
  | SignInVerificationFactorUpdateEvent;

// ---------------------------------- Context ---------------------------------- //

export interface SignInRouterContext extends BaseRouterContext {
  signUpPath: string;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInRouterSchema {
  context: SignInRouterContext;
  events: SignInRouterEvents;
  tags: SignInRouterTags;
}

// ---------------------------------- Schema ---------------------------------- //

export type SignInChildren = any; // TODO: Update
export type SignInOuptut = any; // TODO: Update
export type SignInStateValue = any; // TODO: Update

export type SignInRouterSnapshot = MachineSnapshot<
  SignInRouterContext,
  SignInRouterEvents,
  SignInChildren,
  SignInStateValue,
  SignInRouterTags,
  SignInOuptut
>;
