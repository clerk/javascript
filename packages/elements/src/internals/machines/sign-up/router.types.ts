import type { SignUpResource } from '@clerk/types';
import type { ActorRefFrom, DoneActorEvent, ErrorActorEvent, SnapshotFrom, StateMachine } from 'xstate';

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

export type SignUpVerificationVerificationCategoryTags = 'verification:category:code' | 'verification:category:link';
export type SignUpVerificationVerificationMethodTags = 'verification:method:email' | 'verification:method:phone';
export type SignUpVerificationVerificationTypeTags =
  | 'verification:email_link'
  | 'verification:email_code'
  | 'verification:phone_code';

export type SignUpVerificationTags =
  | SignUpVerificationVerificationCategoryTags
  | SignUpVerificationVerificationMethodTags
  | SignUpVerificationVerificationTypeTags;

export type SignUpVerificationFriendlyTags = 'code' | 'email_link' | 'email_code' | 'phone_code';

export const SignUpRouterStates = {
  attempting: 'state:attempting',
  loading: 'state:loading',
  pending: 'state:pending',
  preparing: 'state:preparing',
  active: 'state:active',
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
  | SignUpVerificationTags
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
export type SignUpRouterVerificationRetryEvent = { type: 'RETRY' };
export type SignUpRouterSubmitEvent = { type: 'SUBMIT' };
export type SignUpRouterSetClerkEvent = BaseRouterSetClerkEvent;

export interface SignUpRouterInitEvent extends BaseRouterInput {
  type: 'INIT';
  formRef: ActorRefFrom<TFormMachine>;
  signInPath?: string;
}

export type SignUpRouterNavigationEvents = SignUpRouterStartEvent | SignUpRouterPrevEvent;

export type SignUpVerificationEmailLinkVerifiedEvent = { type: 'EMAIL_LINK.VERIFIED'; resource: SignUpResource };
export type SignUpVerificationEmailLinkUnverifiedEvent = { type: 'EMAIL_LINK.UNVERIFIED'; resource: SignUpResource };
export type SignUpVerificationEmailLinkExpiredEvent = { type: 'EMAIL_LINK.EXPIRED'; resource: SignUpResource };
export type SignUpVerificationEmailLinkTransferrableEvent = {
  type: 'EMAIL_LINK.TRANSFERRABLE';
  resource: SignUpResource;
};
export type SignUpVerificationEmailLinkRestartEvent = { type: 'EMAIL_LINK.RESTART' };
export type SignUpVerificationEmailLinkFailedEvent = {
  type: 'EMAIL_LINK.FAILED';
  resource: SignUpResource;
  error: Error;
};

export type SignUpVerificationSubmitEvent = { type: 'SUBMIT'; action: 'submit' };
export type SignUpVerificationNextEvent = { type: 'NEXT'; resource?: SignUpResource };
export type SignUpVerificationRetryEvent = { type: 'RETRY' };

export type SignUpVerificationEmailLinkEvent =
  | SignUpVerificationEmailLinkVerifiedEvent
  | SignUpVerificationEmailLinkUnverifiedEvent
  | SignUpVerificationEmailLinkExpiredEvent
  | SignUpVerificationEmailLinkRestartEvent
  | SignUpVerificationEmailLinkFailedEvent;

export type SignUpVerificationEvents =
  | DoneActorEvent
  | ErrorActorEvent
  | SignUpVerificationRetryEvent
  | SignUpVerificationSubmitEvent
  | SignUpVerificationNextEvent
  | SignUpVerificationEmailLinkEvent;

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
  | SignUpRouterVerificationRetryEvent
  | SignUpRouterSubmitEvent
  | SignUpVerificationEmailLinkVerifiedEvent
  | SignUpVerificationEmailLinkUnverifiedEvent
  | SignUpVerificationEmailLinkExpiredEvent
  | SignUpVerificationEmailLinkTransferrableEvent
  | SignUpVerificationEmailLinkRestartEvent
  | SignUpVerificationEmailLinkFailedEvent;

// ---------------------------------- Delays ---------------------------------- //

export const SignUpRouterDelays = {
  emailLinkTimeout: 300_000, // 5 minutes
  resendableTimeout: 1_000, // 1 second
  polling: 300_000, // 5 minutes
} as const;

export type SignUpRouterDelays = keyof typeof SignUpRouterDelays;

// ---------------------------------- Context ---------------------------------- //

export type SignUpRouterLoadingContext = Omit<SignUpRouterLoadingEvent, 'type'>;

export interface SignUpRouterContext extends BaseRouterContext {
  formRef: ActorRefFrom<TFormMachine>;
  loading: SignUpRouterLoadingContext;
  resendable: boolean;
  resendableAfter: number;
  resource: SignUpResource;
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
