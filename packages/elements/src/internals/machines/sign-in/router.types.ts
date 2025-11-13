import type { SignInResource } from '@clerk/shared/types';
import type { ActorRefFrom, MachineSnapshot, StateMachine } from 'xstate';

import type { TFormMachine } from '~/internals/machines/form';
import type {
  BaseRouterContext,
  BaseRouterErrorEvent,
  BaseRouterFormAttachEvent,
  BaseRouterInput,
  BaseRouterLoadingEvent,
  BaseRouterNextEvent,
  BaseRouterPrevEvent,
  BaseRouterRedirectEvent,
  BaseRouterResetEvent,
  BaseRouterResetStepEvent,
  BaseRouterSetClerkEvent,
  BaseRouterStartEvent,
  BaseRouterTransferEvent,
} from '~/internals/machines/types';

import type { SignInVerificationFactorUpdateEvent } from './verification.types';

// ---------------------------------- Tags ---------------------------------- //

export const SignInRouterSteps = {
  start: 'step:start',
  verifications: 'step:verifications',
  firstFactor: 'step:first-factor',
  secondFactor: 'step:second-factor',
  callback: 'step:callback',
  error: 'step:error',
  forgotPassword: 'step:forgot-password',
  resetPassword: 'step:reset-password',
  chooseSession: 'step:choose-session',
  chooseStrategy: 'step:choose-strategy',
} as const;

export type SignInRouterSteps = keyof typeof SignInRouterSteps;
export type SignInRouterTags = (typeof SignInRouterSteps)[keyof typeof SignInRouterSteps];

// ---------------------------------- Children ---------------------------------- //

export const SignInRouterSystemId = {
  start: 'start',
  firstFactor: 'firstFactor',
  secondFactor: 'secondFactor',
  resetPassword: 'resetPassword',
} as const;

export type SignInRouterSystemId = keyof typeof SignInRouterSystemId;

// ---------------------------------- Events ---------------------------------- //

export type SignInRouterFormAttachEvent = BaseRouterFormAttachEvent;
export type SignInRouterNextEvent = BaseRouterNextEvent<SignInResource>;
export type SignInRouterStartEvent = BaseRouterStartEvent;
export type SignInRouterPrevEvent = BaseRouterPrevEvent;
export type SignInRouterChooseStrategyEvent = { type: 'NAVIGATE.CHOOSE_STRATEGY' };
export type SignInRouterForgotPasswordEvent = { type: 'NAVIGATE.FORGOT_PASSWORD' };
export type SignInRouterErrorEvent = BaseRouterErrorEvent;
export type SignInRouterTransferEvent = BaseRouterTransferEvent;
export type SignInRouterRedirectEvent = BaseRouterRedirectEvent;
export type SignInRouterResetEvent = BaseRouterResetEvent;
export type SignInRouterResetStepEvent = BaseRouterResetStepEvent;
export type SignInRouterLoadingEvent = BaseRouterLoadingEvent<
  'start' | 'verifications' | 'reset-password' | 'forgot-password' | 'choose-strategy'
>;
export type SignInRouterSetClerkEvent = BaseRouterSetClerkEvent;
export type SignInRouterSubmitEvent = { type: 'SUBMIT' };
export type SignInRouterPasskeyEvent = { type: 'AUTHENTICATE.PASSKEY' };
export type SignInRouterPasskeyAutofillEvent = {
  type: 'AUTHENTICATE.PASSKEY.AUTOFILL';
};
export type SignInRouterSessionSetActiveEvent = { type: 'SESSION.SET_ACTIVE'; id: string };

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
  | SignInRouterFormAttachEvent
  | SignInRouterInitEvent
  | SignInRouterNextEvent
  | SignInRouterNavigationEvents
  | SignInRouterErrorEvent
  | SignInRouterTransferEvent
  | SignInRouterRedirectEvent
  | SignInRouterResetEvent
  | SignInRouterResetStepEvent
  | SignInVerificationFactorUpdateEvent
  | SignInRouterLoadingEvent
  | SignInRouterSessionSetActiveEvent
  | SignInRouterSetClerkEvent
  | SignInRouterSubmitEvent
  | SignInRouterPasskeyEvent
  | SignInRouterPasskeyAutofillEvent;

// ---------------------------------- Context ---------------------------------- //

export type SignInRouterLoadingContext = Omit<SignInRouterLoadingEvent, 'type'>;

export interface SignInRouterContext extends BaseRouterContext {
  formRef: ActorRefFrom<TFormMachine>;
  loading: SignInRouterLoadingContext;
  signUpPath: string;
  webAuthnAutofillSupport: boolean;
  ticket: string | undefined;
}

// ---------------------------------- Input ---------------------------------- //

export type SignInRouterInput = object;

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
  any, // TMeta - Introduced in XState 5.12.x
  any // TConfig - Required in newer XState versions
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
  any, // meta
  any // config
>;

// ---------------------------------- Machine Actor Ref ---------------------------------- //

export type SignInRouterMachineActorRef = ActorRefFrom<TSignInRouterParentMachine>;
