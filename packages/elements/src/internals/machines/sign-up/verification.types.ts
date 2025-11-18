import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { Attributes, SignUpResource } from '@clerk/shared/types';
import type { ActorRefFrom, DoneActorEvent, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { SignInRouterMachineActorRef } from './router.types';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpVerificationStateTags = 'state:preparing' | 'state:pending' | 'state:attempting' | 'state:loading';

export type SignUpVerificationVerificationCategoryTags = 'verification:category:code' | 'verification:category:link';
export type SignUpVerificationVerificationMethodTags = 'verification:method:email' | 'verification:method:phone';
export type SignUpVerificationVerificationTypeTags =
  | 'verification:email_link'
  | 'verification:email_code'
  | 'verification:phone_code';

export type SignUpVerificationVerificationTags =
  | SignUpVerificationVerificationCategoryTags
  | SignUpVerificationVerificationMethodTags
  | SignUpVerificationVerificationTypeTags;

export type SignUpVerificationTags = SignUpVerificationStateTags | SignUpVerificationVerificationTags;
export type SignUpVerificationFriendlyTags = 'code' | 'email_link' | 'email_code' | 'phone_code';

// ---------------------------------- Events ---------------------------------- //

export type SignUpVerificationSubmitEvent = { type: 'SUBMIT'; action: 'submit' };
export type SignUpVerificationNextEvent = { type: 'NEXT'; resource?: SignUpResource };
export type SignUpVerificationRetryEvent = { type: 'RETRY' };

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

// ---------------------------------- Input ---------------------------------- //

export type SignUpVerificationInput = {
  attributes: Attributes | undefined;
  basePath?: string;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  resource: SignUpResource;
};

// ---------------------------------- Delays ---------------------------------- //

export const SignUpVerificationDelays = {
  emailLinkTimeout: 300_000, // 5 minutes
  resendableTimeout: 1_000, // 1 second
} as const;

export type SignUpVerificationDelays = keyof typeof SignUpVerificationDelays;

// ---------------------------------- Context ---------------------------------- //

export interface SignUpVerificationContext {
  attributes: Attributes | undefined;
  basePath: string;
  resource: SignUpResource;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  loadingStep: 'verifications';
  resendable: boolean;
  resendableAfter: number;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpVerificationSchema {
  context: SignUpVerificationContext;
  delays: SignUpVerificationDelays;
  input: SignUpVerificationInput;
  events: SignUpVerificationEvents;
  tags: SignUpVerificationTags;
}
