import type { SignUpResource } from '@clerk/shared/types';
import type { ActorRefFrom, SnapshotFrom, StateMachine } from 'xstate';

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

export const SignUpRouterSteps = {
  start: 'step:start',
  continue: 'step:continue',
  verification: 'step:verification',
  callback: 'step:callback',
  error: 'step:error',
  restricted: 'step:restricted',
} as const;

export type SignUpRouterSteps = keyof typeof SignUpRouterSteps;
export type SignUpRouterTags = (typeof SignUpRouterSteps)[keyof typeof SignUpRouterSteps];

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
export type SignUpRouterLoadingEvent = BaseRouterLoadingEvent<'start' | 'verifications' | 'continue'>;
export type SignUpRouterSetClerkEvent = BaseRouterSetClerkEvent;

export interface SignUpRouterInitEvent extends BaseRouterInput {
  type: 'INIT';
  formRef: ActorRefFrom<TFormMachine>;
  signInPath?: string;
}

export type SignUpRouterNavigationEvents = SignUpRouterStartEvent | SignUpRouterPrevEvent;

export type SignUpRouterEvents =
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

export type SignUpRouterChildren = any; // TODO: Update
export type SignUpRouterOuptut = any; // TODO: Update
export type SignUpRouterStateValue = any; // TODO: Update

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
  any, // meta - Introduced in XState 5.12.x
  any // config - Required in newer XState versions
>;

// ---------------------------------- Machine Actor Ref ---------------------------------- //

export type SignInRouterMachineActorRef = ActorRefFrom<TSignUpRouterParentMachine>;

// ---------------------------------- Snapshot ---------------------------------- //

export type SignUpRouterSnapshot = SnapshotFrom<TSignUpRouterParentMachine>;
