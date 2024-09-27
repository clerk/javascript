import type { SignUpResource } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent, SnapshotFrom, StateMachine } from 'xstate';

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

// ---------------------------------- Tags ---------------------------------- //

export const SignUpRouterStates = {
  attempting: 'state:attempting',
  loading: 'state:loading',
  pending: 'state:pending',
  preparing: 'state:preparing',
} as const;

export const SignUpRouterSteps = {
  start: 'step:start',
  continue: 'step:continue',
  verification: 'step:verification',
  callback: 'step:callback',
  error: 'step:error',
} as const;

export type SignUpRouterStates = keyof typeof SignUpRouterStates;
export type SignUpRouterSteps = keyof typeof SignUpRouterSteps;

export type SignUpRouterTags =
  | (typeof SignUpRouterSteps)[keyof typeof SignUpRouterSteps]
  | (typeof SignUpRouterStates)[keyof typeof SignUpRouterStates];

// ---------------------------------- Children ---------------------------------- //

export const SignUpRouterSystemId = {
  start: 'start',
  continue: 'continue',
  verification: 'verification',
} as const;

export type SignUpRouterSystemId = keyof typeof SignUpRouterSystemId;

// ---------------------------------- Events ---------------------------------- //

export type SignUpRouterFormAttachEvent = BaseRouterFormAttachEvent;
export type SignUpRouterNextEvent = BaseRouterNextEvent<SignUpResource>;
export type SignUpRouterStartEvent = BaseRouterStartEvent;
export type SignUpRouterPrevEvent = BaseRouterPrevEvent;
export type SignUpRouterErrorEvent = BaseRouterErrorEvent;
export type SignUpRouterTransferEvent = BaseRouterTransferEvent;
export type SignUpRouterRedirectEvent = BaseRouterRedirectEvent;
export type SignUpRouterResetEvent = BaseRouterResetEvent;
export type SignUpRouterResetStepEvent = BaseRouterResetStepEvent;
// TODO: Omit invalid
export type SignUpRouterLoadingEvent = BaseRouterLoadingEvent<
  'start' | 'continue' | 'verifications' | 'reset-password' | 'forgot-password' | 'choose-strategy' | 'error'
>;
export type SignUpRouterSubmitEvent = { type: 'SUBMIT' };
export type SignUpRouterSetClerkEvent = BaseRouterSetClerkEvent;

export interface SignUpRouterInitEvent extends BaseRouterInput {
  type: 'INIT';
  formRef: ActorRefFrom<TFormMachine>;
  signInPath?: string;
}

export type SignUpRouterNavigationEvents = SignUpRouterStartEvent | SignUpRouterPrevEvent;

export type SignUpRouterEvents =
  | ErrorActorEvent
  | SignUpRouterFormAttachEvent
  | SignUpRouterInitEvent
  | SignUpRouterNextEvent
  | SignUpRouterNavigationEvents
  | SignUpRouterErrorEvent
  | SignUpRouterTransferEvent
  | SignUpRouterRedirectEvent
  | SignUpRouterResetEvent
  | SignUpRouterResetStepEvent
  | SignUpRouterLoadingEvent
  | SignUpRouterSetClerkEvent
  | SignUpRouterSubmitEvent;

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
  ticket: string | undefined;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpRouterSchema {
  context: SignUpRouterContext;
  events: SignUpRouterEvents;
  tags: SignUpRouterTags;
  delays: SignUpRouterDelays;
}

// ---------------------------------- Machine Type ---------------------------------- //

export type SignUpRouterChildren = any;
export type SignUpRouterOuptut = any;
export type SignUpRouterStateValue = any;

export type TSignUpRouterParentMachine = StateMachine<
  SignUpRouterContext, // context
  SignUpRouterEvents, // event
  SignUpRouterChildren, // children
  any, // actor
  any, // action
  any, // guard
  any, // delay
  SignUpRouterStateValue, // state value
  string, // tag
  any, // input
  SignUpRouterOuptut, // output
  any, // emitted
  any // meta - Introduced in XState 5.12.x
>;

// ---------------------------------- Machine Actor Ref ---------------------------------- //

export type SignInRouterMachineActorRef = ActorRefFrom<TSignUpRouterParentMachine>;

// ---------------------------------- Snapshot ---------------------------------- //

export type SignUpRouterSnapshot = SnapshotFrom<TSignUpRouterParentMachine>;
