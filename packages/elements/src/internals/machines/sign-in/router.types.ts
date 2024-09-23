import type { SignInFactor, SignInResource } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent, MachineSnapshot, StateMachine } from 'xstate';

import type { TFormMachine } from '~/internals/machines/form';
import type { SignInStrategyName } from '~/internals/machines/shared';
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

// ---------------------------------- Tags ---------------------------------- //

export const SignInRouterStates = {
  attempting: 'state:attempting',
  loading: 'state:loading',
  pending: 'state:pending',
  chooseStrategy: 'state:choose-strategy', // TODO: Replace with 'step:choose-strategy'
  forgotPassword: 'state:forgot-password', // TODO: Replace with 'step:reset-password'
  preparing: 'state:preparing',
} as const;

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

export type SignInRouterStates = keyof typeof SignInRouterStates;
export type SignInRouterSteps = keyof typeof SignInRouterSteps;

export type SignInRouterTags =
  | (typeof SignInRouterSteps)[keyof typeof SignInRouterSteps]
  | (typeof SignInRouterStates)[keyof typeof SignInRouterStates];

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
export type SignInRouterChooseStrategyEvent = {
  type: 'NAVIGATE.CHOOSE_STRATEGY';
};
export type SignInRouterForgotPasswordEvent = {
  type: 'NAVIGATE.FORGOT_PASSWORD';
};
export type SignInRouterErrorEvent = BaseRouterErrorEvent;
export type SignInRouterTransferEvent = BaseRouterTransferEvent;
export type SignInRouterRedirectEvent = BaseRouterRedirectEvent;
export type SignInRouterResetEvent = BaseRouterResetEvent;
export type SignInRouterResetStepEvent = BaseRouterResetStepEvent;
export type SignInRouterLoadingEvent = BaseRouterLoadingEvent<
  'start' | 'verifications' | 'reset-password' | 'forgot-password' | 'choose-strategy' | 'error' | 'continue'
>;
export type SignInRouterSetClerkEvent = BaseRouterSetClerkEvent;
export type SignInRouterSubmitEvent = { type: 'SUBMIT' };
export type SignInRouterPasskeyEvent = { type: 'AUTHENTICATE.PASSKEY' };
export type SignInRouterPasskeyAutofillEvent = {
  type: 'AUTHENTICATE.PASSKEY.AUTOFILL';
};
export type SignInRouterSessionSetActiveEvent = {
  type: 'SESSION.SET_ACTIVE';
  id: string;
};

export type SignInVerificationSubmitEvent = { type: 'SUBMIT'; action: 'submit' };
export type SignInVerificationFactorUpdateEvent = { type: 'STRATEGY.UPDATE'; factor: SignInFactor | undefined };
export type SignInVerificationRetryEvent = { type: 'RETRY' };
export type SignInVerificationStrategyRegisterEvent = { type: 'STRATEGY.REGISTER'; factor: SignInStrategyName };
export type SignInVerificationStrategyUnregisterEvent = { type: 'STRATEGY.UNREGISTER'; factor: SignInStrategyName };

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
  | ErrorActorEvent
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
  | SignInRouterPasskeyAutofillEvent
  // Verifications
  | SignInVerificationSubmitEvent
  | SignInVerificationFactorUpdateEvent
  | SignInVerificationRetryEvent
  | SignInVerificationStrategyRegisterEvent
  | SignInVerificationStrategyUnregisterEvent;

// ---------------------------------- Context ---------------------------------- //

export type SignInRouterLoadingContext = Omit<SignInRouterLoadingEvent, 'type'>;

export interface SignInRouterContext extends BaseRouterContext {
  formRef: ActorRefFrom<TFormMachine>;
  loading: SignInRouterLoadingContext;
  signUpPath: string;
  webAuthnAutofillSupport: boolean;
  // resource?: SignInResource;

  // Verifications
  verificationCurrentFactor: SignInFactor | null;
  registeredStrategies: Set<SignInStrategyName>;
  resendable: boolean;
  resendableAfter: number;
}

// ---------------------------------- Input ---------------------------------- //

export interface SignInRouterInput {
  // NOTE: Set in INIT event
}

// ---------------------------------- Delays ---------------------------------- //

export const SignInRouterDelays = {
  resendableTimeout: 1_000, // 1 second
} as const;

export type SignInRouterDelays = keyof typeof SignInRouterDelays;

// ---------------------------------- Schema ---------------------------------- //

export interface SignInRouterSchema {
  context: SignInRouterContext;
  events: SignInRouterEvents;
  tags: SignInRouterTags;
}

// ---------------------------------- Schema ---------------------------------- //

export type SignInRouterChildren = any; // eslint-expect-error @typescript-eslint/no-redundant-type-constituents
export type SignInRouterOuptut = any; // eslint-expect-error @typescript-eslint/no-redundant-type-constituents
export type SignInRouterStateValue = any; // eslint-expect-error @typescript-eslint/no-redundant-type-constituents

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
  SignInRouterDelays, // delay
  any, // state value
  string, // tag
  any, // input
  SignInRouterOuptut, // output
  any, // emitted
  any // meta
>;

// ---------------------------------- Machine Actor Ref ---------------------------------- //

export type SignInRouterMachineActorRef = ActorRefFrom<TSignInRouterParentMachine>;
