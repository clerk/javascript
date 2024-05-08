import type { SignInResource } from '@clerk/types';
import type { ActorRefFrom, MachineSnapshot, StateMachine } from 'xstate';

import type { TFormMachine } from '~/internals/machines/form';
import type {
  BaseRouterContext,
  BaseRouterErrorEvent,
  BaseRouterInput,
  BaseRouterLoadingEvent,
  BaseRouterNextEvent,
  BaseRouterPrevEvent,
  BaseRouterRedirectEvent,
  BaseRouterSetClerkEvent,
  BaseRouterStartEvent,
  BaseRouterTransferEvent,
} from '~/internals/machines/types';

import type { SignInVerificationFactorUpdateEvent } from './verification.types';

// ---------------------------------- Tags ---------------------------------- //

export const SignInRouterRoutes = {
  start: 'route:start',
  firstFactor: 'route:first-factor',
  secondFactor: 'route:second-factor',
  callback: 'route:callback',
  error: 'route:error',
  forgotPassword: 'route:forgot-password',
  resetPassword: 'route:reset-password',
  chooseStrategy: 'route:choose-strategy',
} as const;

export type SignInRouterRoutes = keyof typeof SignInRouterRoutes;
export type SignInRouterTags = (typeof SignInRouterRoutes)[keyof typeof SignInRouterRoutes];

// ---------------------------------- Children ---------------------------------- //

export const SignInRouterSystemId = {
  start: 'start',
  firstFactor: 'firstFactor',
  secondFactor: 'secondFactor',
  resetPassword: 'resetPassword',
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
export type SignInRouterLoadingEvent = BaseRouterLoadingEvent<'start' | 'verifications' | 'reset-password'>;
export type SignInRouterSetClerkEvent = BaseRouterSetClerkEvent;
export type SignInRouterSubmitEvent = { type: 'SUBMIT' };

export interface SignInRouterInitEvent extends BaseRouterInput {
  type: 'INIT';
  formRef: ActorRefFrom<TFormMachine>;
  signUpPath?: string;
}

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
  | SignInRouterRedirectEvent
  | SignInVerificationFactorUpdateEvent
  | SignInRouterLoadingEvent
  | SignInRouterSetClerkEvent
  | SignInRouterSubmitEvent;

// ---------------------------------- Context ---------------------------------- //

export type SignInRouterLoadingContext = Omit<SignInRouterLoadingEvent, 'type'>;

export interface SignInRouterContext extends BaseRouterContext {
  formRef: ActorRefFrom<TFormMachine>;
  loading: SignInRouterLoadingContext;
  signUpPath: string;
}

// ---------------------------------- Input ---------------------------------- //

export interface SignInRouterInput {
  // NOTE: Set in INIT event
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInRouterSchema {
  context: SignInRouterContext;
  events: SignInRouterEvents;
  tags: SignInRouterTags;
}

// ---------------------------------- Schema ---------------------------------- //

export type SignInRouterChildren = any; // TODO: Update
export type SignInRouterOuptut = any; // TODO: Update
export type SignInRouterStateValue = any; // TODO: Update

export type SignInRouterSnapshot = MachineSnapshot<
  SignInRouterContext,
  SignInRouterEvents,
  SignInRouterChildren,
  SignInRouterStateValue,
  SignInRouterTags,
  SignInRouterOuptut,
  any // TMeta - Introduced in XState 5.12.x
>;

// ---------------------------------- Machine Type ---------------------------------- //

export type TSignInRouterParentMachine = StateMachine<
  SignInRouterContext, // context
  SignInRouterEvents, // event
  SignInRouterChildren, // children
  any, // actor
  any, // action
  any, // guard
  any, // delay
  any, // state value
  string, // tag
  any, // input
  SignInRouterOuptut, // output
  any, // emitted
  any // meta
>;

// ---------------------------------- Machine Actor Ref ---------------------------------- //

export type SignInRouterMachineActorRef = ActorRefFrom<TSignInRouterParentMachine>;
